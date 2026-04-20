"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { aliadosRepo } from "./aliadosRepo";
import { db } from "./db";
import { sendEmail } from "./email";
import { SITE } from "./site";
import { FLAGS } from "./flags";

export type AdminActionState = { ok: boolean; message: string };

async function requireAdmin() {
  if (!FLAGS.auth) return null;
  const u = await currentUser();
  if (!u) return null;
  const meta = u.publicMetadata as { rol?: string } | undefined;
  if (meta?.rol !== "admin") return null;
  return u;
}

export async function verifyAliadoAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "No autorizado." };
  const id = (formData.get("aliado_id") as string | null)?.trim();
  const email = (formData.get("aliado_email") as string | null)?.trim();
  const org = (formData.get("aliado_org") as string | null)?.trim();
  if (!id) return { ok: false, message: "ID inválido." };

  const res = await aliadosRepo.verify(id);
  if (!res.ok) return { ok: false, message: "No pudimos verificar." };

  if (email && res.slug) {
    try {
      await sendEmail({
        to: email,
        subject: `¡${org || "Tu organización"} ya es aliada verificada!`,
        html: `
          <p>Validamos tu postulación.</p>
          <p>Perfil público: <a href="${SITE.url}/aliados/${res.slug}">${SITE.url}/aliados/${res.slug}</a></p>
          <p>Aparecerá en el directorio y puede ser contactada por la comunidad.</p>
        `,
        tag: "aliado-verificado",
      });
    } catch {
      /* ignore */
    }
  }

  revalidatePath("/panel/admin");
  revalidatePath("/aliados");
  return { ok: true, message: "Aliado verificado." };
}

export async function rejectAliadoAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "No autorizado." };
  const id = (formData.get("aliado_id") as string | null)?.trim();
  if (!id) return { ok: false, message: "ID inválido." };
  const res = await aliadosRepo.reject(id);
  if (!res.ok) return { ok: false, message: "No pudimos rechazar." };
  revalidatePath("/panel/admin");
  return { ok: true, message: "Aliado rechazado." };
}

export async function adminChangeCasoStateAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "No autorizado." };
  const slug = (formData.get("slug") as string | null)?.trim();
  const estado = (formData.get("estado") as string | null)?.trim();
  if (!slug || !estado) return { ok: false, message: "Parámetros inválidos." };
  if (!["activo", "cerrado", "reencontrado", "archivado"].includes(estado))
    return { ok: false, message: "Estado inválido." };
  const sql = db.raw;
  if (!sql) return { ok: true, message: "Guardado (modo demo)." };
  try {
    const rows = await sql`
      update casos set estado = ${estado} where slug = ${slug} returning id
    `;
    if (rows.length === 0) return { ok: false, message: "Caso no encontrado." };
  } catch (err) {
    console.error("[admin:state:error]", err);
    return { ok: false, message: "Error al guardar." };
  }
  revalidatePath(`/casos/${slug}`);
  revalidatePath("/casos");
  revalidatePath("/panel/admin");
  return { ok: true, message: `Caso marcado como ${estado}.` };
}

const VALID_ROLES = [
  "dueño",
  "voluntario",
  "rescatista",
  "veterinaria",
  "admin",
];

export async function adminChangeUserRoleAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "No autorizado." };
  const userId = (formData.get("user_id") as string | null)?.trim();
  const rol = (formData.get("rol") as string | null)?.trim();
  if (!userId || !rol) return { ok: false, message: "Parámetros inválidos." };
  if (!VALID_ROLES.includes(rol))
    return { ok: false, message: "Rol inválido." };
  const sql = db.raw;
  if (!sql) return { ok: true, message: "Guardado (modo demo)." };
  try {
    const rows = await sql`
      update usuarios set rol = ${rol} where id = ${userId} returning clerk_user_id
    `;
    if (rows.length === 0)
      return { ok: false, message: "Usuario no encontrado." };
    // Sincronizar a Clerk publicMetadata para mantener coherencia con el middleware/layout.
    const clerkId = (rows[0] as { clerk_user_id: string }).clerk_user_id;
    try {
      const clerkSecret = process.env.CLERK_SECRET_KEY;
      if (clerkSecret && clerkId) {
        await fetch(`https://api.clerk.com/v1/users/${clerkId}/metadata`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${clerkSecret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_metadata: { rol } }),
        });
      }
    } catch (err) {
      console.error("[clerk:metadata:error]", err);
    }
  } catch (err) {
    console.error("[admin:user:error]", err);
    return { ok: false, message: "Error al guardar." };
  }
  revalidatePath("/panel/admin/usuarios");
  return { ok: true, message: `Rol actualizado a ${rol}.` };
}

export async function adminToggleDestacadoAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "No autorizado." };
  const slug = (formData.get("slug") as string | null)?.trim();
  const destacado =
    (formData.get("destacado") as string | null)?.trim() === "true";
  if (!slug) return { ok: false, message: "Slug inválido." };
  const sql = db.raw;
  if (!sql) return { ok: true, message: "Guardado (modo demo)." };
  try {
    await sql`update casos set destacado = ${destacado} where slug = ${slug}`;
  } catch {
    return { ok: false, message: "Error al guardar." };
  }
  revalidatePath("/casos");
  revalidatePath(`/casos/${slug}`);
  revalidatePath("/panel/admin");
  return {
    ok: true,
    message: destacado ? "Caso destacado." : "Destacado removido.",
  };
}

