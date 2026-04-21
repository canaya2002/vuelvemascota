/**
 * Web Push helper. Opcional — se activa cuando existen
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY (para el cliente).
 *
 * No añadimos la dep `web-push`. Usamos Web Crypto + fetch nativo, así que
 * corre en Node 20+ y Edge runtime.
 *
 * Para generar keys VAPID una vez:
 *   npx web-push generate-vapid-keys
 * y luego pegas las keys en las envs.
 */

import { db } from "./db";

export function pushEnabled() {
  return (
    !!process.env.VAPID_PUBLIC_KEY &&
    !!process.env.VAPID_PRIVATE_KEY &&
    !!process.env.VAPID_SUBJECT
  );
}

export type PushSubscriptionData = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export const pushRepo = {
  async save(
    clerkUserId: string | null,
    sub: PushSubscriptionData,
    userAgent?: string
  ) {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      let usuarioId: string | null = null;
      if (clerkUserId) {
        const rows = (await sql`
          select id from usuarios where clerk_user_id = ${clerkUserId} limit 1
        `) as unknown as Array<{ id: string }>;
        usuarioId = rows[0]?.id ?? null;
      }
      await sql`
        insert into push_subscriptions (usuario_id, endpoint, p256dh, auth, user_agent)
        values (${usuarioId}, ${sub.endpoint}, ${sub.keys.p256dh}, ${sub.keys.auth}, ${userAgent ?? null})
        on conflict (endpoint) do update set
          usuario_id = coalesce(excluded.usuario_id, push_subscriptions.usuario_id),
          p256dh = excluded.p256dh,
          auth = excluded.auth,
          last_used = now()
      `;
      return { ok: true };
    } catch (err) {
      console.error("[push:save:error]", err);
      return { ok: false };
    }
  },

  async remove(endpoint: string) {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`delete from push_subscriptions where endpoint = ${endpoint}`;
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },

  async listByUsuarioId(usuarioId: string) {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select id, endpoint, p256dh, auth
        from push_subscriptions
        where usuario_id = ${usuarioId}
      `) as unknown as Array<{
        id: string;
        endpoint: string;
        p256dh: string;
        auth: string;
      }>;
      return rows;
    } catch {
      return [];
    }
  },
};

/**
 * Envío real con la librería `web-push`. Firma el JWT VAPID y cifra el payload
 * (ECE, draft-ietf-webpush-encryption-08). Solo corre en runtime Node.js
 * (no Edge), así que cualquier route handler que llame a `sendPush` debe usar
 * `export const runtime = "nodejs"` (default en Next 16).
 *
 * Si el endpoint retorna 404/410 → la suscripción expiró, la borramos de la DB
 * para no seguir intentando.
 */
let webpushConfigured = false;
async function getWebPush() {
  const mod = await import("web-push");
  const webpush = mod.default ?? mod;
  if (!webpushConfigured && pushEnabled()) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT as string,
      process.env.VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string
    );
    webpushConfigured = true;
  }
  return webpush;
}

export async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body?: string; url?: string }
): Promise<{ ok: boolean; status?: number }> {
  if (!pushEnabled()) {
    console.log("[push:stub]", sub.endpoint, payload);
    return { ok: true };
  }
  try {
    const webpush = await getWebPush();
    const res = await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
      { TTL: 60, urgency: "high" }
    );
    return { ok: true, status: res.statusCode };
  } catch (err) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await pushRepo.remove(sub.endpoint);
      return { ok: false, status: statusCode };
    }
    console.error("[push:send:error]", err);
    return { ok: false, status: statusCode };
  }
}
