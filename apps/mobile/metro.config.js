/**
 * Metro bundler config. Dos cosas importantes para nuestro monorepo:
 *
 *  1. watchFolders: Metro necesita mirar fuera de apps/mobile para recoger los
 *     paquetes locales (@vuelvecasa/shared, design-tokens, api-client).
 *  2. nodeModulesPaths: permite que la resolución de módulos busque en el
 *     node_modules de la raíz del monorepo.
 *
 *  3. withNativeWind envuelve la config y agrega el transformer de CSS.
 */

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: "./global.css" });
