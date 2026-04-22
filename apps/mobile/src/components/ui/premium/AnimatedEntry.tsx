import { useEffect, type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  direction?: "up" | "down" | "left" | "right";
  style?: StyleProp<ViewStyle>;
  duration?: number;
};

/**
 * Fade + slide entry animation. Use for staggered reveals of lists, cards,
 * and hero content. Spring-physics driven for that premium feel.
 */
export function AnimatedEntry({
  children,
  delay = 0,
  distance = 18,
  direction = "up",
  style,
  duration = 520,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, [delay, duration, t]);

  const animated = useAnimatedStyle(() => {
    const translate = (1 - t.value) * distance;
    const tx = direction === "left" ? -translate : direction === "right" ? translate : 0;
    const ty = direction === "up" ? translate : direction === "down" ? -translate : 0;
    return {
      opacity: t.value,
      transform: [{ translateX: tx }, { translateY: ty }],
    };
  });

  return <Animated.View style={[animated, style]}>{children}</Animated.View>;
}

/**
 * Spring-based entry — a subtle pop + fade. Good for featured cards.
 */
export function PopEntry({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 160 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 420 }));
  }, [delay, opacity, scale]);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[animated, style]}>{children}</Animated.View>;
}
