/**
 * Storage de fotos para casos.
 *
 * Usa Supabase Storage REST API directamente (sin añadir @supabase/supabase-js
 * como dependencia). Solo necesita 2 env vars:
 *
 *   SUPABASE_URL            (p.ej. https://xxxxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE   (service_role key, nunca expuesta al cliente)
 *
 * Bucket esperado: "casos" (público para lectura, uploads vía service_role).
 *   Crear en Supabase Dashboard → Storage → New bucket → "casos" → Public.
 *
 * Si las env vars no existen, `storageEnabled()` retorna false y el server
 * action de crear caso se guarda sin fotos (puede subirlas después).
 */

export const STORAGE_BUCKET = "casos";

export function storageEnabled() {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE;
}

export function publicUrl(pathInBucket: string) {
  if (!process.env.SUPABASE_URL) return "";
  return `${process.env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${pathInBucket}`;
}

export async function uploadPhoto(args: {
  path: string; // e.g. `casos/<casoId>/<uuid>.jpg`
  bytes: ArrayBuffer | Uint8Array;
  contentType: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!storageEnabled()) {
    return { ok: false, error: "storage-no-configurado" };
  }
  const base = process.env.SUPABASE_URL!.replace(/\/$/, "");
  const url = `${base}/storage/v1/object/${STORAGE_BUCKET}/${encodeURI(args.path)}`;
  try {
    const body: BodyInit =
      args.bytes instanceof Uint8Array
        ? (args.bytes as unknown as ArrayBuffer)
        : args.bytes;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": args.contentType,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
        "x-upsert": "true",
      },
      body,
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, error: txt || `upload-status-${res.status}` };
    }
    return { ok: true, url: publicUrl(args.path) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "upload-error",
    };
  }
}
