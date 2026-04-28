/**
 * Reporta un mensaje. Idempotente por (mensaje, reportador). 3+ distintos
 * → mensaje oculto + autor con shadow_until 24h.
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

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function POST(req: Request, { params }: { params: Params }) {
  const rl = await enforceRateLimit(req, "chat:report", { limit: 30, windowSec: 600 });
  if (rl) return rl;

  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  if (!me.usuarioId)
    return jsonErr(req, "no_user_row", "Tu cuenta no tiene perfil aún.", { status: 409 });

  const { id } = await params;
  const body = (await parseJson<{ motivo?: string }>(req)) ?? {};
  const result = await chatRepo.report(id, me.usuarioId, body.motivo);
  if (!result.ok) return jsonErr(req, "report_failed", "No se pudo reportar.", { status: 500 });

  return jsonOk(req, {
    reported: true,
    silenced: !!result.applied,
    total: result.total ?? 0,
  });
}

export { handleOptions as OPTIONS };
