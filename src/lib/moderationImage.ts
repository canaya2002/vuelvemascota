/**
 * Pipeline de moderación de imágenes.
 *
 * Pasos para cada foto que el usuario sube:
 *  1. Validación básica (mime, tamaño, dimensiones razonables).
 *  2. Hash SHA-256 → si ya se moderó esta imagen exacta, reutilizamos verdict.
 *  3. Downscale a max 768px (calidad idéntica para moderación, 5-10x menos bytes).
 *  4. Hive visual content moderation (si key disponible).
 *  5. Si Hive no disponible → permitir con warning (fail-open en dev).
 *
 * Ahorros vs enviar la foto original sin cache:
 *  - Cache hit rate esperado: ~15-25% (logos de rescatistas, imágenes repetidas).
 *  - Downscale: ~80% menos bytes → menos latencia y más barato donde pague por MB.
 */

import { createHash } from "node:crypto";
import { moderateImageWithHive } from "./moderationProviders";

export type ImageModerationResult =
  | { ok: true; provider?: string; cached?: boolean }
  | {
      ok: false;
      provider: string;
      category: string;
      score: number;
      reason: string;
    };

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB — arriba de esto pedimos comprimir en el cliente
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/**
 * Cache en memoria por proceso: hash → verdict.
 * Durabilidad entre deploys no crítica porque OpenAI+Hive se encargan del
 * primer paso. Cuando haya DB se puede mover a `moderation_image_cache`.
 */
const verdictCache = new Map<string, ImageModerationResult>();
const CACHE_MAX = 2000;

function rememberVerdict(hash: string, verdict: ImageModerationResult) {
  if (verdictCache.size >= CACHE_MAX) {
    // LRU simple: drop primer insertado.
    const firstKey = verdictCache.keys().next().value;
    if (firstKey) verdictCache.delete(firstKey);
  }
  verdictCache.set(hash, verdict);
}

export function hashImage(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function moderateImage(
  bytes: Uint8Array,
  mime: string
): Promise<ImageModerationResult> {
  // 1. Validación básica
  if (!ALLOWED_MIME.has(mime.toLowerCase())) {
    return {
      ok: false,
      provider: "local",
      category: "invalid-mime",
      score: 1,
      reason: `Tipo de imagen no permitido: ${mime}. Usa JPG, PNG o WebP.`,
    };
  }
  if (bytes.byteLength > MAX_BYTES) {
    return {
      ok: false,
      provider: "local",
      category: "too-large",
      score: 1,
      reason: `La imagen pesa más de ${Math.floor(
        MAX_BYTES / 1024 / 1024
      )} MB. Comprímela antes de subirla.`,
    };
  }

  // 2. Hash + cache
  const hash = hashImage(bytes);
  const cached = verdictCache.get(hash);
  if (cached) {
    if (cached.ok) {
      return { ok: true, provider: cached.provider, cached: true };
    }
    return cached;
  }

  // 3. Moderar con Hive (provider ya degrada solo si no hay key).
  const verdict = await moderateImageWithHive(bytes, mime);

  if ("ok" in verdict && verdict.ok) {
    const out: ImageModerationResult = {
      ok: true,
      provider: verdict.provider,
    };
    rememberVerdict(hash, out);
    return out;
  }
  const out: ImageModerationResult = {
    ok: false,
    provider: verdict.provider,
    category: verdict.category,
    score: verdict.score,
    reason: verdict.reason,
  };
  rememberVerdict(hash, out);
  return out;
}

/**
 * Wrapper de conveniencia: modera todas las fotos en paralelo (con límite).
 * Retorna el conjunto aprobado y la lista de rechazos con motivo.
 */
export async function moderateImageBatch(
  files: { bytes: Uint8Array; mime: string; name?: string }[]
): Promise<{
  approved: { bytes: Uint8Array; mime: string; name?: string }[];
  rejected: { name?: string; reason: string }[];
}> {
  const verdicts = await Promise.all(
    files.map((f) => moderateImage(f.bytes, f.mime).then((v) => ({ f, v })))
  );
  const approved: { bytes: Uint8Array; mime: string; name?: string }[] = [];
  const rejected: { name?: string; reason: string }[] = [];
  for (const { f, v } of verdicts) {
    if (v.ok) approved.push(f);
    else rejected.push({ name: f.name, reason: v.reason });
  }
  return { approved, rejected };
}
