export const radii = {
  sm: 10,
  md: 14,
  lg: 22,
  xl: 28,
  "2xl": 36,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radii;
