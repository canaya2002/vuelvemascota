/**
 * Sign-in premium: aurora de fondo, hero gigante, botones OAuth con estilo
 * glassmorphic y bloque de beneficios animado.
 */

import { useState } from "react";
import { Alert, Platform, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  Body,
  Text,
  Eyebrow,
  AuroraBackground,
  AnimatedEntry,
  PremiumButton,
  GlassSurface,
  PulseDot,
} from "@/components/ui";
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
    <Screen edges={["top", "bottom"]} padded={false}>
      <AuroraBackground variant="rose" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 22,
          paddingTop: 36,
          paddingBottom: 36,
        }}
      >
        <AnimatedEntry delay={40}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <PulseDot size={7} color={colors.brand} />
            <Eyebrow>VuelveaCasa</Eyebrow>
          </View>
        </AnimatedEntry>

        <AnimatedEntry delay={120}>
          <Text
            style={{
              fontSize: 40,
              fontWeight: "800",
              color: colors.ink,
              letterSpacing: -1,
              lineHeight: 44,
              marginTop: 8,
            }}
          >
            Traer a casa{" "}
            <Text style={{ color: colors.brand }}>cada mascota</Text> empieza con un reporte.
          </Text>
        </AnimatedEntry>

        <AnimatedEntry delay={200}>
          <Body style={{ fontSize: 16, marginTop: 16, color: colors.inkSoft, lineHeight: 22 }}>
            La red comunitaria de México para reportar, encontrar y alertar
            sobre mascotas perdidas. Entra y forma parte.
          </Body>
        </AnimatedEntry>

        <AnimatedEntry delay={280}>
          <View style={{ marginTop: 22, gap: 10 }}>
            <Benefit
              icon="flash"
              title="Alertas instantáneas"
              description="Push al segundo si alguien reporta cerca de ti."
            />
            <Benefit
              icon="people"
              title="Red viva"
              description="Miles de vecinos, veterinarias y rescatistas."
            />
            <Benefit
              icon="shield-checkmark"
              title="Privacidad primero"
              description="Tu ubicación nunca se comparte con terceros."
            />
          </View>
        </AnimatedEntry>

        <View style={{ flex: 1 }} />

        <AnimatedEntry delay={420}>
          <View style={{ gap: 10, marginTop: 28 }}>
            {Platform.OS === "ios" ? (
              <PremiumButton
                label={busy === "apple" ? "Abriendo..." : "Continuar con Apple"}
                variant="dark"
                block
                size="lg"
                loading={busy === "apple"}
                leading={<Ionicons name="logo-apple" color="#fff" size={18} />}
                onPress={() => handleOAuth("apple")}
              />
            ) : null}
            <PremiumButton
              label={busy === "google" ? "Abriendo..." : "Continuar con Google"}
              variant="glass"
              block
              size="lg"
              loading={busy === "google"}
              leading={<Ionicons name="logo-google" color={colors.ink} size={18} />}
              onPress={() => handleOAuth("google")}
            />
            <PremiumButton
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
                marginTop: 6,
              }}
            >
              Al continuar aceptas nuestros términos y privacidad.
            </Body>
          </View>
        </AnimatedEntry>
      </ScrollView>
    </Screen>
  );
}

function Benefit({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <GlassSurface radius={20}>
      <View style={{ flexDirection: "row", gap: 12, padding: 14, alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.brandSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={18} color={colors.brandInk} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", color: colors.ink, fontSize: 14 }}>{title}</Text>
          <Text style={{ color: colors.muted, fontSize: 12.5, marginTop: 1 }}>
            {description}
          </Text>
        </View>
      </View>
    </GlassSurface>
  );
}

