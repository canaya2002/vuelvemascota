import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
  enforceRateLimit,
} from "@/lib/api";
import { chatRepo, CANALES, type ChatCanal } from "@/lib/chat";
import { moderate } from "@/lib/moderation";

export const dynamic = "force-dynamic";

type Params = Promise<{ canal: string }>;
type Body = { cuerpo?: string };

function isCanal(x: string): x is ChatCanal {
  return (CANALES.map((c) => c.slug) as string[]).includes(x);
}

export async function GET(req: Request, { params }: { params: Params }) {
  const { canal } = await params;
  if (!isCanal(canal))
    return jsonErr(req, "bad_canal", "Canal inválido.", { status: 400 });
  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 50)));
  const before = url.searchParams.get("before") || undefined;
  const mensajes = await chatRepo.list(canal, limit, before);
  return jsonOk(req, mensajes);
}

export async function POST(
  req: Request,
  { params }: { params: Params }
) {
  const rl = await enforceRateLimit(req, "chat:post", {
    limit: 30,
    windowSec: 60,
  });
  if (rl) return rl;
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  const { canal } = await params;
  if (!isCanal(canal))
    return jsonErr(req, "bad_canal", "Canal inválido.", { status: 400 });

  const body = await parseJson<Body>(req);
  if (!body?.cuerpo || body.cuerpo.length < 2) {
    return jsonErr(req, "short", "Escribe un mensaje.", { status: 422 });
  }
  const mod = await moderate(body.cuerpo, "chat", {
    minLength: 2,
    maxLength: 800,
    userId: me.clerkUserId,
  });
  if (!mod.ok) return jsonErr(req, "moderation", mod.reason, { status: 422 });

  await chatRepo.post({
    autor_usuario_id: me.usuarioId,
    autor_nombre: me.nombre,
    canal,
    cuerpo: mod.clean,
  });
  return jsonOk(req, { posted: true }, { status: 201 });
}

export { handleOptions as OPTIONS };
