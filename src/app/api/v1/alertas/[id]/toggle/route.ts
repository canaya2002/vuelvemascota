import { NextResponse } from "next/server";
import { handleOptions, jsonOk, jsonErr, requireAuth, parseJson } from "@/lib/api";
import { alertasRepo } from "@/lib/alertas";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function PATCH(
  req: Request,
  { params }: { params: Params }
) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  const body = await parseJson<{ activa?: boolean }>(req);
  if (typeof body?.activa !== "boolean") {
    return jsonErr(req, "missing", "Indica activa=true/false.", { status: 400 });
  }
  await alertasRepo.toggle(me.clerkUserId, id, body.activa);
  return jsonOk(req, { id, activa: body.activa });
}

export { handleOptions as OPTIONS };
