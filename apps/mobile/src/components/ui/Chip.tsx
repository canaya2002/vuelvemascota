import { Pressable, View } from "react-native";
import { Text } from "./Text";
import { colors } from "@/lib/theme";
import * as haptics from "@/lib/haptics";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress?.();
      }}
    >
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: selected ? colors.brand : colors.line,
          backgroundColor: selected ? colors.brandSoft : colors.surface,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: selected ? colors.brandInk : colors.inkSoft,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
