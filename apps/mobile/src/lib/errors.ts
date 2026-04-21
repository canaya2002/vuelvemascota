/**
 * Humanizador de errores de API + red → un string corto para mostrar en UI.
 * Todo lo que no reconocemos cae a un fallback genérico.
 */

import { ApiClientError } from "@vuelvecasa/api-client";

const friendly: Record<string, string> = {
  unauthenticated: "Inicia sesión para continuar.",
  unauthorized: "No tienes permiso para esta acción.",
  not_found: "No encontramos lo que buscabas.",
  rate_limited: "Demasiadas solicitudes. Espera un momento.",
  moderation_rejected: "El contenido no pasó la revisión automática.",
  validation: "Revisa los datos e inténtalo otra vez.",
  network: "Sin conexión. Revisa tu internet.",
  storage_disabled: "Subida de fotos temporalmente no disponible.",
  db_disabled: "Servicio no disponible. Intenta más tarde.",
};

export function errorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    return friendly[err.code] ?? err.message ?? "Algo salió mal.";
  }
  if (err instanceof Error) return err.message;
  return "Algo salió mal. Intenta de nuevo.";
}
