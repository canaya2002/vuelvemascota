/**
 * Card — superficie base con 2 variantes: sólida (default) y glass (blur).
 * Usamos expo-blur en iOS para un efecto nativo; en Android/web caemos a
 * color sólido semitransparente.
 */

import { type ReactNode } from "react";
import { Platform, View, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { presets } from "@/lib/theme";

type Props = ViewProps & {
  variant?: "solid" | "glass";
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function Card({ variant = "solid", style, children, ...rest }: Props) {
  if (variant === "glass" && Platform.OS === "ios") {
    return (
      <BlurView
        intensity={30}
        tint="light"
        style={[
          presets.cardGlass,
          { overflow: "hidden", backgroundColor: "transparent" },
          style,
        ]}
      >
        {children}
      </BlurView>
    );
  }
  const base = variant === "glass" ? presets.cardGlass : presets.card;
  return (
    <View style={[base, style]} {...rest}>
      {children}
    </View>
  );
}
