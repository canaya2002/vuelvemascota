/**
 * Vistas guardadas — filtros nombrados creados por el usuario.
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
import { vistasRepo, type VistaFiltros } from "@/lib/vistas";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId) return jsonOk(req, []);
  const vistas = await vistasRepo.list(me.usuarioId);
  return jsonOk(req, vistas);
}

export async function POST(req: Request) {
  const rl = await enforceRateLimit(req, "vistas:create", { limit: 20, windowSec: 3600 });
  if (rl) return rl;

  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId)
    return jsonErr(req, "no_user_row", "Tu cuenta no tiene perfil aún.", { status: 409 });

  const body = (await parseJson<{
    nombre?: string;
    filtros?: VistaFiltros;
    publica?: boolean;
  }>(req)) ?? {};

  const nombre = (body.nombre ?? "").trim();
  if (nombre.length < 3 || nombre.length > 60)
    return jsonErr(req, "bad_nombre", "El nombre debe tener entre 3 y 60 caracteres.", { status: 422 });

  if (!body.filtros || typeof body.filtros !== "object")
    return jsonErr(req, "bad_filtros", "Filtros inválidos.", { status: 422 });

  const vista = await vistasRepo.create(me.usuarioId, {
    nombre,
    filtros: body.filtros,
    publica: !!body.publica,
  });
  if (!vista) return jsonErr(req, "create_failed", "No se pudo crear la vista.", { status: 500 });
  return jsonOk(req, vista, { status: 201 });
}

export { handleOptions as OPTIONS };
