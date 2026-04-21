/**
 * Babel config para Expo + NativeWind + Reanimated.
 *
 * Orden importante:
 *  1. "babel-preset-expo" con jsxImportSource nativewind → habilita className.
 *  2. "nativewind/babel" → transforma className → style props.
 *  3. El plugin de Reanimated **debe ser el último** del array `plugins`.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin",
    ],
  };
};
