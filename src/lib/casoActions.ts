"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { casosRepo, type CasoInput, type CasoEspecie, type CasoTipo, type CasoEstado } from "./casos";
import { alertasRepo } from "./alertas";
import { generateMatchesForCaso, changeMatchState, getMatchPair } from "./matching";
import { db } from "./db";
import { uploadPhoto, storageEnabled } from "./storage";
import { FLAGS } from "./flags";
import { SITE, CITIES } from "./site";
import { isEstadoMx } from "./estados";
import {
  alertaCasoNueva,
  avistamientoNotify,
  matchConfirmadoNotify,
  reencuentroCelebrar,
  sendEmail,
} from "./email";

export type CasoActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  slug?: string;
};

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function num(form: FormData, key: string): number | null {
  const s = str(form, key);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function bool(form: FormData, key: string): boolean | null {
  const s = str(form, key);
  if (s === "si") return true;
  if (s === "no") return false;
  return null;
}

function validate(data: Partial<CasoInput>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.tipo || !["perdida", "encontrada", "avistamiento"].includes(data.tipo))
    errors.tipo = "Selecciona un tipo";
  if (!data.especie || !["perro", "gato", "otro"].includes(data.especie))
    errors.especie = "Selecciona una especie";
  if (!data.fecha_evento) errors.fecha_evento = "Indica la fecha";
  if (!data.ciudad) errors.ciudad = "Indica la ciudad";
  if (!data.descripcion || data.descripcion.length < 10)
    errors.descripcion = "Cuéntanos al menos 10 caracteres";
  if (!data.contacto_nombre) errors.contacto_nombre = "Agrega un nombre";
  if (!data.contacto_telefono && !data.contacto_whatsapp && !data.contacto_email)
    errors.contacto_telefono = "Agrega al menos un medio de contacto";
  if (data.lat != null && (data.lat < -90 || data.lat > 90))
    errors.lat = "Latitud inválida";
  if (data.lng != null && (data.lng < -180 || data.lng > 180))
    errors.lng = "Longitud inválida";
  return errors;
}

