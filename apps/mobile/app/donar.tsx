/**
 * Donar — embebe la página /donar del web via WebView. Stripe corre igual
 * que en browser, incluyendo Apple Pay / Google Pay si están configurados.
 * Más rápido que integrar el SDK nativo de Stripe y consistente visualmente.
 */

import { useState } from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, IconButton, LoadingState } from "@/components/ui";
import { colors } from "@/lib/theme";
import { API_URL } from "@/lib/constants";

export default function DonarScreen() {
  const [loading, setLoading] = useState(true);

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
          source={{ uri: `${API_URL}/donar` }}
          style={{ flex: 1, backgroundColor: colors.bg }}
          startInLoadingState
          renderLoading={() => <LoadingState />}
          onLoadEnd={() => setLoading(false)}
          originWhitelist={["https://*"]}
          setSupportMultipleWindows={Platform.OS === "ios"}
        />
        {loading ? null : null}
      </Screen>
    </View>
  );
}
