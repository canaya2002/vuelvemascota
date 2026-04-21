/**
 * Variantes de texto alineadas con la tipografía de la web.
 * No usamos NativeWind aquí porque queremos garantizar cambios vía tokens.
 */

import {
  Text as RNText,
  type TextProps,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { presets } from "@/lib/theme";

type Variant = "h1" | "h2" | "h3" | "body" | "bodyInk" | "eyebrow";

type Props = TextProps & {
  variant?: Variant;
  style?: StyleProp<TextStyle>;
};

export function Text({ variant = "body", style, ...rest }: Props) {
  return <RNText style={[presets[variant], style]} {...rest} />;
}

export function H1(props: TextProps & { style?: StyleProp<TextStyle> }) {
  return <Text variant="h1" {...props} />;
}
export function H2(props: TextProps & { style?: StyleProp<TextStyle> }) {
  return <Text variant="h2" {...props} />;
}
export function H3(props: TextProps & { style?: StyleProp<TextStyle> }) {
  return <Text variant="h3" {...props} />;
}
export function Body(props: TextProps & { style?: StyleProp<TextStyle> }) {
  return <Text variant="body" {...props} />;
}
export function Eyebrow(props: TextProps & { style?: StyleProp<TextStyle> }) {
  return <Text variant="eyebrow" {...props} />;
}