export async function createCasoAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) {
    return {
      ok: false,
      message: "El sistema de cuentas aún no está activo en este entorno.",
    };
  }
  const user = await currentUser();
  if (!user) {
    return { ok: false, message: "Necesitas entrar para publicar un caso." };
  }

  const data: CasoInput = {
    tipo: (str(formData, "tipo") as CasoTipo) ?? "perdida",
    especie: (str(formData, "especie") as CasoEspecie) ?? "perro",
    nombre: str(formData, "nombre"),
    raza: str(formData, "raza"),
    color: str(formData, "color"),
    tamano: (str(formData, "tamano") as CasoInput["tamano"]) ?? null,
    edad_aprox: str(formData, "edad_aprox"),
    sexo: (str(formData, "sexo") as CasoInput["sexo"]) ?? null,
    senas: str(formData, "senas"),
    descripcion: str(formData, "descripcion"),
    fecha_evento: str(formData, "fecha_evento") ?? "",
    estado: (() => {
      const raw = str(formData, "estado");
      if (raw && isEstadoMx(raw)) return raw;
      // Auto-fill si la ciudad está en el catálogo.
      const ciudad = str(formData, "ciudad");
      const match = ciudad
        ? CITIES.find((c) => c.name.toLowerCase() === ciudad.toLowerCase())
        : null;
      return match ? match.state : null;
    })(),
    ciudad: str(formData, "ciudad") ?? "",
    municipio: str(formData, "municipio"),
    colonia: str(formData, "colonia"),
    lat: num(formData, "lat"),
    lng: num(formData, "lng"),
    radio_m: num(formData, "radio_m") ?? 2000,
    tiene_chip: bool(formData, "tiene_chip"),
    tiene_collar: bool(formData, "tiene_collar"),
    contacto_nombre: str(formData, "contacto_nombre"),
    contacto_telefono: str(formData, "contacto_telefono"),
    contacto_whatsapp: str(formData, "contacto_whatsapp"),
    contacto_email: str(formData, "contacto_email"),
  };

  const errors = validate(data);
  if (Object.keys(errors).length) {
    return { ok: false, message: "Revisa los campos marcados.", errors };
  }

  // Asegurar fila en usuarios (idempotente) usando el sync de Clerk.
  const primary =
    user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId) ||
    user.emailAddresses?.[0];
  await db.upsertUser({
    clerk_user_id: user.id,
    email: primary?.emailAddress ?? "",
    nombre: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
  });
  const usuario = await db.getUserByClerkId(user.id);
  const creadoPor = (usuario?.id as string | undefined) ?? null;

  const created = await casosRepo.create(data, { creadoPor });
  if (!created.ok) {
    return { ok: false, message: "No pudimos guardar el caso. Intenta de nuevo." };
  }

  // Subir fotos (si hay) — hasta 6.
  if (storageEnabled()) {
    const files = formData.getAll("fotos") as File[];
    const usable = files.filter((f) => f && f.size > 0).slice(0, 6);
    for (let i = 0; i < usable.length; i++) {
      const file = usable[i];
      const ext = (file.type.split("/")[1] || "jpg").toLowerCase();
      const name = `${crypto.randomUUID()}.${ext}`;
      const path = `${created.id}/${name}`;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const up = await uploadPhoto({ path, bytes, contentType: file.type || "image/jpeg" });
      if (up.ok) {
        await casosRepo.addPhoto(created.id, up.url, i);
      }
    }
  }

  // Notificación al dueño (si hay email).
  try {
    await sendEmail({
      to: primary?.emailAddress || SITE.contact.email,
      subject: `Caso publicado: ${created.slug}`,
      html: `
        <p>Tu caso ya está publicado en VuelveaCasa.</p>
        <p><a href="${SITE.url}/casos/${created.slug}">Ver caso</a></p>
        <p>Comparte este enlace con vecinos, grupos de WhatsApp y rescatistas de tu zona.</p>
      `,
      tag: "caso-creado",
    });
  } catch {
    /* ignore */
  }

  // Motor de alertas: notificar a usuarios con alerta activa en la zona.
  try {
    // Obtener la foto principal (si ya subida) para enriquecer el email.
    const full = await casosRepo.getBySlug(created.slug);
    const foto = full?.fotos?.[0]?.url ?? null;
    const matches = await alertasRepo.findMatchesForCaso({
      id: created.id,
      tipo: data.tipo,
      especie: data.especie,
      ciudad: data.ciudad,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
    });
    // Evitar auto-notificaciones al propio dueño.
    const ownEmail = primary?.emailAddress?.toLowerCase();
    const toSend = matches.filter(
      (m) => m.user_email && m.user_email.toLowerCase() !== ownEmail
    );
    for (const m of toSend) {
      const tpl = alertaCasoNueva(m.user_email, {
        suscriptorNombre: m.user_nombre,
        alertaId: m.id,
        caso: {
          slug: created.slug,
          tipo: data.tipo,
          especie: data.especie,
          nombre: data.nombre ?? null,
          ciudad: data.ciudad,
          colonia: data.colonia ?? null,
          descripcion: data.descripcion ?? null,
          foto,
        },
      });
      const sent = await sendEmail({
        to: tpl.to,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        tag: "alerta-zona",
      });
      await alertasRepo.markSent(m.id, created.id, "email", sent.ok);
    }
  } catch (err) {
    console.error("[alertas:dispatch:error]", err);
  }

  // Matching automático: busca casos complementarios recientes.
  try {
    await generateMatchesForCaso(created.id);
  } catch (err) {
    console.error("[matching:dispatch:error]", err);
  }

  revalidatePath("/casos");
  revalidatePath(`/casos/${created.slug}`);
  revalidatePath("/panel/casos");

  redirect(`/casos/${created.slug}?creado=1`);
}

