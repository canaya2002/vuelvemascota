/**
 * Metro bundler config — Expo SDK 53 en monorepo.
 *
 * Diseño:
 *  1. `watchFolders` incluye la raíz del monorepo para que Metro observe
 *     cambios en `packages/*` y haga hot-reload cuando editas api-client,
 *     shared o design-tokens en dev.
 *  2. `nodeModulesPaths` lista tanto el node_modules local como el de la
 *     raíz del monorepo (algunos paquetes se hoistean al root en dev).
 *  3. NO tocamos `disableHierarchicalLookup` — dejarlo en default (false)
 *     permite que Metro resuelva correctamente todas las deps transitivas.
 *     Con `install-links=true` en .npmrc los packages locales ya se copian
 *     a apps/mobile/node_modules, no hace falta aislamiento duro del lookup.
 *  4. `withNativeWind` envuelve la config y agrega el transformer de CSS.
 */

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  path.resolve(workspaceRoot, "packages"),
];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./global.css" });
