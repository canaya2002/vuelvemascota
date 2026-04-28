/**
 * Humanizador de errores de API + red → un string corto para mostrar en UI.
 * Todo lo que no reconocemos cae al `err.message` del backend (ya viene en
 * español) y, si tampoco hay, a un fallback genérico.
 */

import { ApiClientError } from "@vuelvecasa/api-client";

const friendly: Record<string, string> = {
  // --- Auth ---
  unauthenticated: "Inicia sesión para continuar.",
  unauthorized: "No tienes permiso para esta acción.",
  forbidden: "No tienes permiso para esta acción.",
  forbidden_or_missing: "No tienes permiso o el recurso ya no existe.",
  no_user_row: "Tu cuenta aún no tiene perfil. Recarga la app.",

  // --- Recursos ---
  not_found: "No encontramos lo que buscabas.",
  invalid_state: "El recurso no está en un estado válido para esta acción.",

  // --- Rate / red ---
  rate_limited: "Demasiadas solicitudes. Espera un momento.",
  network: "Sin conexión. Revisa tu internet.",

  // --- Moderación / reputación ---
  moderation: "El contenido no pasó la revisión automática.",
  moderation_rejected: "El contenido no pasó la revisión automática.",
  reputation: "Aún no tienes la reputación necesaria para esto. Confirma 3 casos o espera 7 días.",
  report_failed: "No pudimos registrar el reporte.",
  silenciar_failed: "No pudimos silenciar a este usuario.",

  // --- Validación ---
  validation: "Revisa los datos e inténtalo otra vez.",
  bad_input: "Revisa los datos e inténtalo otra vez.",
  bad_json: "Hubo un problema con la solicitud. Intenta de nuevo.",
  bad_canal: "Canal de chat inválido.",
  bad_category: "Categoría inválida.",
  bad_filtros: "Los filtros tienen un formato inválido.",
  bad_nombre: "El nombre debe tener entre 3 y 60 caracteres.",
  short: "Tu mensaje es muy corto.",
  short_body: "El cuerpo del mensaje es muy corto.",
  short_title: "El título es muy corto.",
  missing: "Falta un campo obligatorio.",
  missing_token: "Falta el token de autenticación.",

  // --- Subida / DB ---
  no_files: "No se subieron fotos.",
  max_photos: "Llegaste al máximo de fotos permitidas.",
  storage_disabled: "Subida de fotos temporalmente no disponible.",
  db_error: "Servicio no disponible. Intenta más tarde.",
  db_disabled: "Servicio no disponible. Intenta más tarde.",
  create_failed: "No se pudo crear. Intenta de nuevo.",
};

export function errorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    return friendly[err.code] ?? err.message ?? "Algo salió mal.";
  }
  if (err instanceof Error) return err.message;
  return "Algo salió mal. Intenta de nuevo.";
}