/* -------- Moderación de avistamientos -------- */

export async function moderateAvistamientoAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Cuentas aún no activas." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };
  const id = str(formData, "avistamiento_id");
  const estado = str(formData, "estado") as
    | "confirmado"
    | "descartado"
    | null;
  if (!id || (estado !== "confirmado" && estado !== "descartado"))
    return { ok: false, message: "Parámetros inválidos." };
  const res = await casosRepo.moderateAvistamiento(user.id, id, estado);
  if (!res.ok)
    return {
      ok: false,
      message: "No pudimos actualizar (¿eres dueño o admin del caso?).",
    };
  if (res.casoSlug) {
    revalidatePath(`/casos/${res.casoSlug}`);
    revalidatePath(`/panel/casos/${res.casoSlug}`);
  }
  return {
    ok: true,
    message:
      estado === "confirmado"
        ? "Avistamiento confirmado."
        : "Avistamiento descartado.",
  };
}

/* -------- Meta de donación -------- */

export async function updateMetaAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Cuentas aún no activas." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };
  const slug = str(formData, "slug");
  const raw = str(formData, "meta_donacion");
  const meta =
    raw == null || raw === "" ? null : Math.max(0, Math.round(Number(raw)));
  if (!slug) return { ok: false, message: "Slug inválido." };
  const sql = db.raw;
  if (!sql) return { ok: true, message: "Guardado (modo demo)." };
  try {
    const rows = await sql`
      update casos c set meta_donacion = ${meta}
      from usuarios u
      where c.slug = ${slug}
        and c.creado_por = u.id
        and u.clerk_user_id = ${user.id}
      returning c.id
    `;
    if (rows.length === 0)
      return { ok: false, message: "No se pudo actualizar." };
  } catch (err) {
    console.error("[meta:error]", err);
    return { ok: false, message: "Error al guardar." };
  }
  revalidatePath(`/casos/${slug}`);
  revalidatePath(`/panel/casos/${slug}`);
  return { ok: true, message: "Meta actualizada." };
}

/* -------- Matches -------- */

export async function matchStateAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Cuentas aún no activas." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };
  const matchId = (formData.get("match_id") as string | null)?.trim();
  const estado = (formData.get("estado") as string | null)?.trim();
  const slug = (formData.get("slug") as string | null)?.trim();
  if (!matchId || (estado !== "confirmado" && estado !== "descartado")) {
    return { ok: false, message: "Parámetros inválidos." };
  }
  const res = await changeMatchState(matchId, user.id, estado);
  if (!res.ok) return { ok: false, message: "No pudimos actualizar el match." };

  if (estado === "confirmado") {
    try {
      const pair = await getMatchPair(matchId);
      if (pair) {
        const notifyEach = async (
          toSide: typeof pair.a,
          otherSide: typeof pair.b
        ) => {
          if (!toSide.owner_email) return;
          const tpl = matchConfirmadoNotify(toSide.owner_email, {
            ownNombre: toSide.owner_nombre,
            otherCaso: {
              slug: otherSide.slug,
              tipo: otherSide.tipo,
              ciudad: otherSide.ciudad,
              nombre: otherSide.nombre,
              especie: otherSide.especie,
              contacto_nombre: otherSide.contacto_nombre,
              contacto_telefono: otherSide.contacto_telefono,
              contacto_whatsapp: otherSide.contacto_whatsapp,
              contacto_email: otherSide.contacto_email,
            },
          });
          await sendEmail({
            to: tpl.to,
            subject: tpl.subject,
            html: tpl.html,
            text: tpl.text,
            tag: "match-confirmado",
          });
        };
        await notifyEach(pair.a, pair.b);
        await notifyEach(pair.b, pair.a);
      }
    } catch (err) {
      console.error("[match:confirm:notify:error]", err);
    }
  }

  if (slug) revalidatePath(`/panel/casos/${slug}`);
  return {
    ok: true,
    message:
      estado === "confirmado"
        ? "¡Match confirmado! Se envió email con los contactos mutuos."
        : "Match descartado.",
  };
}

