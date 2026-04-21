/**
 * Helpers para compartir desde la app. Usamos `Share` de RN (share sheet
 * nativo) para casos y hilos. Para compartir archivos/fotos locales usamos
 * `expo-sharing` (ej. exportar una imagen descargada).
 */

import { Share } from "react-native";
import * as Sharing from "expo-sharing";
import type { Caso } from "@vuelvecasa/shared";

export async function shareCaso(caso: Caso): Promise<void> {
  const tipo =
    caso.tipo === "perdida"
      ? "mascota perdida"
      : caso.tipo === "encontrada"
        ? "mascota encontrada"
        : "avistamiento";
  const nombre = caso.nombre ? `${caso.nombre} (${caso.especie})` : caso.especie;
  const url = `https://vuelvecasa.com/casos/${caso.slug}`;
  const message = `Ayúdame a difundir: ${tipo} — ${nombre} en ${caso.ciudad}.\n\n${url}`;
  try {
    await Share.share({ message, url, title: "VuelveaCasa" });
  } catch {
    /* user canceled */
  }
}

export async function shareUrl(url: string, title?: string): Promise<void> {
  try {
    await Share.share({ message: url, url, title: title ?? "VuelveaCasa" });
  } catch {
    /* noop */
  }
}

export async function shareFile(
  localUri: string,
  mimeType?: string
): Promise<void> {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) return;
    await Sharing.shareAsync(localUri, {
      mimeType,
      dialogTitle: "Compartir",
    });
  } catch {
    /* noop */
  }
}
