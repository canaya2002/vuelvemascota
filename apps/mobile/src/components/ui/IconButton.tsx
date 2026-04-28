import { Pressable, type PressableProps, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { ReactNode } from "react";
import { colors } from "@/lib/theme";
import * as haptics from "@/lib/haptics";

type Props = Omit<PressableProps, "children"> & {
  children: ReactNode;
  size?: number;
  tone?: "brand" | "ghost" | "dark";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  children,
  size = 44,
  tone = "ghost",
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const bg =
    tone === "brand" ? colors.brand : tone === "dark" ? colors.ink : "transparent";
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={rest.accessibilityLabel ?? "Botón"}
      onPressIn={(e) => {
        scale.value = withSpring(0.9, { damping: 14, stiffness: 260 });
        haptics.tap();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
        onPressOut?.(e);
      }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
          borderWidth: tone === "ghost" ? 1 : 0,
          borderColor: colors.line,
        },
        animated,
      ]}
      {...rest}
    >
      <View>{children}</View>
    </AnimatedPressable>
  );
}
