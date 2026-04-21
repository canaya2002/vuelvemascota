import { ActivityIndicator, View } from "react-native";
import { Body } from "./Text";
import { colors } from "@/lib/theme";

type Props = { label?: string; compact?: boolean };

export function LoadingState({ label, compact }: Props) {
  return (
    <View
      style={{
        paddingVertical: compact ? 24 : 64,
        alignItems: "center",
        gap: 10,
      }}
    >
      <ActivityIndicator color={colors.brand} size={compact ? "small" : "large"} />
      {label ? <Body style={{ color: colors.muted }}>{label}</Body> : null}
    </View>
  );
}
