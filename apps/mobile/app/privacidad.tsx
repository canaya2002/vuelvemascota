import { View } from "react-native";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, IconButton, LoadingState } from "@/components/ui";
import { colors } from "@/lib/theme";
import { API_URL } from "@/lib/constants";

export default function PrivacidadScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen edges={["top"]} padded={false}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <IconButton onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </IconButton>
        </View>
        <WebView
          source={{ uri: `${API_URL}/privacidad` }}
          style={{ flex: 1, backgroundColor: colors.bg }}
          startInLoadingState
          renderLoading={() => <LoadingState />}
        />
      </Screen>
    </View>
  );
}
