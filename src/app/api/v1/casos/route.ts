import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
  enforceRateLimit,
} from "@/lib/api";
import {
  casosRepo,
  type CasoEspecie,
  type CasoTipo,
  type CasoInput,
} from "@/lib/casos";
import { isEstadoMx } from "@/lib/estados";
import { CITIES, SITE } from "@/lib/site";
import { moderate } from "@/lib/moderation";
import { alertasRepo } from "@/lib/alertas";
import { generateMatchesForCaso } from "@/lib/matching";
import { alertaCasoNueva, sendEmail } from "@/lib/email";
import {
  buildCasoAlertaMessage,
  getExpoTokensForUsuario,
  sendExpoPush,
} from "@/lib/pushExpo";

export const dynamic = "force-dynamic";

/* -------------------------- GET list --------------------------- */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams;
  const tipo = (["perdida", "encontrada", "avistamiento"].includes(
    p.get("tipo") ?? ""
  )
    ? p.get("tipo")
    : undefined) as CasoTipo | undefined;
  const especie = (["perro", "gato", "otro"].includes(p.get("especie") ?? "")
    ? p.get("especie")
    : undefined) as CasoEspecie | undefined;
  const estadoRaw = p.get("estado") ?? "";
  const estado = estadoRaw && isEstadoMx(estadoRaw) ? estadoRaw : undefined;
  const ciudad = p.get("ciudad") ?? undefined;
  const municipio = p.get("municipio") ?? undefined;
  const q = (p.get("q") ?? "").trim() || undefined;
  const lat = Number(p.get("lat"));
  const lng = Number(p.get("lng"));
  const geoOn =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    (p.get("lat") ?? "") !== "";
  const radio_km = Math.max(1, Math.min(200, Number(p.get("radio_km") || 10)));
  const limit = Math.max(1, Math.min(60, Number(p.get("limit") || 24)));
  const offset = Math.max(0, Number(p.get("offset") || 0));

  const casos = await casosRepo.listPublic({
    tipo,
    especie,
    estado,
    ciudad: ciudad || undefined,
    municipio: municipio || undefined,
    q,
    lat: geoOn ? lat : undefined,
    lng: geoOn ? lng : undefined,
    radio_km: geoOn ? radio_km : undefined,
    limit,
    offset,
  });

  return jsonOk(req, casos, {
    meta: { count: casos.length, limit, offset },
    cache: "public, max-age=30, stale-while-revalidate=60",
  });
}

/* ------------------------- POST create ------------------------- */

type CreateCasoBody = Partial<CasoInput> & { photo_urls?: string[] };

