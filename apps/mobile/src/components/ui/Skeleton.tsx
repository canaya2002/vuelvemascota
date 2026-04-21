/**
 * Skeleton animado con pulso. Se usa para placeholders mientras carga data.
 */

import { useEffect } from "react";
import {
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/lib/theme";

type Props = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: Props) {
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [pulse]);

  const animated = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.line,
        },
        animated,
        style,
      ]}
    />
  );
}

export function CasoCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 0,
        overflow: "hidden",
        flexDirection: "row",
        borderWidth: 1,
        borderColor: colors.line,
      }}
    >
      <View style={{ width: 110, height: 130 }}>
        <Skeleton width="100%" height={130} radius={0} />
      </View>
      <View style={{ flex: 1, padding: 14, gap: 8 }}>
        <Skeleton width={80} height={16} />
        <Skeleton width="70%" height={18} />
        <Skeleton width="90%" height={14} />
        <Skeleton width="50%" height={12} />
      </View>
    </View>
  );
}

export function HiloSkeleton() {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 18,
        gap: 8,
        borderWidth: 1,
        borderColor: colors.line,
      }}
    >
      <Skeleton width={60} height={10} />
      <Skeleton width="80%" height={18} />
      <Skeleton width="95%" height={14} />
      <Skeleton width="40%" height={12} />
    </View>
  );
}