/* -------- Avistamientos (anónimos o autenticados) -------- */

export async function addAvistamientoAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  const casoId = str(formData, "caso_id");
  const descripcion = str(formData, "descripcion");
  const fecha_avistado = str(formData, "fecha_avistado");
  if (!casoId || !descripcion || descripcion.length < 10) {
    return {
      ok: false,
      message: "Describe el avistamiento con al menos 10 caracteres.",
    };
  }
  if (!fecha_avistado) {
    return { ok: false, message: "Indica fecha del avistamiento." };
  }

  let autor_usuario_id: string | null = null;
  if (FLAGS.auth) {
    const user = await currentUser();
    if (user) {
      const row = await db.getUserByClerkId(user.id);
      autor_usuario_id = (row?.id as string | undefined) ?? null;
    }
  }

  const autor_nombre = str(formData, "autor_nombre");
  const autor_contacto = str(formData, "autor_contacto");

  const res = await casosRepo.addAvistamiento(casoId, {
    autor_usuario_id,
    autor_nombre,
    autor_contacto,
    lat: num(formData, "lat"),
    lng: num(formData, "lng"),
    fecha_avistado,
    descripcion,
  });
  if (!res.ok)
    return { ok: false, message: "No pudimos guardar el avistamiento." };

  // Notificar al dueño por email.
  try {
    const owner = await casosRepo.getOwnerEmailByCasoId(casoId);
    const sql = db.raw;
    if (owner?.email && sql) {
      const rows = (await sql`
        select slug, nombre, especie, ciudad from casos where id = ${casoId} limit 1
      `) as unknown as Array<{
        slug: string;
        nombre: string | null;
        especie: string;
        ciudad: string;
      }>;
      const info = rows[0];
      if (info?.slug) {
        const title =
          info.nombre || `${info.especie} en ${info.ciudad}`;
        const tpl = avistamientoNotify(owner.email, {
          ownerNombre: owner.nombre,
          casoSlug: info.slug,
          casoTitle: title,
          avistamiento: {
            descripcion,
            fecha_avistado,
            autor_nombre,
            autor_contacto,
          },
        });
        await sendEmail({
          to: tpl.to,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          tag: "avistamiento-nuevo",
        });
      }
    }
  } catch (err) {
    console.error("[avistamiento:notify:error]", err);
  }

  revalidatePath(`/casos/${str(formData, "caso_slug") || ""}`);

  return {
    ok: true,
    message: "¡Gracias! El avistamiento se registró y le avisamos al dueño.",
  };
}

/* -------- Sprint 2.2: edición y estados -------- */

export async function updateCasoAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Cuentas aún no activas." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };
  const slug = str(formData, "slug");
  if (!slug) return { ok: false, message: "Slug inválido." };

  const patch: Partial<CasoInput> = {
    nombre: str(formData, "nombre"),
    raza: str(formData, "raza"),
    color: str(formData, "color"),
    tamano: (str(formData, "tamano") as CasoInput["tamano"]) ?? null,
    edad_aprox: str(formData, "edad_aprox"),
    sexo: (str(formData, "sexo") as CasoInput["sexo"]) ?? null,
    senas: str(formData, "senas"),
    descripcion: str(formData, "descripcion"),
    estado: (() => {
      const raw = str(formData, "estado");
      return raw && isEstadoMx(raw) ? raw : null;
    })(),
    ciudad: str(formData, "ciudad") ?? undefined,
    municipio: str(formData, "municipio"),
    colonia: str(formData, "colonia"),
    lat: num(formData, "lat"),
    lng: num(formData, "lng"),
    radio_m: num(formData, "radio_m") ?? undefined,
    tiene_chip: bool(formData, "tiene_chip"),
    tiene_collar: bool(formData, "tiene_collar"),
    contacto_nombre: str(formData, "contacto_nombre"),
    contacto_telefono: str(formData, "contacto_telefono"),
    contacto_whatsapp: str(formData, "contacto_whatsapp"),
    contacto_email: str(formData, "contacto_email"),
  };

  const res = await casosRepo.updateBySlug(user.id, slug, patch);
  if (!res.ok)
    return {
      ok: false,
      message: "No pudimos actualizar (¿es tu caso? ¿hay conexión?).",
    };

  revalidatePath(`/casos/${slug}`);
  revalidatePath(`/panel/casos/${slug}`);
  revalidatePath("/panel/casos");
  return { ok: true, message: "Caso actualizado." };
}

