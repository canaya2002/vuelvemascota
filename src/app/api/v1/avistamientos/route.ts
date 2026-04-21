import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  resolveMe,
  parseJson,
  enforceRateLimit,
} from "@/lib/api";
import { casosRepo } from "@/lib/casos";
import { moderate } from "@/lib/moderation";
import { avistamientoNotify, sendEmail } from "@/lib/email";
import { db } from "@/lib/db";
import {
  buildCasoAlertaMessage,
  getExpoTokensForClerkUser,
  sendExpoPush,
} from "@/lib/pushExpo";

export const dynamic = "force-dynamic";

type Body = {
  caso_id?: string;
  caso_slug?: string;
  descripcion?: string;
  fecha_avistado?: string;
  lat?: number | null;
  lng?: number | null;
  autor_nombre?: string | null;
  autor_contacto?: string | null;
};

export async function POST(req: Request) {
  const rl = await enforceRateLimit(req, "avistamientos:create", {
    limit: 10,
    windowSec: 600,
  });
  if (rl) return rl;

  const body = await parseJson<Body>(req);
  if (!body) return jsonErr(req, "bad_json", "JSON inválido.", { status: 400 });

  // Acepta caso_id (UUID) o caso_slug. Si viene slug, lo resolvemos a id.
  let casoId = body.caso_id ?? null;
  if (!casoId && body.caso_slug) {
    const sql = db.raw;
    if (sql) {
      try {
        const rows = (await sql`
          select id from casos where slug = ${body.caso_slug} limit 1
        `) as unknown as Array<{ id: string }>;
        casoId = rows[0]?.id ?? null;
      } catch {
        /* noop */
      }
    }
  }
  if (!casoId) {
    return jsonErr(req, "missing", "Caso no encontrado.", { status: 404 });
  }
  if (!body.descripcion || body.descripcion.length < 10) {
    return jsonErr(
      req,
      "short",
      "Describe el avistamiento con al menos 10 caracteres.",
      { status: 422 }
    );
  }
  const fechaAvistado =
    body.fecha_avistado && body.fecha_avistado.length >= 10
      ? body.fecha_avistado
      : new Date().toISOString().slice(0, 10);

  // Puede ser anónimo; resolveMe returns null cuando no hay auth.
  const me = await resolveMe();
  const userKey = me?.clerkUserId ?? null;

  const mod = await moderate(body.descripcion, "avistamiento", {
    minLength: 10,
    userId: userKey,
  });
  if (!mod.ok) {
    return jsonErr(req, "moderation", mod.reason, { status: 422 });
  }

  const res = await casosRepo.addAvistamiento(casoId, {
    autor_usuario_id: me?.usuarioId ?? null,
    autor_nombre: body.autor_nombre ?? null,
    autor_contacto: body.autor_contacto ?? null,
    lat: typeof body.lat === "number" ? body.lat : null,
    lng: typeof body.lng === "number" ? body.lng : null,
    fecha_avistado: fechaAvistado,
    descripcion: mod.clean,
  });
  if (!res.ok) {
    return jsonErr(req, "db_error", "No pudimos guardar el avistamiento.", {
      status: 500,
    });
  }

  // Notificar al dueño en segundo plano (email + push a sus dispositivos).
  const casoIdFinal = casoId;
  queueMicrotask(async () => {
    try {
      const owner = await casosRepo.getOwnerEmailByCasoId(casoIdFinal);
      const sql = db.raw;
      if (!sql) return;
      const rows = (await sql`
        select c.slug, c.nombre, c.especie, c.ciudad, c.tipo,
               u.clerk_user_id as owner_clerk_id
        from casos c
        left join usuarios u on u.id = c.creado_por
        where c.id = ${casoIdFinal} limit 1
      `) as unknown as Array<{
        slug: string;
        nombre: string | null;
        especie: string;
        ciudad: string;
        tipo: "perdida" | "encontrada" | "avistamiento";
        owner_clerk_id: string | null;
      }>;
      const info = rows[0];
      if (!info?.slug) return;
      const title = info.nombre || `${info.especie} en ${info.ciudad}`;
      if (owner?.email) {
        const tpl = avistamientoNotify(owner.email, {
          ownerNombre: owner.nombre,
          casoSlug: info.slug,
          casoTitle: title,
          avistamiento: {
            descripcion: mod.clean,
            fecha_avistado: fechaAvistado,
            autor_nombre: body.autor_nombre ?? null,
            autor_contacto: body.autor_contacto ?? null,
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
      if (info.owner_clerk_id) {
        const tokens = await getExpoTokensForClerkUser(info.owner_clerk_id);
        if (tokens.length > 0) {
          const msgs = tokens.map((t) =>
            buildCasoAlertaMessage(t, {
              slug: info.slug,
              tipo: info.tipo,
              especie: info.especie,
              nombre: info.nombre,
              ciudad: info.ciudad,
            })
          );
          await sendExpoPush(
            msgs.map((m) => ({
              ...m,
              title: "👀 Nuevo avistamiento",
              body: `Alguien vio a ${title}.`,
            }))
          );
        }
      }
    } catch (err) {
      console.error("[api:avistamientos:notify]", err);
    }
  });

  void NextResponse;
  return jsonOk(req, { created: true }, { status: 201 });
}

export { handleOptions as OPTIONS };
