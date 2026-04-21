/**
 * Paleta oficial VuelveaCasa.
 * Cambios aquí se propagan a web (via CSS vars wrapper) y app móvil.
 */

export const colors = {
  // Base surfaces
  bg: "#fbf7f1",
  bgAlt: "#fff0e4",
  bgDeep: "#0a1a2b",
  surface: "#ffffff",

  // Ink scale
  ink: "#0a1a2b",
  inkSoft: "#2b3e57",
  muted: "#5a6b82",
  line: "#ece3d6",
  lineStrong: "#d9ccb9",

  // Brand — rose cálido (reemplaza naranja histórico)
  brand: "#e11d48",
  brandInk: "#881337",
  brandSoft: "#ffe4e6",
  brandDeep: "#be123c",

  // Accent (verde cuidado)
  accent: "#10a079",
  accentSoft: "#d6fbec",

  // Sky — realces secundarios
  sky: "#0ea5e9",
  skySoft: "#e0f2fe",

  // Alert
  warn: "#e8a500",
  warnSoft: "#fff4d1",

  // Estados en mapa/avistamiento
  statusActive: "#e11d48",
  statusFound: "#10a079",
  statusSighting: "#0ea5e9",

  // Overlays
  overlayDark: "rgba(10, 26, 43, 0.72)",
  overlayLight: "rgba(255, 255, 255, 0.82)",

  // Texto sobre brand
  onBrand: "#ffffff",
  onAccent: "#ffffff",
  onDark: "#ffffff",
} as const;

export type Color = keyof typeof colors;

/**
 * Mapping a CSS variables para que la web consuma los mismos valores
 * sin duplicación (útil en globals.css overrides).
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
