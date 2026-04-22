import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Mobile app and shared packages carry their own lint/typecheck configs.
    // The Next.js rule set here is not appropriate for Expo/Reanimated code.
    "apps/**",
    "packages/**",
  ]),
]);

export default eslintConfig;
