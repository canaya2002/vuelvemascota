import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H1,
  Body,
  Text,
  Eyebrow,
  AuroraBackground,
  AnimatedEntry,
  GlassSurface,
  PremiumButton,
  PulseDot,
} from "@/components/ui";
import { colors } from "@/lib/theme";

export default function OnboardingWelcome() {
  return (
    <Screen edges={["top", "bottom"]} padded>
      <AuroraBackground variant="rose" />

      <View style={{ flex: 1, justifyContent: "space-between", paddingTop: 40 }}>
        <View>
          <AnimatedEntry delay={40}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <PulseDot size={7} color={colors.brand} />
              <Eyebrow>Bienvenido</Eyebrow>
            </View>
          </AnimatedEntry>
          <AnimatedEntry delay={120}>
            <H1 style={{ fontSize: 38, letterSpacing: -1, lineHeight: 44 }}>
              Vamos a configurarte en un{" "}
              <Text style={{ color: colors.brand, fontSize: 38, fontWeight: "800" }}>
                minuto
              </Text>
              .
            </H1>
          </AnimatedEntry>
          <AnimatedEntry delay={200}>
            <Body style={{ fontSize: 16, marginTop: 16, color: colors.inkSoft, lineHeight: 22 }}>
              Te pediremos dos permisos para sacar el máximo de VuelveaCasa.
              Puedes cambiarlos cuando quieras desde Ajustes.
            </Body>
          </AnimatedEntry>
        </View>

        <View style={{ gap: 12, marginVertical: 24 }}>
          <AnimatedEntry delay={280}>
            <PermCard
              icon="location"
              title="Ubicación"
              description="Para mostrarte casos cerca y alertarte cuando alguien reporte una mascota en tu zona."
            />
          </AnimatedEntry>
          <AnimatedEntry delay={360}>
            <PermCard
              icon="notifications"
              title="Notificaciones"
              description="Para avisarte al instante si hay una mascota perdida cerca o pistas sobre la tuya."
            />
          </AnimatedEntry>
        </View>

        <AnimatedEntry delay={460}>
          <PremiumButton
            label="Comenzar"
            size="lg"
            block
            glow
            trailing={<Ionicons name="arrow-forward" size={18} color="#fff" />}
            onPress={() => router.push("/(onboarding)/location" as never)}
          />
        </AnimatedEntry>
      </View>
    </Screen>
  );
}

function PermCard({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <GlassSurface radius={22}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.brandSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={24} color={colors.brandInk} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", color: colors.ink, fontSize: 15 }}>
            {title}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
            {description}
          </Text>
        </View>
      </View>
    </GlassSurface>
  );
}
