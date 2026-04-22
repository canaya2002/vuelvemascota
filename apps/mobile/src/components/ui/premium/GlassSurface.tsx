import { type ReactNode } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: "light" | "dark" | "default";
  radius?: number;
  border?: boolean;
};

/**
 * GlassSurface — glassmorphic wrapper.
 * iOS: native BlurView at given intensity.
 * Android/web: translucent surface fallback that still reads as glass
 *   over the Aurora gradients (no real backdrop-filter, but good enough).
 */
export function GlassSurface({
  children,
  style,
  intensity = 40,
  tint = "light",
  radius = 24,
  border = true,
}: Props) {
  const borderColor =
    tint === "dark" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.55)";
  const shellBg =
    tint === "dark" ? "rgba(10,7,32,0.55)" : "rgba(255,255,255,0.62)";

  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[
          {
            overflow: "hidden",
            borderRadius: radius,
            borderWidth: border ? StyleSheet.hairlineWidth : 0,
            borderColor,
          },
          style,
        ]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: shellBg,
          borderRadius: radius,
          overflow: "hidden",
          borderWidth: border ? StyleSheet.hairlineWidth : 0,
          borderColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
