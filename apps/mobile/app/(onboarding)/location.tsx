import { useState } from "react";
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
import { requestLocationPermission } from "@/lib/location";
import * as haptics from "@/lib/haptics";

export default function OnboardingLocation() {
  const [busy, setBusy] = useState(false);

  const go = async (ask: boolean) => {
    if (ask) {
      setBusy(true);
      const granted = await requestLocationPermission();
      setBusy(false);
      if (granted) haptics.success();
    }
    router.push("/(onboarding)/notifications" as never);
  };

  return (
    <Screen edges={["top", "bottom"]} padded>
      <AuroraBackground variant="ocean" />

      <View style={{ flex: 1, justifyContent: "space-between", paddingTop: 40 }}>
        <View>
          <AnimatedEntry delay={40}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <PulseDot size={7} color={colors.sky} />
              <Eyebrow style={{ color: colors.sky }}>Paso 1 de 2</Eyebrow>
            </View>
          </AnimatedEntry>
          <AnimatedEntry delay={120}>
            <H1 style={{ fontSize: 34, letterSpacing: -0.8, lineHeight: 40 }}>
              ¿Puedes compartir tu ubicación?
            </H1>
          </AnimatedEntry>
          <AnimatedEntry delay={200}>
            <Body
              style={{ fontSize: 16, marginTop: 14, color: colors.inkSoft, lineHeight: 22 }}
            >
              La usamos únicamente dentro de la app para ordenar casos por
              cercanía. Nunca la vendemos ni compartimos con terceros.
            </Body>
          </AnimatedEntry>
        </View>

        <AnimatedEntry delay={280}>
          <GlassSurface radius={22}>
            <View style={{ padding: 16, flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: colors.inkSoft, lineHeight: 20 }}>
                Puedes apagarla cuando quieras. La app sigue funcionando —
                simplemente elegirás ciudad manualmente.
              </Text>
            </View>
          </GlassSurface>
        </AnimatedEntry>

        <AnimatedEntry delay={360}>
          <View style={{ gap: 10 }}>
            <PremiumButton
              label="Permitir ubicación"
              size="lg"
              block
              loading={busy}
              leading={<Ionicons name="location" size={18} color="#fff" />}
              onPress={() => go(true)}
            />
            <PremiumButton
              label="Ahora no"
              variant="ghost"
              block
              onPress={() => go(false)}
            />
          </View>
        </AnimatedEntry>
      </View>
    </Screen>
  );
}
