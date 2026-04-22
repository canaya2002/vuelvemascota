/**
 * Babel config para Expo + NativeWind + Reanimated (SDK 53+).
 *
 * Orden importante:
 *  1. "babel-preset-expo" con jsxImportSource nativewind → habilita className.
 *  2. "nativewind/babel" → transforma className → style props.
 *  3. "react-native-worklets/plugin" **debe ser el último** del array.
 *     (En SDK 52 y anteriores era "react-native-reanimated/plugin"; desde
 *      SDK 53 Reanimated extrajo los worklets a un paquete propio.)
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ["react-native-worklets/plugin"],
  };
};
