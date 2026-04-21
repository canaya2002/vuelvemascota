/**
 * Button — usa Pressable con animación de scale al tocar (feedback premium
 * que se siente como una app nativa). Incluye haptic feedback configurable
 * y 4 variantes visuales paralelas a la web.
 */

import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  View,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Text } from "./Text";
import { colors, presets } from "@/lib/theme";
import * as haptics from "@/lib/haptics";

type Variant = "primary" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

type Props = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: Variant;
  size?: Size;
  leading?: ReactNode;
  trailing?: ReactNode;
  loading?: boolean;
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  haptic?: "tap" | "light" | "medium" | "heavy" | "none";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = "primary",
  size = "md",
  leading,
  trailing,
  loading = false,
  block = false,
  disabled,
  style,
  haptic = "tap",
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const base: ViewStyle = {
    ...(variant === "primary"
      ? presets.btnPrimary
      : variant === "outline"
        ? presets.btnOutline
        : variant === "ghost"
          ? { ...presets.btnOutline, borderColor: "transparent" }
          : {
              ...presets.btnPrimary,
              backgroundColor: colors.ink,
              shadowColor: colors.ink,
            }),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: block ? "stretch" : "flex-start",
    opacity: disabled || loading ? 0.55 : 1,
  };

  if (size === "sm") {
    base.paddingVertical = 8;
    base.paddingHorizontal = 14;
  }
  if (size === "lg") {
    base.paddingVertical = 16;
    base.paddingHorizontal = 24;
  }

  const textStyle =
    variant === "outline"
      ? { color: colors.ink, fontWeight: "600" as const, fontSize: 16 }
      : variant === "ghost"
        ? { color: colors.ink, fontWeight: "600" as const, fontSize: 16 }
        : { ...presets.btnPrimaryText };

  return (
    <AnimatedPressable
      disabled={disabled || loading}
      onPressIn={(e) => {
        scale.value = withSpring(0.96, { damping: 14, stiffness: 260 });
        if (haptic !== "none") haptics[haptic]();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
        onPressOut?.(e);
      }}
      onPress={onPress}
      style={[base, animatedStyle, style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textStyle.color} />
      ) : (
        <>
          {leading ? <View>{leading}</View> : null}
          <Text style={textStyle}>{label}</Text>
          {trailing ? <View>{trailing}</View> : null}
        </>
      )}
    </AnimatedPressable>
  );
}
