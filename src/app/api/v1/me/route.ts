import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  type ApiErr,
} from "@/lib/api";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;

  const sql = db.raw;
  let profile: Record<string, unknown> = {
    clerk_user_id: me.clerkUserId,
    email: me.email,
    nombre: me.nombre,
    usuario_id: me.usuarioId,
    ciudad: null,
    estado: null,
    rol: null,
    bio: null,
    verificado: false,
  };

  if (sql && me.usuarioId) {
    try {
      const rows = (await sql`
        select id, email, nombre, ciudad, estado, rol, bio, verificado,
               created_at, foto_url, shadow_until, casos_verificados
        from usuarios where id = ${me.usuarioId} limit 1
      `) as unknown as Array<Record<string, unknown>>;
      if (rows[0]) {
        profile = { ...profile, ...rows[0], usuario_id: rows[0].id };
      }
    } catch {
      /* fallback */
    }
  }

  return jsonOk(req, profile);
}

export async function DELETE(req: Request) {
  // Account deletion flow — requerido por Apple App Store.
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;

  const sql = db.raw;
  if (!sql || !me.usuarioId) {
    // Sin DB, nada que borrar. Clerk hace su propio delete del lado de la app.
    return jsonOk(req, { deleted: true, note: "stub-no-db" });
  }
  try {
    // Anonimizamos en vez de borrar físicamente para preservar integridad
    // referencial (casos publicados, avistamientos, donaciones).
    await sql`
      update usuarios
         set nombre = null,
             email = concat('deleted-', id::text, '@removed.local'),
             ciudad = null, estado = null, rol = null, bio = null,
             telefono = null, foto_url = null,
             verificado = false
       where id = ${me.usuarioId}
    `;
    return jsonOk(req, { deleted: true });
  } catch (err) {
    console.error("[api:me:delete]", err);
    const out: ApiErr = {
      ok: false,
      error: {
        code: "db_error",
        message: "No pudimos eliminar tu cuenta. Intenta más tarde.",
      },
    };
    return jsonErr(req, out.error.code, out.error.message, { status: 500 });
  }
}

export { handleOptions as OPTIONS };
