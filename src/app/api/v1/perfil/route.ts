import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
} from "@/lib/api";
import { db } from "@/lib/db";
import { moderate } from "@/lib/moderation";
import { isEstadoMx } from "@/lib/estados";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;

  const sql = db.raw;
  if (!sql || !me.usuarioId) {
    return jsonOk(req, {
      nombre: me.nombre,
      ciudad: null,
      estado: null,
      rol: null,
      bio: null,
    });
  }
  try {
    const rows = (await sql`
      select nombre, ciudad, estado, rol, bio, foto_url, verificado
      from usuarios where id = ${me.usuarioId} limit 1
    `) as unknown as Array<Record<string, unknown>>;
    return jsonOk(req, rows[0] ?? {});
  } catch {
    return jsonErr(req, "db_error", "No pudimos leer tu perfil.", {
      status: 500,
    });
  }
}

type PatchBody = {
  nombre?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  rol?: string | null;
  bio?: string | null;
};

export async function PATCH(req: Request) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;

  const body = await parseJson<PatchBody>(req);
  if (!body) return jsonErr(req, "bad_json", "JSON inválido.", { status: 400 });

  const errors: Record<string, string> = {};
  if (body.nombre != null && body.nombre.length < 2)
    errors.nombre = "Nombre muy corto.";
  if (body.estado && !isEstadoMx(body.estado)) errors.estado = "Estado inválido.";
  if (
    body.rol &&
    !["dueño", "voluntario", "rescatista", "veterinaria", "aliado"].includes(
      body.rol
    )
  )
    errors.rol = "Rol inválido.";

  let bioClean: string | null | undefined = body.bio;
  if (body.bio) {
    const mod = await moderate(body.bio, "perfil", {
      minLength: 6,
      maxLength: 400,
      userId: me.clerkUserId,
      requireTopic: false,
    });
    if (!mod.ok) errors.bio = mod.reason;
    else bioClean = mod.clean;
  }

  if (Object.keys(errors).length) {
    return jsonErr(req, "validation", "Revisa los campos marcados.", {
      status: 422,
      fields: errors,
    });
  }

  await db.upsertUser({
    clerk_user_id: me.clerkUserId,
    email: me.email,
    nombre: body.nombre ?? me.nombre,
    ciudad: body.ciudad ?? null,
    rol: body.rol ?? null,
  });

  const sql = db.raw;
  if (sql) {
    try {
      await sql`
        update usuarios
           set estado = coalesce(${body.estado ?? null}, estado),
               bio    = coalesce(${bioClean ?? null}, bio)
         where clerk_user_id = ${me.clerkUserId}
      `;
    } catch {
      /* columna puede no existir */
    }
  }

  // Devolvemos el perfil actualizado para que el cliente pueda refrescar UI
  // sin re-fetch.
  let updated: Record<string, unknown> = {
    nombre: body.nombre ?? me.nombre ?? null,
    ciudad: body.ciudad ?? null,
    estado: body.estado ?? null,
    rol: body.rol ?? null,
    bio: bioClean ?? null,
    foto_url: null,
    verificado: false,
  };
  if (sql) {
    try {
      const rows = (await sql`
        select nombre, ciudad, estado, rol, bio, foto_url, verificado
        from usuarios where clerk_user_id = ${me.clerkUserId} limit 1
      `) as unknown as Array<Record<string, unknown>>;
      if (rows[0]) updated = rows[0];
    } catch {
      /* fallback al objeto armado localmente */
    }
  }
  return jsonOk(req, updated);
}

export { handleOptions as OPTIONS };
