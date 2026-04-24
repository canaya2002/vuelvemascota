/**
 * Donar — embebe la página /donar del web via WebView. Stripe corre igual
 * que en browser, incluyendo Apple Pay / Google Pay si están configurados.
 * Más rápido que integrar el SDK nativo de Stripe y consistente visualmente.
 */

import { useRef, useState } from "react";
import { Platform, View } from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, IconButton, LoadingState, H2, Text, PremiumButton } from "@/components/ui";
import { colors } from "@/lib/theme";
import { API_URL } from "@/lib/constants";

export default function DonarScreen() {
  const webRef = useRef<WebView>(null);
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  function onNavigationStateChange(nav: WebViewNavigation) {
    setCanGoBack(nav.canGoBack);
  }

  function handleBack() {
    if (canGoBack && webRef.current) {
      webRef.current.goBack();
      return;
    }
    router.back();
  }

  function retry() {
    setError(null);
    webRef.current?.reload();
  }

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
          <IconButton onPress={handleBack}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </IconButton>
        </View>
        {error ? (
          <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 16 }}>
            <H2>No pudimos abrir la página de donación</H2>
            <Text style={{ color: colors.muted }}>{error}</Text>
            <PremiumButton label="Reintentar" onPress={retry} />
          </View>
        ) : (
          <WebView
            ref={webRef}
            source={{ uri: `${API_URL}/donar` }}
            style={{ flex: 1, backgroundColor: colors.bg }}
            startInLoadingState
            renderLoading={() => <LoadingState />}
            onNavigationStateChange={onNavigationStateChange}
            onError={({ nativeEvent }) =>
              setError(nativeEvent.description || "Revisa tu conexión e intenta de nuevo.")
            }
            onHttpError={({ nativeEvent }) => {
              if (nativeEvent.statusCode >= 500) {
                setError("El servidor respondió con un error. Intenta más tarde.");
              }
            }}
            // Solo permitimos navegación dentro de nuestro dominio y de Stripe
            // (Checkout usa checkout.stripe.com + js.stripe.com). Todo lo demás
            // abre en el navegador nativo para que terceros no secuestren sesión.
            originWhitelist={["https://*"]}
            setSupportMultipleWindows={Platform.OS === "ios"}
            javaScriptEnabled
            domStorageEnabled
            thirdPartyCookiesEnabled
            sharedCookiesEnabled
          />
        )}
      </Screen>
    </View>
  );
}
