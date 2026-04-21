import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
  enforceRateLimit,
} from "@/lib/api";
import { forosRepo, CATEGORIAS, type ForoCategoria } from "@/lib/foros";
import { moderate } from "@/lib/moderation";

export const dynamic = "force-dynamic";

type Body = {
  titulo?: string;
  cuerpo?: string;
  categoria?: string;
  ciudad?: string | null;
};

export async function POST(req: Request) {
  const rl = await enforceRateLimit(req, "foros:create", {
    limit: 8,
    windowSec: 600,
  });
  if (rl) return rl;
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;

  const body = await parseJson<Body>(req);
  if (!body) return jsonErr(req, "bad_json", "JSON inválido.", { status: 400 });
  if (!body.titulo || body.titulo.length < 6)
    return jsonErr(req, "short_title", "Título muy corto.", { status: 422 });
  if (!body.cuerpo || body.cuerpo.length < 20)
    return jsonErr(req, "short_body", "Escribe al menos 20 caracteres.", {
      status: 422,
    });
  if (
    !body.categoria ||
    !(CATEGORIAS.map((c) => c.slug) as string[]).includes(body.categoria)
  )
    return jsonErr(req, "bad_category", "Categoría inválida.", { status: 422 });

  const modT = await moderate(body.titulo, "foro", {
    minLength: 6,
    maxLength: 160,
    userId: me.clerkUserId,
  });
  if (!modT.ok) return jsonErr(req, "moderation", modT.reason, { status: 422 });
  const modB = await moderate(body.cuerpo, "foro", {
    minLength: 20,
    maxLength: 4000,
    requireTopic: true,
    userId: me.clerkUserId,
  });
  if (!modB.ok) return jsonErr(req, "moderation", modB.reason, { status: 422 });

  const res = await forosRepo.createHilo({
    autor_usuario_id: me.usuarioId,
    titulo: modT.clean,
    cuerpo: modB.clean,
    categoria: body.categoria as ForoCategoria,
    ciudad: body.ciudad ?? null,
  });
  if (!res.ok)
    return jsonErr(req, "db_error", "No pudimos guardar el hilo.", { status: 500 });
  return jsonOk(req, { id: res.id, url: `/foros/${res.id}` }, { status: 201 });
}

export { handleOptions as OPTIONS };
