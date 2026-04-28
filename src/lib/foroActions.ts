"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { forosRepo, type ForoCategoria } from "./foros";
import { chatRepo, type ChatCanal } from "./chat";
import { casosRepo } from "./casos";
import { silenciasRepo } from "./silencias";
import { vistasRepo, type VistaFiltros } from "./vistas";
import { db } from "./db";
import { FLAGS } from "./flags";
import { moderate } from "./moderation";

export type ForoActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

async function resolveUsuarioId(): Promise<{
  clerkId: string | null;
  usuarioId: string | null;
  email: string | null;
  nombre: string | null;
}> {
  if (!FLAGS.auth)
    return { clerkId: null, usuarioId: null, email: null, nombre: null };
  const user = await currentUser();
  if (!user) return { clerkId: null, usuarioId: null, email: null, nombre: null };
  const primary =
    user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId) ||
    user.emailAddresses?.[0];
  const email = primary?.emailAddress ?? "";
  const nombre = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
  await db.upsertUser({ clerk_user_id: user.id, email, nombre });
  const row = await db.getUserByClerkId(user.id);
  return {
    clerkId: user.id,
    usuarioId: (row?.id as string | undefined) ?? null,
    email,
    nombre,
  };
}

/* ===================== FOROS ===================== */

export async function createHiloAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const ctx = await resolveUsuarioId();
  if (!ctx.clerkId) {
    return {
      ok: false,
      message: "Necesitas entrar con tu cuenta para publicar en el foro.",
    };
  }

  const titulo = str(formData, "titulo");
  const cuerpo = str(formData, "cuerpo");
  const categoria = str(formData, "categoria") as ForoCategoria | null;
  const ciudad = str(formData, "ciudad");

  if (!titulo || titulo.length < 6) {
    return {
      ok: false,
      message: "Ponle un título (mínimo 6 caracteres).",
      errors: { titulo: "Título muy corto" },
    };
  }
  if (!cuerpo || cuerpo.length < 20) {
    return {
      ok: false,
      message: "Desarrolla tu mensaje con al menos 20 caracteres.",
      errors: { cuerpo: "Escribe un poco más" },
    };
  }
  if (
    !categoria ||
    !["experiencias", "consejos", "rescates", "busqueda", "adopcion", "otros"].includes(
      categoria
    )
  ) {
    return {
      ok: false,
      message: "Elige una categoría válida.",
      errors: { categoria: "Categoría requerida" },
    };
  }

  // Moderación en ambos campos
  const modTitulo = await moderate(titulo, "foro", {
    minLength: 6,
    maxLength: 160,
    userId: ctx.clerkId,
  });
  if (!modTitulo.ok) {
    return { ok: false, message: modTitulo.reason, errors: { titulo: modTitulo.reason } };
  }
  const modCuerpo = await moderate(cuerpo, "foro", {
    minLength: 20,
    maxLength: 4000,
    requireTopic: true,
    userId: ctx.clerkId,
  });
  if (!modCuerpo.ok) {
    return { ok: false, message: modCuerpo.reason, errors: { cuerpo: modCuerpo.reason } };
  }

  const res = await forosRepo.createHilo({
    autor_usuario_id: ctx.usuarioId,
    titulo: modTitulo.clean,
    cuerpo: modCuerpo.clean,
    categoria,
    ciudad,
  });
  if (!res.ok) {
    return { ok: false, message: "No pudimos guardar el hilo. Intenta de nuevo." };
  }

  revalidatePath("/foros");
  revalidatePath(`/foros/${res.id}`);
  redirect(`/foros/${res.id}`);
}

export async function replyHiloAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const ctx = await resolveUsuarioId();
  if (!ctx.clerkId) {
    return { ok: false, message: "Necesitas entrar para responder." };
  }
  const hilo_id = str(formData, "hilo_id");
  const cuerpo = str(formData, "cuerpo");
  if (!hilo_id) return { ok: false, message: "Hilo inválido." };
  if (!cuerpo || cuerpo.length < 3) {
    return { ok: false, message: "Escribe al menos 3 caracteres." };
  }
  const mod = await moderate(cuerpo, "foro", {
    minLength: 3,
    maxLength: 4000,
    userId: ctx.clerkId,
  });
  if (!mod.ok) return { ok: false, message: mod.reason };

  const res = await forosRepo.createRespuesta({
    hilo_id,
    autor_usuario_id: ctx.usuarioId,
    cuerpo: mod.clean,
  });
  if (!res.ok) return { ok: false, message: "No pudimos guardar la respuesta." };

  revalidatePath(`/foros/${hilo_id}`);
  revalidatePath("/foros");
  return { ok: true, message: "Respuesta publicada." };
}

export async function reportForoAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const kind = str(formData, "kind") as "hilo" | "respuesta" | null;
  const id = str(formData, "id");
  if (!kind || !id) return { ok: false, message: "Parámetros inválidos." };
  await forosRepo.report(kind, id);
  return { ok: true, message: "Reporte enviado. Gracias por ayudar." };
}

