import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { colors } from "@/lib/theme";

type Preset =
  | "brand"
  | "brandDeep"
  | "sunrise"
  | "ocean"
  | "forest"
  | "twilight"
  | "ink"
  | "goldSoft";

const GRADIENTS: Record<
  Preset,
  { stops: Array<[string, number, number]>; angle?: number }
> = {
  brand: {
    stops: [
      ["#ff6b8a", 0, 1],
      ["#e11d48", 0.55, 1],
      ["#be123c", 1, 1],
    ],
    angle: 135,
  },
  brandDeep: {
    stops: [
      ["#e11d48", 0, 1],
      ["#881337", 1, 1],
    ],
    angle: 135,
  },
  sunrise: {
    stops: [
      ["#ffb37a", 0, 1],
      ["#ff6b8a", 0.55, 1],
      ["#a3449f", 1, 1],
    ],
    angle: 135,
  },
  ocean: {
    stops: [
      ["#7dd3fc", 0, 1],
      ["#3b82f6", 0.6, 1],
      ["#1e40af", 1, 1],
    ],
    angle: 135,
  },
  forest: {
    stops: [
      ["#86efac", 0, 1],
      ["#10a079", 0.55, 1],
      ["#065f46", 1, 1],
    ],
    angle: 135,
  },
  twilight: {
    stops: [
      ["#2a1a4b", 0, 1],
      ["#6a2a78", 0.5, 1],
      ["#0b0720", 1, 1],
    ],
    angle: 135,
  },
  ink: {
    stops: [
      ["#1a2942", 0, 1],
      ["#0a1a2b", 1, 1],
    ],
    angle: 135,
  },
  goldSoft: {
    stops: [
      ["#fff4d1", 0, 1],
      ["#ffe0a8", 1, 1],
    ],
    angle: 135,
  },
};

type Props = {
  preset?: Preset;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

function angleToPoints(angle: number) {
  const rad = (angle * Math.PI) / 180;
  const x1 = 0.5 - Math.cos(rad) * 0.5;
  const y1 = 0.5 - Math.sin(rad) * 0.5;
  const x2 = 0.5 + Math.cos(rad) * 0.5;
  const y2 = 0.5 + Math.sin(rad) * 0.5;
  return { x1, y1, x2, y2 };
}

/**
 * GradientFill — fills its container with a gradient using SVG.
 * Works identically on iOS/Android/web. Use absolutely-positioned so it
 * stays behind children.
 */
export function GradientFill({ preset = "brand", children, style, radius = 0 }: Props) {
  const g = GRADIENTS[preset];
  const pts = angleToPoints(g.angle ?? 135);

  return (
    <View style={[{ overflow: "hidden", borderRadius: radius }, style]}>
      <Svg
        style={StyleSheet.absoluteFillObject}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
      >
        <Defs>
          <LinearGradient id="g" x1={pts.x1} y1={pts.y1} x2={pts.x2} y2={pts.y2}>
            {g.stops.map(([color, offset, op], i) => (
              <Stop key={i} offset={offset} stopColor={color} stopOpacity={op} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#g)" />
      </Svg>
      {children}
    </View>
  );
}

/**
 * Convenience: subtle brand-tinted background for hero sections.
 */
export function HeroGradient({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <GradientFill preset="sunrise" radius={28} style={style}>
      {children}
    </GradientFill>
  );
}

export { GRADIENTS as gradientPresets };
export const overlayDark = colors.overlayDark;
