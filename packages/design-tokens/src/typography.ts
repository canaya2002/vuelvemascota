/**
 * Sistema tipográfico. Las fuentes de la web son Plus Jakarta Sans
 * (sans) + Fraunces (display). En la app móvil cargamos las mismas vía
 * `expo-font` para consistencia visual.
 */

export const fonts = {
  sans: "PlusJakartaSans",
  display: "Fraunces",
  /** Fallbacks nativos cuando las fuentes custom aún no cargan. */
  fallbackSans:
    "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  fallbackDisplay: "ui-serif, Georgia, serif",
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 17,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
  "7xl": 72,
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const lineHeights = {
  tight: 1.06,
  snug: 1.15,
  normal: 1.35,
  relaxed: 1.5,
  loose: 1.7,
} as const;

export const letterSpacings = {
  tight: -0.025,
  normal: 0,
  wide: 0.04,
  wider: 0.12,
  widest: 0.18,
} as const;
