import { type ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import * as haptics from "@/lib/haptics";

type Props = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tilt?: number;
  scale?: number;
  haptic?: "tap" | "light" | "none";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * TiltPressable — press-driven 3D tilt + scale effect. Use as a replacement
 * for Pressable on cards/quick-actions for that premium, tactile feel.
 */
export function TiltPressable({
  children,
  style,
  tilt = 4,
  scale: scaleAmount = 0.97,
  haptic = "tap",
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: Props) {
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);

  const animated = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 900 },
        { rotateX: `${pressed.value * tilt * 0.6}deg` },
        { rotateY: `${-pressed.value * tilt}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <AnimatedPressable
      onPressIn={(e) => {
        pressed.value = withTiming(1, { duration: 140 });
        scale.value = withSpring(scaleAmount, { damping: 16, stiffness: 260 });
        if (haptic !== "none") haptics[haptic]();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = withTiming(0, { duration: 260 });
        scale.value = withSpring(1, { damping: 16, stiffness: 260 });
        onPressOut?.(e);
      }}
      onPress={onPress}
      style={[animated, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
