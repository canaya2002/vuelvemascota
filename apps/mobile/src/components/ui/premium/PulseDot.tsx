import { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Props = {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Animated pulsing dot — classic "live" indicator. Two concentric circles:
 * a solid core and an expanding ring.
 */
export function PulseDot({ size = 10, color = "#e11d48", style }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) }),
      -1,
      false
    );
  }, [t]);

  const ring = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ scale: 1 + t.value * 1.8 }],
  }));

  return (
    <View style={[{ width: size * 2.4, height: size * 2.4, alignItems: "center", justifyContent: "center" }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: 9999,
            backgroundColor: color,
            alignSelf: "center",
          },
          ring,
        ]}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