export async function changeStateAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Cuentas aún no activas." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };
  const slug = str(formData, "slug");
  const estado = str(formData, "estado") as CasoEstado | null;
  if (!slug || !estado) return { ok: false, message: "Parámetros inválidos." };
  if (!["activo", "cerrado", "reencontrado", "archivado"].includes(estado))
    return { ok: false, message: "Estado inválido." };

  const res = await casosRepo.changeStateBySlug(user.id, slug, estado);
  if (!res.ok) return { ok: false, message: "No pudimos cambiar el estado." };

  // Email celebrando reencuentro.
  if (estado === "reencontrado") {
    try {
      const caso = await casosRepo.getMineBySlug(user.id, slug);
      if (caso) {
        const row = await db.getUserByClerkId(user.id);
        const email =
          (row?.email as string | undefined) ||
          user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
            ?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress;
        if (email) {
          const tpl = reencuentroCelebrar(email, {
            ownNombre: (row?.nombre as string | null | undefined) ?? null,
            casoSlug: caso.slug,
            mascotaNombre: caso.nombre ?? null,
            especie: caso.especie,
            ciudad: caso.ciudad,
          });
          await sendEmail({
            to: tpl.to,
            subject: tpl.subject,
            html: tpl.html,
            text: tpl.text,
            tag: "caso-reencontrado",
          });
        }
      }
    } catch (err) {
      console.error("[caso:reencuentro:notify:error]", err);
    }
  }

  revalidatePath(`/casos/${slug}`);
  revalidatePath(`/panel/casos/${slug}`);
  revalidatePath("/panel/casos");
  revalidatePath("/casos");
  return {
    ok: true,
    message:
      estado === "reencontrado"
        ? "¡Qué alegría! Caso marcado como reencontrado."
        : estado === "cerrado"
        ? "Caso cerrado."
        : estado === "archivado"
        ? "Caso archivado."
        : "Caso reabierto.",
  };
}

export async function deleteFotoAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Cuentas aún no activas." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };
  const fotoId = str(formData, "foto_id");
  const slug = str(formData, "slug");
  if (!fotoId) return { ok: false, message: "Foto inválida." };

  const res = await casosRepo.deletePhoto(user.id, fotoId);
  if (!res.ok) return { ok: false, message: "No pudimos borrar la foto." };

  if (slug) {
    revalidatePath(`/casos/${slug}`);
    revalidatePath(`/panel/casos/${slug}`);
  }
  return { ok: true, message: "Foto eliminada." };
}

