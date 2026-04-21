import { View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/lib/theme";

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        { height: 1, backgroundColor: colors.line, width: "100%" },
        style,
      ]}
    />
  );
}
