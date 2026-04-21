import { handleOptions, jsonOk, jsonErr } from "@/lib/api";
import { forosRepo } from "@/lib/foros";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { hilo, respuestas } = await forosRepo.get(id);
  if (!hilo) return jsonErr(req, "not_found", "Hilo no encontrado.", { status: 404 });
  return jsonOk(req, { hilo, respuestas });
}

export { handleOptions as OPTIONS };
