/**
 * Rate limiter híbrido:
 * - Si existen UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN → usa Upstash REST
 *   (atomic INCR + EXPIRE en pipeline, funciona en Edge Runtime).
 * - Si no → fallback en memoria por instancia (suficiente para fase 1 y dev).
 *
 * Ambos caminos usan ventanas fijas (fixed-window). No es lo más sofisticado pero
 * es robusto, barato y suficiente para formularios públicos.
 */

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAtMs: number;
};

type Bucket = { count: number; resetAt: number };
const memoryBuckets = new Map<string, Bucket>();

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const b = memoryBuckets.get(key);
  if (!b || b.resetAt < now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAtMs: now + windowMs };
  }
  b.count += 1;
  if (b.count > limit) {
    return { ok: false, remaining: 0, resetAtMs: b.resetAt };
  }
  return { ok: true, remaining: limit - b.count, resetAtMs: b.resetAt };
}

async function upstashLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const base = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  // Pipeline: INCR + EXPIRE (solo si el key era nuevo, con NX).
  const body = [
    ["INCR", key],
    ["EXPIRE", key, String(windowSec), "NX"],
    ["PTTL", key],
  ];
  try {
    const res = await fetch(`${base}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // Edge runtime: fetch es seguro, sin cache.
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`upstash-${res.status}`);
    const data = (await res.json()) as Array<{ result: number | string }>;
    const count = Number(data[0]?.result ?? 0);
    const pttl = Number(data[2]?.result ?? windowSec * 1000);
    const resetAtMs = Date.now() + Math.max(0, pttl);
    if (count > limit) return { ok: false, remaining: 0, resetAtMs };
    return { ok: true, remaining: Math.max(0, limit - count), resetAtMs };
  } catch (err) {
    // Falla silenciosa → degrada a memoria para no bloquear tráfico.
    console.error("[rate-limit:upstash:error]", err);
    return memoryLimit(key, limit, windowSec * 1000);
  }
}

export function rateLimitEnabled() {
  return !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
}

export async function checkRateLimit(
  key: string,
  opts: { limit: number; windowSec: number }
): Promise<RateLimitResult> {
  if (rateLimitEnabled()) {
    return upstashLimit(key, opts.limit, opts.windowSec);
  }
  return memoryLimit(key, opts.limit, opts.windowSec * 1000);
}
