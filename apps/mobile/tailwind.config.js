/**
 * Tailwind config consumido por NativeWind.
 *
 * Importante: jalamos los tokens JS desde @vuelvecasa/design-tokens para
 * garantizar paridad visual con la web. Si mañana cambia el brand, cambia
 * en un solo lugar.
 */

const { colors } = require("../../packages/design-tokens/src/colors");
const { spacing } = require("../../packages/design-tokens/src/spacing");
const { radii } = require("../../packages/design-tokens/src/radii");
const { fontSizes, fontWeights } = require("../../packages/design-tokens/src/typography");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: colors.bg,
        "bg-alt": colors.bgAlt,
        "bg-deep": colors.bgDeep,
        surface: colors.surface,
        ink: colors.ink,
        "ink-soft": colors.inkSoft,
        muted: colors.muted,
        line: colors.line,
        "line-strong": colors.lineStrong,
        brand: {
          DEFAULT: colors.brand,
          ink: colors.brandInk,
          soft: colors.brandSoft,
          deep: colors.brandDeep,
        },
        accent: {
          DEFAULT: colors.accent,
          soft: colors.accentSoft,
        },
        sky: {
          DEFAULT: colors.sky,
          soft: colors.skySoft,
        },
        warn: {
          DEFAULT: colors.warn,
          soft: colors.warnSoft,
        },
        status: {
          active: colors.statusActive,
          found: colors.statusFound,
          sighting: colors.statusSighting,
        },
      },
      spacing,
      borderRadius: radii,
      fontSize: Object.fromEntries(
        Object.entries(fontSizes).map(([k, v]) => [k, `${v}px`])
      ),
      fontWeight: Object.fromEntries(
        Object.entries(fontWeights).map(([k, v]) => [k, String(v)])
      ),
      fontFamily: {
        sans: ["PlusJakartaSans", "System"],
        display: ["Fraunces", "System"],
      },
    },
  },
  plugins: [],
};
