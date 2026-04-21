"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { forosRepo, type ForoCategoria } from "./foros";
import { chatRepo, type ChatCanal } from "./chat";
import { db } from "./db";
import { FLAGS } from "./flags";
import { moderate } from "./moderation";

export type ForoActionState = {
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

async function resolveUsuarioId(): Promise<{
  clerkId: string | null;
  usuarioId: string | null;
  email: string | null;
  nombre: string | null;
}> {
  if (!FLAGS.auth)
    return { clerkId: null, usuarioId: null, email: null, nombre: null };
  const user = await currentUser();
  if (!user) return { clerkId: null, usuarioId: null, email: null, nombre: null };
  const primary =
    user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId) ||
    user.emailAddresses?.[0];
  const email = primary?.emailAddress ?? "";
  const nombre = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
  await db.upsertUser({ clerk_user_id: user.id, email, nombre });
  const row = await db.getUserByClerkId(user.id);
  return {
    clerkId: user.id,
    usuarioId: (row?.id as string | undefined) ?? null,
    email,
    nombre,
  };
}

/* ===================== FOROS ===================== */

export async function createHiloAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const ctx = await resolveUsuarioId();
  if (!ctx.clerkId) {
    return {
      ok: false,
      message: "Necesitas entrar con tu cuenta para publicar en el foro.",
    };
  }

  const titulo = str(formData, "titulo");
  const cuerpo = str(formData, "cuerpo");
  const categoria = str(formData, "categoria") as ForoCategoria | null;
  const ciudad = str(formData, "ciudad");

  if (!titulo || titulo.length < 6) {
    return {
      ok: false,
      message: "Ponle un título (mínimo 6 caracteres).",
      errors: { titulo: "Título muy corto" },
    };
  }
  if (!cuerpo || cuerpo.length < 20) {
    return {
      ok: false,
      message: "Desarrolla tu mensaje con al menos 20 caracteres.",
      errors: { cuerpo: "Escribe un poco más" },
    };
  }
  if (
    !categoria ||
    !["experiencias", "consejos", "rescates", "busqueda", "adopcion", "otros"].includes(
      categoria
    )
  ) {
    return {
      ok: false,
      message: "Elige una categoría válida.",
      errors: { categoria: "Categoría requerida" },
    };
  }

  // Moderación en ambos campos
  const modTitulo = await moderate(titulo, "foro", {
    minLength: 6,
    maxLength: 160,
    userId: ctx.clerkId,
  });
  if (!modTitulo.ok) {
    return { ok: false, message: modTitulo.reason, errors: { titulo: modTitulo.reason } };
  }
  const modCuerpo = await moderate(cuerpo, "foro", {
    minLength: 20,
    maxLength: 4000,
    requireTopic: true,
    userId: ctx.clerkId,
  });
  if (!modCuerpo.ok) {
    return { ok: false, message: modCuerpo.reason, errors: { cuerpo: modCuerpo.reason } };
  }

  const res = await forosRepo.createHilo({
    autor_usuario_id: ctx.usuarioId,
    titulo: modTitulo.clean,
    cuerpo: modCuerpo.clean,
    categoria,
    ciudad,
  });
  if (!res.ok) {
    return { ok: false, message: "No pudimos guardar el hilo. Intenta de nuevo." };
  }

  revalidatePath("/foros");
  revalidatePath(`/foros/${res.id}`);
  redirect(`/foros/${res.id}`);
}

export async function replyHiloAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const ctx = await resolveUsuarioId();
  if (!ctx.clerkId) {
    return { ok: false, message: "Necesitas entrar para responder." };
  }
  const hilo_id = str(formData, "hilo_id");
  const cuerpo = str(formData, "cuerpo");
  if (!hilo_id) return { ok: false, message: "Hilo inválido." };
  if (!cuerpo || cuerpo.length < 3) {
    return { ok: false, message: "Escribe al menos 3 caracteres." };
  }
  const mod = await moderate(cuerpo, "foro", {
    minLength: 3,
    maxLength: 4000,
    userId: ctx.clerkId,
  });
  if (!mod.ok) return { ok: false, message: mod.reason };

  const res = await forosRepo.createRespuesta({
    hilo_id,
    autor_usuario_id: ctx.usuarioId,
    cuerpo: mod.clean,
  });
  if (!res.ok) return { ok: false, message: "No pudimos guardar la respuesta." };

  revalidatePath(`/foros/${hilo_id}`);
  revalidatePath("/foros");
  return { ok: true, message: "Respuesta publicada." };
}

export async function reportForoAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const kind = str(formData, "kind") as "hilo" | "respuesta" | null;
  const id = str(formData, "id");
  if (!kind || !id) return { ok: false, message: "Parámetros inválidos." };
  await forosRepo.report(kind, id);
  return { ok: true, message: "Reporte enviado. Gracias por ayudar." };
}

/* ===================== CHAT ===================== */

export async function postChatAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const ctx = await resolveUsuarioId();
  if (!ctx.clerkId) {
    return {
      ok: false,
      message: "Necesitas entrar para chatear (evita suplantación).",
    };
  }
  const canal = (str(formData, "canal") as ChatCanal | null) ?? "general";
  if (!["general", "urgencias", "veterinarias", "rescatistas"].includes(canal)) {
    return { ok: false, message: "Canal inválido." };
  }
  const cuerpo = str(formData, "cuerpo");
  if (!cuerpo || cuerpo.length < 2) {
    return { ok: false, message: "Escribe un mensaje." };
  }
  const mod = await moderate(cuerpo, "chat", {
    minLength: 2,
    maxLength: 800,
    userId: ctx.clerkId,
  });
  if (!mod.ok) return { ok: false, message: mod.reason };

  await chatRepo.post({
    autor_usuario_id: ctx.usuarioId,
    autor_nombre: ctx.nombre,
    canal,
    cuerpo: mod.clean,
  });
  revalidatePath(`/chat/${canal}`);
  revalidatePath("/chat");
  return { ok: true, message: "Mensaje enviado." };
}

export async function reportChatAction(
  _prev: ForoActionState,
  formData: FormData
): Promise<ForoActionState> {
  const id = str(formData, "id");
  if (!id) return { ok: false, message: "Parámetros inválidos." };
  await chatRepo.report(id);
  return { ok: true, message: "Reporte enviado." };
}
