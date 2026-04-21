/**
 * Re-export del theme compartido con azúcar para RN. Así los componentes
 * importan desde `@/lib/theme` en lugar del paquete directo — más corto y
 * podemos inyectar overrides locales (modo dark, etc.) sin tocar los
 * paquetes compartidos.
 */

export { t, presets } from "@vuelvecasa/design-tokens";
export { colors } from "@vuelvecasa/design-tokens";
export { shadowsNative } from "@vuelvecasa/design-tokens";
