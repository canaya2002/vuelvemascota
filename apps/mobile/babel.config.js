/**
 * Babel config para Expo SDK 53 + NativeWind 4.1 + Reanimated 3.
 *
 * Orden importante:
 *  1. `babel-preset-expo` con `jsxImportSource: "nativewind"` → habilita el
 *     runtime de className vía la nueva API de React.
 *  2. `nativewind/babel` → transforma `className="..."` a style props RN
 *     (nativewind 4.1.x + css-interop 0.1.22 cargan react-native-reanimated/plugin
 *     internamente, compatible con Reanimated 3 built-in de SDK 53).
 *  3. `react-native-reanimated/plugin` **debe ser el último** del array.
 *     Reanimated 3.x trae los worklets nativos bundleados — por eso NO
 *     instalamos react-native-worklets separado (causaba duplicate symbols
 *     en el linker de iOS al conflictar con Reanimated).
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};
