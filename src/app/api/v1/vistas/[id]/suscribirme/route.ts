import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
} from "@/lib/api";
import { vistasRepo } from "@/lib/vistas";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function POST(req: Request, { params }: { params: Params }) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId)
    return jsonErr(req, "no_user_row", "Tu cuenta no tiene perfil aún.", { status: 409 });

  const { id } = await params;
  const vista = await vistasRepo.get(id);
  if (!vista || !vista.publica)
    return jsonErr(req, "not_found", "Vista no encontrada o privada.", { status: 404 });
  await vistasRepo.subscribe(id, me.usuarioId);
  return jsonOk(req, { suscrito: true });
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId)
    return jsonErr(req, "no_user_row", "Tu cuenta no tiene perfil aún.", { status: 409 });

  const { id } = await params;
  await vistasRepo.unsubscribe(id, me.usuarioId);
  return jsonOk(req, { suscrito: false });
}

export { handleOptions as OPTIONS };
