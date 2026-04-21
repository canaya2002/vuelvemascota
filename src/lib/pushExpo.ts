/**
 * Expo Push API sender.
 *
 * Envíos en bulk al endpoint `https://exp.host/--/api/v2/push/send`. Soporta
 * hasta 100 tokens por request — si hay más, los partimos en chunks.
 *
 * No añadimos dep: usamos `fetch` nativo (Node 20+).
 *
 * Tokens inválidos (DeviceNotRegistered, MessageTooBig, InvalidCredentials)
 * los limpiamos de la tabla `push_tokens` automáticamente para no seguir
 * intentando.
 */

import { db } from "./db";

export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  /** Subtitle en iOS, ignorado en Android. */
  subtitle?: string;
  /** Categoría para iOS (para acciones rápidas). */
  categoryId?: string;
  /** Sound: "default" | null */
  sound?: "default" | null;
  /** Badge en iOS. */
  badge?: number;
  /** TTL en segundos. */
  ttl?: number;
  /** Canal Android (default: "default"). */
  channelId?: string;
  /** Prioridad — "high" para alertas urgentes. */
  priority?: "default" | "normal" | "high";
};

export type ExpoPushReceipt = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

function isExpoToken(token: unknown): token is string {
  if (typeof token !== "string") return false;
  return (
    token.startsWith("ExponentPushToken[") ||
    token.startsWith("ExpoPushToken[")
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function sendExpoPush(
  messages: ExpoPushMessage[]
): Promise<ExpoPushReceipt[]> {
  const valid = messages.filter((m) => isExpoToken(m.to));
  if (valid.length === 0) return [];

  const all: ExpoPushReceipt[] = [];
  for (const batch of chunk(valid, 100)) {
    try {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(batch),
      });
      if (!res.ok) {
        console.error("[pushExpo:http]", res.status, await res.text());
        continue;
      }
      const json = (await res.json()) as {
        data?: ExpoPushReceipt[];
        errors?: unknown;
      };
      if (Array.isArray(json.data)) {
        all.push(...json.data);
        for (let i = 0; i < json.data.length; i++) {
          const r = json.data[i];
          if (r.status === "error" && r.details?.error === "DeviceNotRegistered") {
            await removeInvalidToken(batch[i].to);
          }
        }
      }
    } catch (err) {
      console.error("[pushExpo:send]", err);
    }
  }
  return all;
}

async function removeInvalidToken(token: string) {
  const sql = db.raw;
  if (!sql) return;
  try {
    await sql`delete from push_tokens where token = ${token}`;
    await sql`
      update usuarios set expo_push_token = null, expo_push_platform = null
      where expo_push_token = ${token}
    `;
  } catch {
    /* noop */
  }
}

/** Lee todos los tokens activos de un usuario (multi-dispositivo). */
export async function getExpoTokensForUsuario(
  usuarioId: string
): Promise<string[]> {
  const sql = db.raw;
  if (!sql) return [];
  try {
    const rows = (await sql`
      select token from push_tokens where usuario_id = ${usuarioId}
    `) as unknown as Array<{ token: string }>;
    const dedup = new Set<string>();
    for (const r of rows) if (isExpoToken(r.token)) dedup.add(r.token);
    return [...dedup];
  } catch (err) {
    console.error("[pushExpo:read]", err);
    return [];
  }
}

/** Lee tokens por clerkUserId (útil si solo tenemos el JWT). */
export async function getExpoTokensForClerkUser(
  clerkUserId: string
): Promise<string[]> {
  const sql = db.raw;
  if (!sql) return [];
  try {
    const rows = (await sql`
      select pt.token
      from push_tokens pt
      join usuarios u on u.id = pt.usuario_id
      where u.clerk_user_id = ${clerkUserId}
    `) as unknown as Array<{ token: string }>;
    const dedup = new Set<string>();
    for (const r of rows) if (isExpoToken(r.token)) dedup.add(r.token);
    return [...dedup];
  } catch {
    return [];
  }
}

/** Atajo para armar un payload de alerta de caso nuevo. */
export function buildCasoAlertaMessage(
  token: string,
  caso: {
    slug: string;
    tipo: "perdida" | "encontrada" | "avistamiento";
    nombre: string | null;
    especie: string;
    ciudad: string;
  }
): ExpoPushMessage {
  const title =
    caso.tipo === "perdida"
      ? `🐾 ${caso.especie[0].toUpperCase() + caso.especie.slice(1)} perdido cerca de ti`
      : caso.tipo === "encontrada"
        ? `💛 Encontraron un ${caso.especie} en tu zona`
        : `👀 Avistamiento cerca de ti`;
  const body =
    caso.nombre ? `${caso.nombre} — ${caso.ciudad}` : `En ${caso.ciudad}`;
  return {
    to: token,
    title,
    body,
    sound: "default",
    priority: "high",
    ttl: 60 * 60 * 6,
    data: {
      url: `/casos/${caso.slug}`,
      casoSlug: caso.slug,
    },
  };
}