export async function uploadFotosAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Cuentas aún no activas." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };
  const slug = str(formData, "slug");
  if (!slug) return { ok: false, message: "Caso inválido." };

  const caso = await casosRepo.getMineBySlug(user.id, slug);
  if (!caso) return { ok: false, message: "Caso no encontrado." };
  if (!storageEnabled())
    return { ok: false, message: "Upload de fotos no está configurado." };

  const existing = await casosRepo.countPhotos(caso.id);
  const slots = Math.max(0, 6 - existing);
  if (slots === 0)
    return { ok: false, message: "Alcanzaste el máximo de 6 fotos." };

  const files = (formData.getAll("fotos") as File[]).filter(
    (f) => f && f.size > 0
  );
  const usable = files.slice(0, slots);
  if (usable.length === 0)
    return { ok: false, message: "No seleccionaste fotos." };

  for (let i = 0; i < usable.length; i++) {
    const file = usable[i];
    const ext = (file.type.split("/")[1] || "jpg").toLowerCase();
    const name = `${crypto.randomUUID()}.${ext}`;
    const path = `${caso.id}/${name}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const up = await uploadPhoto({
      path,
      bytes,
      contentType: file.type || "image/jpeg",
    });
    if (up.ok) await casosRepo.addPhoto(caso.id, up.url, existing + i);
  }

  revalidatePath(`/casos/${slug}`);
  revalidatePath(`/panel/casos/${slug}`);
  return { ok: true, message: "Fotos agregadas." };
}

export async function addUpdateAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Auth requerido." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };

  const casoId = str(formData, "caso_id");
  const slug = str(formData, "slug");
  const mensaje = str(formData, "mensaje");
  if (!casoId || !mensaje || mensaje.length < 3)
    return { ok: false, message: "Escribe un mensaje." };

  const row = await db.getUserByClerkId(user.id);
  const autor_usuario_id = (row?.id as string | undefined) ?? null;
  await casosRepo.addUpdate(casoId, { autor_usuario_id, mensaje });

  if (slug) {
    revalidatePath(`/casos/${slug}`);
    revalidatePath(`/panel/casos/${slug}`);
  }
  return { ok: true, message: "Actualización publicada." };
}

/* -------- Alertas -------- */

export async function createAlertaAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Cuentas aún no activas." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };

  const ciudad = str(formData, "ciudad");
  const lat = num(formData, "lat");
  const lng = num(formData, "lng");
  if (!ciudad && (lat == null || lng == null)) {
    return {
      ok: false,
      message: "Elige una ciudad o un punto en el mapa.",
    };
  }

  // Asegurar fila en usuarios.
  const primary =
    user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId) ||
    user.emailAddresses?.[0];
  await db.upsertUser({
    clerk_user_id: user.id,
    email: primary?.emailAddress ?? "",
    nombre: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
  });

  // especies: múltiples checkbox con name="especies" value=perro/gato/otro
  const especiesRaw = formData.getAll("especies") as string[];
  const especies: CasoEspecie[] = (especiesRaw.length
    ? especiesRaw
    : ["perro", "gato", "otro"]
  ).filter((e): e is CasoEspecie =>
    ["perro", "gato", "otro"].includes(e)
  );

  const { alertasRepo } = await import("./alertas");
  const res = await alertasRepo.create(user.id, {
    ciudad,
    colonia: str(formData, "colonia"),
    lat,
    lng,
    radio_m: num(formData, "radio_m") ?? 3000,
    especies,
    canales: ["email"],
  });
  if (!res.ok) return { ok: false, message: "No pudimos crear la alerta." };
  revalidatePath("/panel/alertas");
  return { ok: true, message: "Alerta creada. Te avisaremos." };
}

export async function toggleAlertaAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Cuentas aún no activas." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };
  const id = str(formData, "alerta_id");
  const activa = str(formData, "activa") === "true";
  if (!id) return { ok: false, message: "Alerta inválida." };
  const { alertasRepo } = await import("./alertas");
  await alertasRepo.toggle(user.id, id, activa);
  revalidatePath("/panel/alertas");
  return { ok: true, message: activa ? "Alerta activada" : "Alerta pausada" };
}

export async function deleteAlertaAction(
  _prev: CasoActionState,
  formData: FormData
): Promise<CasoActionState> {
  if (!FLAGS.auth) return { ok: false, message: "Cuentas aún no activas." };
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };
  const id = str(formData, "alerta_id");
  if (!id) return { ok: false, message: "Alerta inválida." };
  const { alertasRepo } = await import("./alertas");
  await alertasRepo.deleteMine(user.id, id);
  revalidatePath("/panel/alertas");
  return { ok: true, message: "Alerta eliminada." };
}

