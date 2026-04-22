import { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

import { colors } from "@/lib/theme";

type Variant = "rose" | "sunrise" | "ocean" | "forest" | "twilight";

type Blob = {
  color: string;
  size: number;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  delay: number;
  opacity: number;
};

const PALETTES: Record<Variant, Blob[]> = {
  rose: [
    { color: "#ffb4c3", size: 520, x: -140, y: -180, driftX: 40, driftY: 30, delay: 0, opacity: 0.9 },
    { color: "#ffd9a8", size: 460, x: 160, y: -100, driftX: -30, driftY: 50, delay: 1200, opacity: 0.75 },
    { color: "#c3e9ff", size: 500, x: -80, y: 420, driftX: 60, driftY: -40, delay: 2400, opacity: 0.6 },
  ],
  sunrise: [
    { color: "#ffc2a1", size: 560, x: -180, y: -160, driftX: 50, driftY: 40, delay: 0, opacity: 0.9 },
    { color: "#ffd0d9", size: 440, x: 180, y: -60, driftX: -40, driftY: 60, delay: 900, opacity: 0.8 },
    { color: "#fff0b8", size: 520, x: 20, y: 380, driftX: 50, driftY: -30, delay: 1800, opacity: 0.65 },
  ],
  ocean: [
    { color: "#a5ddff", size: 520, x: -160, y: -140, driftX: 50, driftY: 30, delay: 0, opacity: 0.85 },
    { color: "#c6e9d4", size: 460, x: 200, y: 80, driftX: -40, driftY: 60, delay: 1400, opacity: 0.75 },
    { color: "#d7c7ff", size: 480, x: -60, y: 420, driftX: 40, driftY: -40, delay: 2600, opacity: 0.6 },
  ],
  forest: [
    { color: "#bff3d4", size: 540, x: -160, y: -160, driftX: 50, driftY: 40, delay: 0, opacity: 0.85 },
    { color: "#ffe0a8", size: 440, x: 180, y: -20, driftX: -30, driftY: 50, delay: 1200, opacity: 0.7 },
    { color: "#c4e4f8", size: 500, x: 0, y: 420, driftX: 40, driftY: -30, delay: 2400, opacity: 0.6 },
  ],
  twilight: [
    { color: "#2a1a4b", size: 620, x: -200, y: -180, driftX: 40, driftY: 30, delay: 0, opacity: 1 },
    { color: "#6a2a78", size: 520, x: 180, y: 40, driftX: -40, driftY: 60, delay: 1200, opacity: 0.9 },
    { color: "#ff8fa3", size: 480, x: -40, y: 460, driftX: 60, driftY: -40, delay: 2400, opacity: 0.6 },
  ],
};

type Props = {
  variant?: Variant;
  opacity?: number;
  animate?: boolean;
};

const { width: W, height: H } = Dimensions.get("window");

/**
 * Aurora: 3 soft radial gradients drifting slowly in the background.
 * Renders under everything, pointerEvents="none". Gives the app a living,
 * premium quality without affecting perf significantly.
 */
export function AuroraBackground({
  variant = "rose",
  opacity = 1,
  animate = true,
}: Props) {
  const blobs = PALETTES[variant];
  const bg = variant === "twilight" ? "#0b0720" : colors.bg;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: bg, opacity }]}>
      {blobs.map((blob, i) => (
        <AuroraBlob key={i} blob={blob} animate={animate} />
      ))}
    </View>
  );
}

function AuroraBlob({ blob, animate }: { blob: Blob; animate: boolean }) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (!animate) return;
    t.value = withRepeat(
      withTiming(1, { duration: 9000 + blob.delay, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [animate, blob.delay, t]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: blob.x + blob.driftX * t.value },
      { translateY: blob.y + blob.driftY * t.value },
      { scale: 1 + 0.05 * t.value },
    ],
    opacity: blob.opacity,
  }));

  const svg = useMemo(
    () => (
      <Svg width={blob.size} height={blob.size}>
        <Defs>
          <RadialGradient id="g" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={blob.color} stopOpacity={1} />
            <Stop offset="55%" stopColor={blob.color} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={blob.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={blob.size / 2} cy={blob.size / 2} r={blob.size / 2} fill="url(#g)" />
      </Svg>
    ),
    [blob.color, blob.size]
  );

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: blob.size,
          height: blob.size,
          left: W / 2 - blob.size / 2,
          top: H / 2 - blob.size / 2,
        },
        style,
      ]}
    >
      {svg}
    </Animated.View>
  );
}
