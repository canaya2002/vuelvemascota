/**
 * Sign-in real. Soporta:
 *  - OAuth Apple (iOS recomendado por App Store)
 *  - OAuth Google
 *  - Email magic code (navega a /(auth)/email)
 */

import { useState } from "react";
import { Alert, Platform, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, H1, Body, Button, Eyebrow } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useOAuthFlow } from "@/lib/oauth";
import { errorMessage } from "@/lib/errors";

export default function SignInScreen() {
  const [busy, setBusy] = useState<null | "apple" | "google">(null);
  const apple = useOAuthFlow("oauth_apple");
  const google = useOAuthFlow("oauth_google");

  const handleOAuth = async (kind: "apple" | "google") => {
    try {
      setBusy(kind);
      await (kind === "apple" ? apple() : google());
    } catch (err) {
      Alert.alert("No pudimos iniciar sesión", errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen edges={["top", "bottom"]} background={colors.bg} padded>
      <View style={{ flex: 1, justifyContent: "space-between", paddingTop: 32 }}>
        <View style={{ gap: 20, marginTop: 48 }}>
          <Eyebrow>VuelveaCasa</Eyebrow>
          <H1 style={{ fontSize: 44 }}>
            Traer a casa cada mascota empieza con un reporte.
          </H1>
          <Body style={{ fontSize: 17 }}>
            La red comunitaria de México para reportar, encontrar y alertar
            sobre mascotas perdidas. Entra y forma parte.
          </Body>
        </View>

        <View style={{ gap: 12, marginBottom: 24 }}>
          {Platform.OS === "ios" ? (
            <Button
              label={busy === "apple" ? "Abriendo..." : "Continuar con Apple"}
              variant="dark"
              block
              size="lg"
              loading={busy === "apple"}
              leading={<Ionicons name="logo-apple" color="#fff" size={18} />}
              onPress={() => handleOAuth("apple")}
            />
          ) : null}
          <Button
            label={busy === "google" ? "Abriendo..." : "Continuar con Google"}
            variant="outline"
            block
            size="lg"
            loading={busy === "google"}
            leading={<Ionicons name="logo-google" color={colors.ink} size={18} />}
            onPress={() => handleOAuth("google")}
          />
          <Button
            label="Usar correo electrónico"
            variant="ghost"
            block
            size="md"
            onPress={() => router.push("/(auth)/email")}
          />
          <Body
            style={{
              textAlign: "center",
              color: colors.muted,
              fontSize: 12,
              marginTop: 8,
            }}
          >
            Al continuar aceptas nuestros términos y privacidad.
          </Body>
        </View>
      </View>
    </Screen>
  );
}
