import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { GradientFill } from "./GradientFill";

type Props = {
  children: ReactNode;
  preset?: "brand" | "sunrise" | "ocean" | "forest" | "twilight" | "ink";
  radius?: number;
  style?: StyleProp<ViewStyle>;
  overlay?: "none" | "soft" | "hard";
};

/**
 * Hero — rounded gradient panel with optional soft overlay to punch up text
 * contrast. Radius defaults to 32 for a soft, premium feel.
 */
export function Hero({
  children,
  preset = "sunrise",
  radius = 32,
  style,
  overlay = "soft",
}: Props) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: "hidden",
          shadowColor: preset === "twilight" || preset === "ink" ? "#0a1a2b" : "#e11d48",
          shadowOpacity: 0.25,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 18 },
          elevation: 10,
        },
        style,
      ]}
    >
      <GradientFill preset={preset} style={StyleSheet.absoluteFillObject} />
      {overlay !== "none" ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor:
                overlay === "soft"
                  ? "rgba(10,7,32,0.10)"
                  : "rgba(10,7,32,0.28)",
            },
          ]}
        />
      ) : null}
      <View style={{ padding: 22 }}>{children}</View>
    </View>
  );
}
