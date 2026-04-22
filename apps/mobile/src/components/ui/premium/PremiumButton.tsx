import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Text } from "../Text";
import { colors } from "@/lib/theme";
import * as haptics from "@/lib/haptics";
import { GradientFill } from "./GradientFill";

type Variant = "primary" | "ghost" | "glass" | "dark";
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
  glow?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const sizeMap: Record<Size, { py: number; px: number; font: number }> = {
  sm: { py: 10, px: 16, font: 14 },
  md: { py: 14, px: 22, font: 15 },
  lg: { py: 17, px: 26, font: 16 },
};

/**
 * PremiumButton — gradient + scale + optional glow pulse.
 * Variants:
 *  - primary: brand gradient fill + soft rose shadow (the "wow" button)
 *  - dark:    deep navy gradient
 *  - glass:   translucent surface, nice over AuroraBackground
 *  - ghost:   borderless, text only
 */
export function PremiumButton({
  label,
  variant = "primary",
  size = "md",
  leading,
  trailing,
  loading,
  block,
  disabled,
  style,
  haptic = "tap",
  glow = false,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const glowOp = useSharedValue(glow ? 1 : 0);

  const s = sizeMap[size];

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value }));

  const pill: ViewStyle = {
    borderRadius: 9999,
    paddingVertical: s.py,
    paddingHorizontal: s.px,
    alignSelf: block ? "stretch" : "flex-start",
    overflow: "hidden",
    opacity: disabled || loading ? 0.6 : 1,
  };

  const shadow: ViewStyle =
    variant === "primary"
      ? {
          shadowColor: colors.brand,
          shadowOpacity: 0.45,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
          elevation: 10,
        }
      : variant === "dark"
        ? {
            shadowColor: colors.ink,
            shadowOpacity: 0.35,
            shadowRadius: 22,
            shadowOffset: { width: 0, height: 10 },
            elevation: 8,
          }
        : {};

  const textColor =
    variant === "ghost"
      ? colors.ink
      : variant === "glass"
        ? colors.ink
        : "#fff";

  return (
    <View style={[{ alignSelf: block ? "stretch" : "flex-start" }, shadow, style]}>
      {glow && variant === "primary" ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: 9999,
              backgroundColor: colors.brand,
              opacity: 0.55,
              transform: [{ scale: 1.08 }],
            },
            glowStyle,
          ]}
        />
      ) : null}

      <AnimatedPressable
        disabled={disabled || loading}
        onPressIn={(e) => {
          scale.value = withSpring(0.96, { damping: 14, stiffness: 280 });
          if (haptic !== "none") haptics[haptic]();
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 14, stiffness: 280 });
          onPressOut?.(e);
        }}
        onPress={onPress}
        style={[pill, animated]}
        {...rest}
      >
        {variant === "primary" ? (
          <GradientFill preset="brand" style={StyleSheet.absoluteFillObject} />
        ) : variant === "dark" ? (
          <GradientFill preset="ink" style={StyleSheet.absoluteFillObject} />
        ) : variant === "glass" ? (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: "rgba(255,255,255,0.7)",
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: "rgba(255,255,255,0.6)",
              },
            ]}
          />
        ) : null}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color={textColor} size="small" />
          ) : (
            <>
              {leading ? <View>{leading}</View> : null}
              <Text
                style={{
                  color: textColor,
                  fontSize: s.font,
                  fontWeight: "700",
                  letterSpacing: 0.2,
                }}
              >
                {label}
              </Text>
              {trailing ? <View>{trailing}</View> : null}
            </>
          )}
        </View>
      </AnimatedPressable>
    </View>
  );
}

export { type Variant as PremiumButtonVariant };

export function usePulseGlow() {
  const op = useSharedValue(0);
  const start = () => {
    op.value = withTiming(1, { duration: 400 });
  };
  const stop = () => {
    op.value = withTiming(0, { duration: 400 });
  };
  return { op, start, stop };
}
