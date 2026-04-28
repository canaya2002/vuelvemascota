/**
 * Detalle, update y delete de una vista guardada.
 */

import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
} from "@/lib/api";
import { vistasRepo, type VistaFiltros } from "@/lib/vistas";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  const vista = await vistasRepo.get(id);
  if (!vista) return jsonErr(req, "not_found", "Vista no encontrada.", { status: 404 });
  if (vista.usuario_id !== me.usuarioId && !vista.publica)
    return jsonErr(req, "forbidden", "Esta vista es privada.", { status: 403 });
  return jsonOk(req, vista);
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId)
    return jsonErr(req, "no_user_row", "Tu cuenta no tiene perfil aún.", { status: 409 });

  const { id } = await params;
  const body = (await parseJson<{
    nombre?: string;
    filtros?: VistaFiltros;
    publica?: boolean;
  }>(req)) ?? {};

  const vista = await vistasRepo.update(id, me.usuarioId, body);
  if (!vista) return jsonErr(req, "not_found", "Vista no encontrada.", { status: 404 });
  return jsonOk(req, vista);
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId)
    return jsonErr(req, "no_user_row", "Tu cuenta no tiene perfil aún.", { status: 409 });

  const { id } = await params;
  await vistasRepo.remove(id, me.usuarioId);
  return jsonOk(req, { deleted: true });
}

export { handleOptions as OPTIONS };
