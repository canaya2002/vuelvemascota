/**
 * Canal de chat global. En el rediseño 2026-04-27 todos los canales viejos
 * (general/urgencias/veterinarias/rescatistas) se mapean al canal único
 * 'comunidad', que tiene gate de reputación.
 *
 * El móvil ya no llama aquí — pero mantenemos el endpoint vivo para no
 * romper clientes legacy.
 */

import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
  enforceRateLimit,
} from "@/lib/api";
import { chatRepo } from "@/lib/chat";
import { moderate } from "@/lib/moderation";

export const dynamic = "force-dynamic";

type Params = Promise<{ canal: string }>;
type Body = { cuerpo?: string };

const ACEPTADOS = new Set([
  "comunidad",
  "general",
  "urgencias",
  "veterinarias",
  "rescatistas",
]);

export async function GET(req: Request, { params }: { params: Params }) {
  const { canal } = await params;
  if (!ACEPTADOS.has(canal))
    return jsonErr(req, "bad_canal", "Canal inválido.", { status: 400 });
  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 50)));
  const before = url.searchParams.get("before") || undefined;

  const me = await requireAuth(req);
  const viewerId = me instanceof NextResponse ? null : me.usuarioId;

  const mensajes = await chatRepo.list(
    { caso_id: null, canal: "comunidad" },
    limit,
    before,
    viewerId
  );
  return jsonOk(req, mensajes);
}

export async function POST(req: Request, { params }: { params: Params }) {
  const rl = await enforceRateLimit(req, "chat:comunidad", { limit: 3, windowSec: 3600 });
  if (rl) return rl;

  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId)
    return jsonErr(req, "no_user_row", "Tu cuenta no tiene perfil aún.", { status: 409 });

  const { canal } = await params;
  if (!ACEPTADOS.has(canal))
    return jsonErr(req, "bad_canal", "Canal inválido.", { status: 400 });

  const body = await parseJson<Body>(req);
  if (!body?.cuerpo || body.cuerpo.length < 2) {
    return jsonErr(req, "short", "Escribe un mensaje.", { status: 422 });
  }

  const reputation = await chatRepo.checkReputation(me.usuarioId, { caso_id: null });
  if (!reputation.ok)
    return jsonErr(req, "reputation", reputation.reason ?? "Sin permiso aún.", {
      status: 403,
    });

  const mod = await moderate(body.cuerpo, "chat", {
    minLength: 2,
    maxLength: 800,
    userId: me.clerkUserId,
  });
  if (!mod.ok) return jsonErr(req, "moderation", mod.reason, { status: 422 });

  const shadowed = await chatRepo.isShadowed(me.usuarioId);
  await chatRepo.post({
    autor_usuario_id: me.usuarioId,
    autor_nombre: me.nombre,
    canal: "comunidad",
    cuerpo: mod.clean,
    oculto: shadowed,
  });
  return jsonOk(req, { posted: true, shadowed }, { status: 201 });
}

export { handleOptions as OPTIONS };
