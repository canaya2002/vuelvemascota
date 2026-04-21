import { View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "./Text";
import { colors } from "@/lib/theme";

type Tone = "brand" | "accent" | "sky" | "warn" | "muted";

const toneColors: Record<Tone, { bg: string; fg: string }> = {
  brand: { bg: colors.brandSoft, fg: colors.brandInk },
  accent: { bg: colors.accentSoft, fg: colors.accent },
  sky: { bg: colors.skySoft, fg: colors.sky },
  warn: { bg: colors.warnSoft, fg: "#8a5800" },
  muted: { bg: colors.line, fg: colors.inkSoft },
};

type Props = {
  label: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, tone = "brand", style }: Props) {
  const { bg, fg } = toneColors[tone];
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 9999,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text style={{ color: fg, fontSize: 12, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}
