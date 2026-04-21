import { ESTADOS_MX } from "@/lib/estados";
import { handleOptions, jsonOk } from "@/lib/api";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET(req: Request) {
  return jsonOk(req, ESTADOS_MX, {
    cache: "public, max-age=86400, stale-while-revalidate=86400",
  });
}

export { handleOptions as OPTIONS };
