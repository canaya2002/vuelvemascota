/**
 * Sombras. Web usa CSS `box-shadow`; RN usa `shadowColor/Opacity/Offset/Radius`
 * o `elevation` en Android. Exportamos ambos formatos.
 */

export const shadowsWeb = {
  sm: "0 1px 2px rgba(10, 26, 43, 0.06), 0 1px 3px rgba(10, 26, 43, 0.04)",
  md: "0 4px 14px rgba(10, 26, 43, 0.08), 0 2px 6px rgba(10, 26, 43, 0.04)",
  lg: "0 20px 40px rgba(10, 26, 43, 0.12), 0 8px 16px rgba(10, 26, 43, 0.06)",
  glass:
    "0 8px 32px rgba(10, 26, 43, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
  brand: "0 10px 24px -10px rgba(225, 29, 72, 0.55)",
} as const;

export const shadowsNative = {
  sm: {
    shadowColor: "#0a1a2b",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: "#0a1a2b",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lg: {
    shadowColor: "#0a1a2b",
    shadowOpacity: 0.12,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
  },
  brand: {
    shadowColor: "#e11d48",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
} as const;