/* ===================== CHAT ===================== */

export async function postChatAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const ctx = await resolveUsuarioId();
  if (!ctx.clerkId || !ctx.usuarioId) {
    return {
      ok: false,
      message: "Necesitas entrar para chatear (evita suplantación).",
    };
  }
  // Si trae caso_slug → posteo en hilo del caso. Si no, va al canal global.
  const casoSlug = str(formData, "caso_slug");
  let casoId: string | null = null;
  if (casoSlug) {
    const caso = await casosRepo.getBySlug(casoSlug);
    if (!caso) return { ok: false, message: "Caso no encontrado." };
    casoId = caso.id;
  }
  const canal = casoId ? null : "comunidad";

  const cuerpo = str(formData, "cuerpo");
  if (!cuerpo || cuerpo.length < 2) {
    return { ok: false, message: "Escribe un mensaje." };
  }

  const reputation = await chatRepo.checkReputation(ctx.usuarioId, {
    caso_id: casoId,
  });
  if (!reputation.ok)
    return { ok: false, message: reputation.reason ?? "Sin permiso aún." };

  const mod = await moderate(cuerpo, "chat", {
    minLength: 2,
    maxLength: 800,
    userId: ctx.clerkId,
  });
  if (!mod.ok) return { ok: false, message: mod.reason };

  const shadowed = await chatRepo.isShadowed(ctx.usuarioId);

  await chatRepo.post({
    autor_usuario_id: ctx.usuarioId,
    autor_nombre: ctx.nombre,
    caso_id: casoId,
    canal: canal as ChatCanal | null,
    cuerpo: mod.clean,
    oculto: shadowed,
  });
  if (casoSlug) revalidatePath(`/casos/${casoSlug}/chat`);
  else {
    revalidatePath("/chat/comunidad");
    revalidatePath("/chat");
  }
  return {
    ok: true,
    message: shadowed
      ? "Tu mensaje quedó oculto temporalmente por reportes recientes."
      : "Mensaje enviado.",
  };
}

export async function reportChatAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Parámetros inválidos." };
  const ctx = await resolveUsuarioId();
  if (!ctx.usuarioId)
    return { ok: false, message: "Inicia sesión para reportar." };
  const r = await chatRepo.report(id, ctx.usuarioId);
  return {
    ok: true,
    message: r.applied
      ? "Reporte enviado. El autor queda silenciado 24h."
      : "Reporte enviado. Gracias.",
  };
}

export async function silenciarUserAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const usuarioId = str(formData, "usuario_id");
  if (!usuarioId) return { ok: false, message: "Parámetros inválidos." };
  const ctx = await resolveUsuarioId();
  if (!ctx.usuarioId)
    return { ok: false, message: "Inicia sesión para silenciar." };
  await silenciasRepo.add(ctx.usuarioId, usuarioId);
  return { ok: true, message: "Silenciado. No verás sus mensajes." };
}

/* ===================== VISTAS ===================== */

export async function createVistaAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const ctx = await resolveUsuarioId();
  if (!ctx.usuarioId)
    return { ok: false, message: "Necesitas iniciar sesión." };

  const nombre = str(formData, "nombre");
  if (!nombre || nombre.length < 3 || nombre.length > 60)
    return { ok: false, message: "Nombre entre 3 y 60 caracteres." };

  const filtros: VistaFiltros = {};
  const especies = formData.getAll("especies").map(String).filter(Boolean);
  if (especies.length)
    filtros.especies = especies as VistaFiltros["especies"];
  const tipo = formData.getAll("tipo").map(String).filter(Boolean);
  if (tipo.length) filtros.tipo = tipo as VistaFiltros["tipo"];
  const ciudad = str(formData, "ciudad");
  if (ciudad) filtros.ciudad = ciudad;
  const colonia = str(formData, "colonia");
  if (colonia) filtros.colonia = colonia;
  const radioKm = Number(str(formData, "radio_km"));
  if (Number.isFinite(radioKm) && radioKm > 0) filtros.radio_km = radioKm;
  const recientes = Number(str(formData, "recientes_horas"));
  if (Number.isFinite(recientes) && recientes > 0)
    filtros.recientes_horas = recientes;
  if (str(formData, "solo_verificados")) filtros.solo_verificados = true;

  const publica = !!str(formData, "publica");

  const v = await vistasRepo.create(ctx.usuarioId, { nombre, filtros, publica });
  if (!v) return { ok: false, message: "No se pudo crear la vista." };
  revalidatePath("/chat");
  redirect(`/chat/vista/${v.id}`);
}

export async function deleteVistaAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const ctx = await resolveUsuarioId();
  if (!ctx.usuarioId) return { ok: false, message: "Inicia sesión." };
  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Parámetros inválidos." };
  await vistasRepo.remove(id, ctx.usuarioId);
  revalidatePath("/chat");
  redirect("/chat");
}
