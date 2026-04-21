/**
 * Compresión de imágenes en el navegador usando Canvas. Sin dependencias.
 *
 * Objetivos:
 *  - Cumplir límite de Azure Content Safety (4 MB por imagen).
 *  - Reducir bytes subidos a Supabase Storage (ahorra egress + storage).
 *  - No degradar calidad visible: 1920px lado mayor + JPEG 85% es visualmente
 *    indistinguible del original para fotos de mascotas.
 *
 * Se llama solo en el cliente. En SSR/Node no importar.
 */

const DEFAULT_MAX_DIM = 1920;
const DEFAULT_QUALITY = 0.85;
const TARGET_MAX_BYTES = 3.5 * 1024 * 1024; // margen bajo el límite de Azure

export async function compressImage(
  file: File,
  opts?: { maxDim?: number; quality?: number }
): Promise<File> {
  // No comprimimos GIF (se pierde la animación) ni formatos no soportados.
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }
  // Si ya está por debajo del target, saltamos.
  if (file.size <= TARGET_MAX_BYTES) {
    return file;
  }

  const maxDim = opts?.maxDim ?? DEFAULT_MAX_DIM;
  const quality = opts?.quality ?? DEFAULT_QUALITY;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });
    if (!blob) return file;

    // Si por alguna razón la salida es más grande (imagen ya optimizada),
    // devolver la original.
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function compressBatch(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f)));
}
