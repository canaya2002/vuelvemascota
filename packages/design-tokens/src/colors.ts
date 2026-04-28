/**
 * Paleta oficial VuelveaCasa — versión "premium minimalista".
 *
 * Filosofía: paleta restrictiva (un solo acento de marca + neutrales cálidos
 * + estados funcionales). El "premium" sale del espacio negativo, la
 * tipografía y la jerarquía, no de gradientes multicolor.
 */

export const colors = {
  // --- Surfaces (cream casi blanco, neutral cálido) ---
  bg: "#f7f3ec",
  bgAlt: "#efe9dd",
  bgDeep: "#0e1827",
  surface: "#ffffff",

  // --- Ink scale (deep navy, mejor contraste que negro puro) ---
  ink: "#0e1827",
  inkSoft: "#2a374b",
  muted: "#6b7686",
  line: "#e6dfd0",
  lineStrong: "#cfc6b3",

  // --- Brand (rose granate sobrio, NO fucsia) ---
  brand: "#b8264a",
  brandInk: "#6e1530",
  brandSoft: "#fbe9ee",
  brandDeep: "#8e1b3a",

  // --- Estados funcionales (no decorativos) ---
  success: "#157a55",
  successSoft: "#e3f3eb",
  warn: "#a06000",
  warnSoft: "#fbeed1",

  // --- Aliases legacy (mapean nombres viejos al nuevo sistema) ---
  accent: "#157a55",
  accentSoft: "#e3f3eb",
  sky: "#2a374b",
  skySoft: "#efe9dd",

  // --- Estados en mapa/avistamiento ---
  statusActive: "#b8264a",
  statusFound: "#157a55",
  statusSighting: "#2a374b",

  // --- Overlays ---
  overlayDark: "rgba(14, 24, 39, 0.72)",
  overlayLight: "rgba(255, 255, 255, 0.88)",

  // --- Texto sobre fondos saturados ---
  onBrand: "#ffffff",
  onAccent: "#ffffff",
  onDark: "#ffffff",
} as const;

export type Color = keyof typeof colors;

/**
 * Mapping a CSS variables para que la web consuma los mismos valores
 * sin duplicación. Mantenemos las llaves --accent, --sky, --warn por compat.
 */
export const cssVars = {
  "--bg": colors.bg,
  "--bg-alt": colors.bgAlt,
  "--bg-deep": colors.bgDeep,
  "--surface": colors.surface,
  "--ink": colors.ink,
  "--ink-soft": colors.inkSoft,
  "--muted": colors.muted,
  "--line": colors.line,
  "--line-strong": colors.lineStrong,
  "--brand": colors.brand,
  "--brand-ink": colors.brandInk,
  "--brand-soft": colors.brandSoft,
  "--brand-deep": colors.brandDeep,
  "--accent": colors.accent,
  "--accent-soft": colors.accentSoft,
  "--sky": colors.sky,
  "--sky-soft": colors.skySoft,
  "--warn": colors.warn,
  "--warn-soft": colors.warnSoft,
} as const;
