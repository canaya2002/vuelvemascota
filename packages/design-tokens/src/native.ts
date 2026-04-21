/**
 * Atajos pensados específicamente para React Native — consumir desde
 * componentes RN con `import { t } from "@vuelvecasa/design-tokens/native"`.
 *
 * El objetivo: que un botón primario, un título o una card queden
 * visualmente idénticos a la web sin tener que re-escribir los tokens.
 */

import { colors } from "./colors";
import { radii } from "./radii";
import { shadowsNative } from "./shadows";
import { spacing } from "./spacing";
import { fonts, fontSizes, fontWeights, lineHeights, letterSpacings } from "./typography";

export const t = {
  color: colors,
  radius: radii,
  shadow: shadowsNative,
  space: spacing,
  font: fonts,
  size: fontSizes,
  weight: fontWeights,
  leading: lineHeights,
  tracking: letterSpacings,
} as const;

/** Presets visuales equivalentes a las clases `vc-*` de la web. */
export const presets = {
  btnPrimary: {
    backgroundColor: colors.brand,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    borderRadius: radii.full,
    ...shadowsNative.brand,
  },
  btnPrimaryText: {
    color: colors.onBrand,
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.base,
  },
  btnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    borderRadius: radii.full,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.line,
    ...shadowsNative.sm,
  },
  cardGlass: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: radii.lg,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    ...shadowsNative.md,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: fontSizes["5xl"],
    fontWeight: fontWeights.bold,
    color: colors.ink,
    lineHeight: fontSizes["5xl"] * lineHeights.tight,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: fontSizes["3xl"],
    fontWeight: fontWeights.bold,
    color: colors.ink,
    lineHeight: fontSizes["3xl"] * lineHeights.snug,
  },
  h3: {
    fontFamily: fonts.display,
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    lineHeight: fontSizes["2xl"] * lineHeights.snug,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.base,
    color: colors.inkSoft,
    lineHeight: fontSizes.base * lineHeights.relaxed,
  },
  bodyInk: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.base,
    color: colors.ink,
    lineHeight: fontSizes.base * lineHeights.relaxed,
  },
  eyebrow: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.brandInk,
    letterSpacing: letterSpacings.wide,
    textTransform: "uppercase" as const,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radii.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontSize: fontSizes.base,
    color: colors.ink,
  },
} as const;
