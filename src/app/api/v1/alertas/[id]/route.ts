import { NextResponse } from "next/server";
import { handleOptions, jsonOk, jsonErr, requireAuth } from "@/lib/api";
import { alertasRepo } from "@/lib/alertas";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function DELETE(
  req: Request,
  { params }: { params: Params }
) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  const { id } = await params;
  if (!id) return jsonErr(req, "missing", "Alerta inválida.", { status: 400 });
  await alertasRepo.deleteMine(me.clerkUserId, id);
  return jsonOk(req, { deleted: true });
}

export { handleOptions as OPTIONS };
