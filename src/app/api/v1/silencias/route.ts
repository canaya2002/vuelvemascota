/**
 * Mute/block local. GET lista mis silenciados. POST agrega. DELETE remueve.
 */

import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
} from "@/lib/api";
import { silenciasRepo } from "@/lib/silencias";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId) return jsonOk(req, []);
  const ids = await silenciasRepo.list(me.usuarioId);
  return jsonOk(req, ids);
}

export async function POST(req: Request) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId)
    return jsonErr(req, "no_user_row", "Tu cuenta no tiene perfil aún.", { status: 409 });

  const body = (await parseJson<{ usuario_id?: string }>(req)) ?? {};
  if (!body.usuario_id)
    return jsonErr(req, "bad_input", "Falta usuario_id.", { status: 422 });

  const result = await silenciasRepo.add(me.usuarioId, body.usuario_id);
  if (!result.ok)
    return jsonErr(req, "silenciar_failed", "No se pudo silenciar.", { status: 500 });
  return jsonOk(req, { silenciado: true });
}

export async function DELETE(req: Request) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId)
    return jsonErr(req, "no_user_row", "Tu cuenta no tiene perfil aún.", { status: 409 });

  const url = new URL(req.url);
  const usuarioId = url.searchParams.get("usuario_id");
  if (!usuarioId)
    return jsonErr(req, "bad_input", "Falta usuario_id.", { status: 422 });

  await silenciasRepo.remove(me.usuarioId, usuarioId);
  return jsonOk(req, { silenciado: false });
}

export { handleOptions as OPTIONS };