export async function POST(req: Request) {
  const rl = await enforceRateLimit(req, "casos:create", {
    limit: 6,
    windowSec: 600,
  });
  if (rl) return rl;

  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;

  const body = await parseJson<CreateCasoBody>(req);
  if (!body) return jsonErr(req, "bad_json", "JSON inválido.", { status: 400 });

  const errors: Record<string, string> = {};
  if (
    !body.tipo ||
    !["perdida", "encontrada", "avistamiento"].includes(body.tipo)
  )
    errors.tipo = "Selecciona un tipo";
  if (!body.especie || !["perro", "gato", "otro"].includes(body.especie))
    errors.especie = "Selecciona una especie";
  if (!body.fecha_evento) errors.fecha_evento = "Indica la fecha";
  if (!body.ciudad) errors.ciudad = "Indica la ciudad";
  if (!body.descripcion || body.descripcion.length < 10)
    errors.descripcion = "Cuéntanos al menos 10 caracteres";
  if (!body.contacto_nombre) errors.contacto_nombre = "Agrega un nombre";
  if (!body.contacto_telefono && !body.contacto_whatsapp && !body.contacto_email)
    errors.contacto_telefono = "Agrega al menos un medio de contacto";
  if (Object.keys(errors).length) {
    return jsonErr(req, "validation", "Revisa los campos marcados.", {
      status: 422,
      fields: errors,
    });
  }

  // Moderación de textos
  if (body.descripcion) {
    const mod = await moderate(body.descripcion, "caso", {
      userId: me.clerkUserId,
    });
    if (!mod.ok) {
      return jsonErr(req, "moderation", mod.reason, {
        status: 422,
        fields: { descripcion: mod.reason },
      });
    }
    body.descripcion = mod.clean;
  }
  if (body.senas) {
    const mod = await moderate(body.senas, "caso", {
      minLength: 2,
      userId: me.clerkUserId,
    });
    if (!mod.ok) {
      return jsonErr(req, "moderation", mod.reason, {
        status: 422,
        fields: { senas: mod.reason },
      });
    }
    body.senas = mod.clean;
  }

  const data: CasoInput = {
    tipo: body.tipo as CasoTipo,
    especie: body.especie as CasoEspecie,
    nombre: body.nombre ?? null,
    raza: body.raza ?? null,
    color: body.color ?? null,
    tamano: (body.tamano as CasoInput["tamano"]) ?? null,
    edad_aprox: body.edad_aprox ?? null,
    sexo: (body.sexo as CasoInput["sexo"]) ?? null,
    senas: body.senas ?? null,
    descripcion: body.descripcion ?? null,
    fecha_evento: body.fecha_evento!,
    estado:
      body.estado && isEstadoMx(body.estado)
        ? body.estado
        : CITIES.find(
            (c) =>
              c.name.toLowerCase() === (body.ciudad ?? "").toLowerCase()
          )?.state ?? null,
    ciudad: body.ciudad!,
    municipio: body.municipio ?? null,
    colonia: body.colonia ?? null,
    lat: typeof body.lat === "number" ? body.lat : null,
    lng: typeof body.lng === "number" ? body.lng : null,
    radio_m: body.radio_m ?? 2000,
    tiene_chip: body.tiene_chip ?? null,
    tiene_collar: body.tiene_collar ?? null,
    contacto_nombre: body.contacto_nombre ?? null,
    contacto_telefono: body.contacto_telefono ?? null,
    contacto_whatsapp: body.contacto_whatsapp ?? null,
    contacto_email: body.contacto_email ?? null,
  };

  const created = await casosRepo.create(data, { creadoPor: me.usuarioId });
  if (!created.ok) {
    return jsonErr(req, "db_error", "No pudimos guardar el caso.", {
      status: 500,
    });
  }

  // Si la app ya subió fotos a Supabase y pasa URLs, las persistimos.
  // La moderación de imágenes se hace en el endpoint /api/v1/casos/:slug/fotos
  // cuando sube bytes raw. Aquí confiamos en que el cliente ya las moderó.
  // Validamos host: sólo aceptamos URLs servidas desde Supabase Storage o el
  // propio SITE.url. Esto bloquea inyección de enlaces externos (phishing,
  // tracking pixels, imágenes remotas que burlen la moderación).
  if (Array.isArray(body.photo_urls)) {
    const allowedHosts = new Set<string>();
    try {
      if (process.env.SUPABASE_URL) {
        allowedHosts.add(new URL(process.env.SUPABASE_URL).host);
      }
      allowedHosts.add(new URL(SITE.url).host);
    } catch {
      /* bad env — allowedHosts empty means nothing passes */
    }
    for (let i = 0; i < Math.min(body.photo_urls.length, 6); i++) {
      const url = body.photo_urls[i];
      if (typeof url !== "string") continue;
      let parsed: URL | null = null;
      try {
        parsed = new URL(url);
      } catch {
        continue;
      }
      if (parsed.protocol !== "https:") continue;
      if (!allowedHosts.has(parsed.host)) continue;
      try {
        await casosRepo.addPhoto(created.id, parsed.toString(), i);
      } catch {
        /* skip */
      }
    }
  }

  // Dispatch de alertas en segundo plano — no bloquea la respuesta.
  queueMicrotask(async () => {
    try {
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
      const ownEmail = me.email.toLowerCase();
      for (const m of matches) {
        if (!m.user_email || m.user_email.toLowerCase() === ownEmail) continue;
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

        // Push a cualquier dispositivo Expo que tenga el suscriptor activo.
        try {
          const tokens = await getExpoTokensForUsuario(m.usuario_id);
          if (tokens.length > 0) {
            const messages = tokens.map((t) =>
              buildCasoAlertaMessage(t, {
                slug: created.slug,
                tipo: data.tipo,
                especie: data.especie,
                nombre: data.nombre ?? null,
                ciudad: data.ciudad,
              })
            );
            const receipts = await sendExpoPush(messages);
            const ok = receipts.some((r) => r.status === "ok");
            await alertasRepo.markSent(m.id, created.id, "push", ok);
          }
        } catch (err) {
          console.error("[api:casos:dispatch:push]", err);
        }
      }
      await generateMatchesForCaso(created.id);
    } catch (err) {
      console.error("[api:casos:dispatch]", err);
    }
  });

  return jsonOk(
    req,
    { id: created.id, slug: created.slug, url: `/casos/${created.slug}` },
    { status: 201 }
  );
}

export { handleOptions as OPTIONS };
