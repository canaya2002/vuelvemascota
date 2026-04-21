import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
} from "@/lib/api";
import { casosRepo, type CasoEstado } from "@/lib/casos";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function PATCH(
  req: Request,
  { params }: { params: Params }
) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  const { slug } = await params;
  const body = await parseJson<{ estado?: string }>(req);
  const estado = body?.estado as CasoEstado | undefined;
  if (
    !estado ||
    !["activo", "cerrado", "reencontrado", "archivado"].includes(estado)
  ) {
    return jsonErr(req, "invalid_state", "Estado inválido.", { status: 400 });
  }
  const res = await casosRepo.changeStateBySlug(me.clerkUserId, slug, estado);
  if (!res.ok) {
    return jsonErr(req, "forbidden", "No pudimos cambiar el estado.", {
      status: 403,
    });
  }
  return jsonOk(req, { estado });
}

export { handleOptions as OPTIONS };
