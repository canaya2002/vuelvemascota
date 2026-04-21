import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, IconButton } from "@/components/ui";
import { CasoForm } from "@/components/forms/CasoForm";
import { colors } from "@/lib/theme";

export default function ReportarPerdidaScreen() {
  return (
    <Screen scroll edges={["top"]}>
      <View style={{ marginBottom: 12 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>
      <CasoForm tipo="perdida" />
    </Screen>
  );
}
