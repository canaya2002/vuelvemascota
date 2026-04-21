import { handleOptions, jsonOk } from "@/lib/api";
import { forosRepo, CATEGORIAS, type ForoCategoria } from "@/lib/foros";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cat = url.searchParams.get("cat") as ForoCategoria | null;
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || 30)));
  const activeCat =
    cat && (CATEGORIAS.map((c) => c.slug) as string[]).includes(cat)
      ? cat
      : undefined;
  const hilos = await forosRepo.list({ categoria: activeCat, limit });
  return jsonOk(
    req,
    { categorias: CATEGORIAS, hilos },
    { cache: "public, max-age=15, stale-while-revalidate=60" }
  );
}

export { handleOptions as OPTIONS };
