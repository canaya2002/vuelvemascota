/**
 * Validaciones ligeras sin dependencias (no Zod para no imponer esa lib en
 * ambas apps). Para casos complejos cada app puede usar Zod si lo prefiere.
 */

import { ESTADOS_MX, isEstadoMx } from "./estados";
import type {
  CasoInput,
  CasoTipo,
  CasoEspecie,
  PerfilRol,
} from "./types";

export type ValidationError = {
  field: string;
  message: string;
};

const TIPOS: readonly CasoTipo[] = ["perdida", "encontrada", "avistamiento"];
const ESPECIES: readonly CasoEspecie[] = ["perro", "gato", "otro"];
const ROLES: readonly PerfilRol[] = [
  "dueño",
  "voluntario",
  "rescatista",
  "veterinaria",
  "aliado",
];

export function validateCasoInput(input: Partial<CasoInput>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!input.tipo || !TIPOS.includes(input.tipo)) {
    errors.push({ field: "tipo", message: "Selecciona un tipo" });
  }
  if (!input.especie || !ESPECIES.includes(input.especie)) {
    errors.push({ field: "especie", message: "Selecciona una especie" });
  }
  if (!input.fecha_evento) {
    errors.push({ field: "fecha_evento", message: "Indica la fecha" });
  }
  if (!input.ciudad) {
    errors.push({ field: "ciudad", message: "Indica la ciudad" });
  }
  if (!input.descripcion || input.descripcion.length < 10) {
    errors.push({
      field: "descripcion",
      message: "Cuéntanos al menos 10 caracteres",
    });
  }
  if (!input.contacto_nombre) {
    errors.push({ field: "contacto_nombre", message: "Agrega un nombre" });
  }
  if (
    !input.contacto_telefono &&
    !input.contacto_whatsapp &&
    !input.contacto_email
  ) {
    errors.push({
      field: "contacto_telefono",
      message: "Agrega al menos un medio de contacto",
    });
  }
  if (input.estado && !isEstadoMx(input.estado)) {
    errors.push({ field: "estado", message: "Estado inválido" });
  }
  if (input.lat != null && (input.lat < -90 || input.lat > 90)) {
    errors.push({ field: "lat", message: "Latitud inválida" });
  }
  if (input.lng != null && (input.lng < -180 || input.lng > 180)) {
    errors.push({ field: "lng", message: "Longitud inválida" });
  }
  return errors;
}

export function validateRol(rol: unknown): rol is PerfilRol {
  return typeof rol === "string" && (ROLES as readonly string[]).includes(rol);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePhoneMx(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

export { ESTADOS_MX, isEstadoMx };
