/**
 * 32 entidades federativas de México. Nombre canónico (sin abreviación).
 * Se usan en el schema `casos.estado`, filtro de /casos, /aliados, etc.
 */

export const ESTADOS_MX = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
] as const;

export type EstadoMx = (typeof ESTADOS_MX)[number];

export function isEstadoMx(v: unknown): v is EstadoMx {
  return typeof v === "string" && (ESTADOS_MX as readonly string[]).includes(v);
}
