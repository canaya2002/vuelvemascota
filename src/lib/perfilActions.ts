"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { FLAGS } from "./flags";
import { moderate } from "./moderation";
import { isEstadoMx } from "./estados";

export type PerfilActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function updatePerfilAction(
  _prev: PerfilActionState,
  formData: FormData
): Promise<PerfilActionState> {
  if (!FLAGS.auth) {
    return { ok: false, message: "El sistema de cuentas aún no está activo." };
  }
  const user = await currentUser();
  if (!user) return { ok: false, message: "Entra para continuar." };

  const nombre = str(formData, "nombre");
  const ciudad = str(formData, "ciudad");
  const estado = str(formData, "estado");
  const rol = str(formData, "rol");
  const bio = str(formData, "bio");

  const errors: Record<string, string> = {};
  if (!nombre || nombre.length < 2) errors.nombre = "Escribe tu nombre.";
  if (!ciudad) errors.ciudad = "Elige tu ciudad.";
  if (estado && !isEstadoMx(estado)) errors.estado = "Estado inválido.";
  if (
    rol &&
    !["dueño", "voluntario", "rescatista", "veterinaria", "aliado"].includes(rol)
  )
    errors.rol = "Rol inválido.";

  if (bio) {
    const mod = await moderate(bio, "perfil", {
      minLength: 6,
      maxLength: 400,
      userId: user.id,
      requireTopic: false,
    });
    if (!mod.ok) errors.bio = mod.reason;
  }

  if (Object.keys(errors).length) {
    return { ok: false, message: "Revisa los campos marcados.", errors };
  }

  const primary =
    user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId) ||
    user.emailAddresses?.[0];

  // Asegurar fila y actualizar campos relevantes
  await db.upsertUser({
    clerk_user_id: user.id,
    email: primary?.emailAddress ?? "",
    nombre: nombre ?? null,
    ciudad: ciudad ?? null,
    rol: rol ?? null,
  });

  // bio no está en la tabla canónica; la guardamos si existe columna (ignoramos si no)
  const sql = db.raw;
  if (sql && bio) {
    try {
      await sql`
        update usuarios set bio = ${bio} where clerk_user_id = ${user.id}
      `;
    } catch {
      // columna bio puede no existir; no crítico
    }
  }
  if (sql && estado) {
    try {
      await sql`
        update usuarios set estado = ${estado} where clerk_user_id = ${user.id}
      `;
    } catch {
      // columna estado puede no existir; no crítico
    }
  }

  revalidatePath("/panel");
  revalidatePath("/panel/perfil");
  revalidatePath("/panel/cuenta");
  return { ok: true, message: "Perfil actualizado. ¡Gracias!" };
}
