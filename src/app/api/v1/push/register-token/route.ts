import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
} from "@/lib/api";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Body = {
  token?: string;
  platform?: "ios" | "android" | "web";
  device_name?: string | null;
};

/**
 * Registra un Expo Push Token para el usuario actual.
 * Guarda en `usuarios.expo_push_token` (columna opcional) y también en
 * `push_tokens` si la tabla existe (soporte multi-dispositivo futuro).
 */
export async function POST(req: Request) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;

  const body = await parseJson<Body>(req);
  if (!body?.token || body.token.length < 10) {
    return jsonErr(req, "missing_token", "Token inválido.", { status: 400 });
  }
  const token = body.token.trim();
  const platform =
    body.platform && ["ios", "android", "web"].includes(body.platform)
      ? body.platform
      : null;

  const sql = db.raw;
  if (!sql || !me.usuarioId) {
    return jsonOk(req, { saved: false, reason: "db-off" });
  }

  try {
    // Intentar guardar en columna dedicada (si existe).
    await sql`
      update usuarios
         set expo_push_token = ${token},
             expo_push_platform = ${platform}
       where id = ${me.usuarioId}
    `;
  } catch {
    // columna aún no creada — no es fatal.
  }

  // Insert multi-dispositivo en tabla dedicada (si existe).
  try {
    await sql`
      insert into push_tokens (usuario_id, token, platform, device_name, created_at)
      values (${me.usuarioId}, ${token}, ${platform}, ${body.device_name ?? null}, now())
      on conflict (token) do update set
        usuario_id = excluded.usuario_id,
        platform = coalesce(excluded.platform, push_tokens.platform),
        device_name = coalesce(excluded.device_name, push_tokens.device_name),
        updated_at = now()
    `;
  } catch {
    // tabla aún no creada — no es fatal.
  }

  return jsonOk(req, { saved: true });
}

export async function DELETE(req: Request) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  const sql = db.raw;
  if (!sql) return jsonOk(req, { deleted: true, reason: "db-off" });
  try {
    if (token) {
      await sql`delete from push_tokens where token = ${token} and usuario_id = ${me.usuarioId}`;
    } else if (me.usuarioId) {
      await sql`update usuarios set expo_push_token = null, expo_push_platform = null where id = ${me.usuarioId}`;
    }
  } catch {
    /* noop */
  }
  return jsonOk(req, { deleted: true });
}

export { handleOptions as OPTIONS };
