/**
 * Hilo de chat de un caso. Cualquier usuario autenticado puede leer; postear
 * pasa por moderación + reputación + shadow-ban.
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
import { casosRepo } from "@/lib/casos";
import { chatRepo } from "@/lib/chat";
import { moderate } from "@/lib/moderation";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const caso = await casosRepo.getBySlug(slug);
  if (!caso) return jsonErr(req, "not_found", "Caso no encontrado.", { status: 404 });

  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 50)));
  const before = url.searchParams.get("before") || undefined;

  const me = await requireAuth(req);
  const viewerId = me instanceof NextResponse ? null : me.usuarioId;

  const mensajes = await chatRepo.list(
    { caso_id: caso.id },
    limit,
    before,
    viewerId
  );
  return jsonOk(req, mensajes);
}

export async function POST(req: Request, { params }: { params: Params }) {
  const rl = await enforceRateLimit(req, "chat:caso", { limit: 10, windowSec: 60 });
  if (rl) return rl;

  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId)
    return jsonErr(req, "no_user_row", "Tu cuenta aún no tiene perfil. Recarga.", { status: 409 });

  const { slug } = await params;
  const caso = await casosRepo.getBySlug(slug);
  if (!caso) return jsonErr(req, "not_found", "Caso no encontrado.", { status: 404 });

  const body = (await parseJson<{ cuerpo?: string }>(req)) ?? {};
  if (!body.cuerpo || body.cuerpo.trim().length < 2) {
    return jsonErr(req, "short", "Escribe un mensaje.", { status: 422 });
  }

  const reputation = await chatRepo.checkReputation(me.usuarioId, {
    caso_id: caso.id,
  });
  if (!reputation.ok) {
    return jsonErr(req, "reputation", reputation.reason ?? "Sin permiso aún.", {
      status: 403,
    });
  }

  const mod = await moderate(body.cuerpo, "chat", {
    minLength: 2,
    maxLength: 800,
    userId: me.clerkUserId,
  });
  if (!mod.ok) return jsonErr(req, "moderation", mod.reason, { status: 422 });

  const shadowed = await chatRepo.isShadowed(me.usuarioId);

  const result = await chatRepo.post({
    autor_usuario_id: me.usuarioId,
    autor_nombre: me.nombre,
    caso_id: caso.id,
    cuerpo: mod.clean,
    oculto: shadowed,
  });

  return jsonOk(req, { posted: true, id: result.id, shadowed }, { status: 201 });
}

export { handleOptions as OPTIONS };
