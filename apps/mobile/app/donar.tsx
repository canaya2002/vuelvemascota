/**
 * Donar — pantalla nativa.
 *
 * IMPORTANTE: el cobro NO sucede dentro de la app. Apple App Store Review
 * Guideline 3.2.1(vi) requiere que las donaciones a non-profits NO procesen
 * pagos in-app a menos que la organización esté verificada como nonprofit
 * por Apple. VuelveaCasa está en proceso de verificación (pre-donataria
 * autorizada en MX) — mientras tanto, esta pantalla solo explica el por qué
 * y el cómo, y abre `https://vuelvecasa.com/donar` en el navegador para que
 * Stripe Checkout se ejecute fuera del contexto de la app.
 *
 * Cuando Apple apruebe el non-profit status, podemos rehabilitar el flujo
 * native con WebBrowser.openBrowserAsync(checkoutUrl) — el código del API
 * `/api/donar/checkout` sigue funcionando y la web sigue cobrando normal.
 */

import { Linking, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  IconButton,
  Text,
  H1,
  Body,
  Eyebrow,
  Card,
  PremiumButton,
} from "@/components/ui";
import { colors } from "@/lib/theme";
import * as haptics from "@/lib/haptics";

const SITE_DONAR_URL = "https://www.vuelvecasa.com/donar";

const CAUSAS: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  desc: string;
}[] = [
  {
    label: "Fondo comunitario",
    icon: "people-outline",
    desc: "Se asigna a los casos más urgentes de la semana.",
  },
  {
    label: "Emergencias veterinarias",
    icon: "medical-outline",
    desc: "Cirugías, hospitalización y atención urgente.",
  },
  {
    label: "Rescatistas aliados",
    icon: "paw-outline",
    desc: "Recursos para rescatistas verificados.",
  },
];

const TRUST: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  {
    icon: "shield-checkmark-outline",
    text: "Pago procesado por Stripe — no guardamos tu tarjeta.",
  },
  {
    icon: "list-outline",
    text: "Cada donación queda registrada y rastreable.",
  },
  {
    icon: "close-circle-outline",
    text: "Sin comisiones ocultas. Cancela mensual cuando quieras.",
  },
];

export default function DonarScreen() {
  const openWeb = async () => {
    haptics.medium();
    try {
      await Linking.openURL(SITE_DONAR_URL);
    } catch {
      // Sin conexión / no hay navegador — fallback silencioso.
    }
  };

  return (
    <Screen edges={["top"]} padded={false}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow style={{ color: colors.brandInk }}>Donaciones</Eyebrow>
        <H1
          style={{
            marginTop: 10,
            fontSize: 34,
            lineHeight: 38,
            letterSpacing: -0.5,
          }}
        >
          Tu apoyo, ayuda real.
        </H1>
        <Body
          style={{
            marginTop: 12,
            color: colors.inkSoft,
            fontSize: 15.5,
            lineHeight: 22,
          }}
        >
          Cada peso financia veterinaria de emergencia, alimento, traslados y
          rescate de casos verificados. Transparencia desde el primer peso.
        </Body>

        {/* --- A dónde va tu dinero --- */}
        <SectionLabel>A dónde va tu dinero</SectionLabel>
        <View style={{ gap: 12, marginTop: 12 }}>
          {CAUSAS.map((c) => (
            <Card key={c.label} style={{ padding: 16, gap: 4 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.brandSoft,
                  }}
                >
                  <Ionicons name={c.icon} size={18} color={colors.brandInk} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: colors.ink,
                    }}
                  >
                    {c.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12.5,
                      color: colors.muted,
                      marginTop: 2,
                    }}
                  >
                    {c.desc}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* --- CTA al sitio --- */}
        <View style={{ marginTop: 28, gap: 10 }}>
          <PremiumButton
            label="Apoyar en el sitio web"
            size="lg"
            block
            trailing={
              <Ionicons name="open-outline" size={18} color="#fff" />
            }
            onPress={openWeb}
          />
          <Pressable
            onPress={openWeb}
            accessibilityRole="link"
            accessibilityLabel="Abrir vuelvecasa.com/donar"
            style={{ alignSelf: "center", paddingVertical: 6 }}
          >
            <Text
              style={{
                color: colors.muted,
                fontSize: 12.5,
                textAlign: "center",
              }}
            >
              vuelvecasa.com/donar · pago seguro vía Stripe
            </Text>
          </Pressable>
        </View>

        {/* --- Trust signals --- */}
        <View style={{ marginTop: 24, gap: 10 }}>
          {TRUST.map((row) => (
            <View
              key={row.text}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <Ionicons
                name={row.icon}
                size={17}
                color={colors.success}
                style={{ marginTop: 2 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 13.5,
                  color: colors.inkSoft,
                  lineHeight: 19,
                }}
              >
                {row.text}
              </Text>
            </View>
          ))}
        </View>

        {/* --- Nota legal corta --- */}
        <View
          style={{
            marginTop: 24,
            padding: 14,
            borderRadius: 14,
            backgroundColor: colors.bgAlt,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              lineHeight: 18,
            }}
          >
            VuelveaCasa opera en modo pre-donataria autorizada en México. Las
            donaciones se procesan fuera de la app por nuestra plataforma web
            con Stripe — el 100% del monto va al fondo o caso que elegiste.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        marginTop: 28,
        fontSize: 11,
        fontWeight: "700",
        color: colors.muted,
        letterSpacing: 1.4,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}
