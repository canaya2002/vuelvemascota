import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "./Text";
import { colors } from "@/lib/theme";

type Props = {
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FormField({ label, helper, error, children, style }: Props) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.muted,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
      {children}
      {error ? (
        <Text style={{ fontSize: 13, color: colors.brand }}>{error}</Text>
      ) : helper ? (
        <Text style={{ fontSize: 13, color: colors.muted }}>{helper}</Text>
      ) : null}
    </View>
  );
}
