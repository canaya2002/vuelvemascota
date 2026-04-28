import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Body, H3 } from "./Text";
import { colors } from "@/lib/theme";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  icon = "sparkles-outline",
  title,
  description,
  action,
}: Props) {
  return (
    <View
      style={{
        paddingVertical: 56,
        paddingHorizontal: 24,
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.brandSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={32} color={colors.brandInk} />
      </View>
      <H3 style={{ textAlign: "center", marginTop: 8 }}>{title}</H3>
      {description ? (
        <Body style={{ textAlign: "center", maxWidth: 320 }}>
          {description}
        </Body>
      ) : null}
      {action}
    </View>
  );
}
