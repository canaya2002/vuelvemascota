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

/**
 * Presets alineados con la paleta premium (granate sobrio + neutrales).
 * Single-tone subtle gradients en vez de rainbow saltones. El de marca va de
 * brand → brandDeep para dar dimensión sin "esquinas demasiado rojas".
 */
const GRADIENTS: Record<
  Preset,
  { stops: Array<[string, number, number]>; angle?: number }
> = {
  brand: {
    stops: [
      [colors.brand, 0, 1],
      [colors.brandDeep, 1, 1],
    ],
    angle: 145,
  },
  brandDeep: {
    stops: [
      [colors.brandDeep, 0, 1],
      [colors.brandInk, 1, 1],
    ],
    angle: 145,
  },
  sunrise: {
    stops: [
      [colors.brandSoft, 0, 1],
      [colors.brand, 1, 1],
    ],
    angle: 135,
  },
  ocean: {
    stops: [
      [colors.inkSoft, 0, 1],
      [colors.ink, 1, 1],
    ],
    angle: 135,
  },
  forest: {
    stops: [
      [colors.successSoft, 0, 1],
      [colors.success, 1, 1],
    ],
    angle: 135,
  },
  twilight: {
    stops: [
      [colors.ink, 0, 1],
      [colors.bgDeep, 1, 1],
    ],
    angle: 135,
  },
  ink: {
    stops: [
      [colors.inkSoft, 0, 1],
      [colors.ink, 1, 1],
    ],
    angle: 145,
  },
  goldSoft: {
    stops: [
      [colors.warnSoft, 0, 1],
      [colors.bgAlt, 1, 1],
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
