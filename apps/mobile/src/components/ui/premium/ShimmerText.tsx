import { useEffect } from "react";
import { type StyleProp, type TextStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

import { Text } from "../Text";

type Props = {
  text: string;
  from?: string;
  via?: string;
  to?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * ShimmerText — animated color shift between brand tones. Works on native
 * (no MaskedView required). Not a true shimmer sweep (RN lacks a cheap way
 * to mask text with a gradient) but reads as a living, breathing heading.
 */
export function ShimmerText({
  text,
  from = "#e11d48",
  via = "#ff8fa3",
  to = "#a3449f",
  style,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [t]);

  const animated = useAnimatedStyle(() => ({
    color: interpolateColor(t.value, [0, 0.5, 1], [from, via, to]),
  }));

  return (
    <Animated.Text style={[{ fontWeight: "800" }, style, animated]}>
      {text}
    </Animated.Text>
  );
}

/**
 * GradientHeading — static heading with brand accent. Kept as a simple
 * primitive for consistency with web.
 */
export function GradientHeading({
  text,
  style,
  colors = ["#e11d48", "#a3449f"],
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  colors?: [string, string];
}) {
  return (
    <Text style={[{ color: colors[0], fontWeight: "800" }, style]}>{text}</Text>
  );
}
