import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
  enforceRateLimit,
} from "@/lib/api";
import { forosRepo } from "@/lib/foros";
import { moderate } from "@/lib/moderation";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type Body = { cuerpo?: string };

export async function POST(
  req: Request,
  { params }: { params: Params }
) {
  const rl = await enforceRateLimit(req, "foros:reply", {
    limit: 20,
    windowSec: 600,
  });
  if (rl) return rl;
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;

  const { id } = await params;
  const body = await parseJson<Body>(req);
  if (!body?.cuerpo || body.cuerpo.length < 3) {
    return jsonErr(req, "short", "Escribe al menos 3 caracteres.", {
      status: 422,
    });
  }
  const mod = await moderate(body.cuerpo, "foro", {
    minLength: 3,
    maxLength: 4000,
    userId: me.clerkUserId,
  });
  if (!mod.ok) return jsonErr(req, "moderation", mod.reason, { status: 422 });

  const res = await forosRepo.createRespuesta({
    hilo_id: id,
    autor_usuario_id: me.usuarioId,
    cuerpo: mod.clean,
  });
  if (!res.ok)
    return jsonErr(req, "db_error", "No pudimos guardar la respuesta.", {
      status: 500,
    });
  return jsonOk(req, { posted: true }, { status: 201 });
}

export { handleOptions as OPTIONS };
