import { useEffect } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/lib/theme";

type Props = {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Indicador "live" — un punto sólido + un anillo que se expande sobre él.
 *
 * Diseño cuidado para NO solaparse con texto adyacente:
 *  - El contenedor mide exactamente `size` × `size`.
 *  - El anillo es del mismo tamaño y se escala con `transform`. Como crece
 *    visualmente más allá del wrapper, ponemos `overflow: visible` para que
 *    el padre no lo clipee, pero el LAYOUT del wrapper sigue siendo `size`.
 *  - Escala máxima 2.0× (no 2.8) — más sutil, menos invasivo.
 */
export function PulseDot({ size = 8, color = colors.brand, style }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) }),
      -1,
      false
    );
  }, [t]);

  const ring = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - t.value),
    transform: [{ scale: 1 + t.value * 1.0 }],
  }));

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
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
