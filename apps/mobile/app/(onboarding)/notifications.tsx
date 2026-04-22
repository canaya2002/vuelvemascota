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
import {
  requestNotificationsPermission,
  registerPushWithBackend,
} from "@/lib/push";
import { markOnboarded } from "@/lib/onboarding";
import { useApi } from "@/lib/api";
import * as haptics from "@/lib/haptics";

export default function OnboardingNotifications() {
  const api = useApi();
  const [busy, setBusy] = useState(false);

  const finish = async (ask: boolean) => {
    try {
      setBusy(true);
      if (ask) {
        const granted = await requestNotificationsPermission();
        if (granted) {
          await registerPushWithBackend(api);
          haptics.success();
        }
      }
      await markOnboarded();
    } finally {
      setBusy(false);
      router.replace("/(tabs)");
    }
  };

  return (
    <Screen edges={["top", "bottom"]} padded>
      <AuroraBackground variant="sunrise" />

      <View style={{ flex: 1, justifyContent: "space-between", paddingTop: 40 }}>
        <View>
          <AnimatedEntry delay={40}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <PulseDot size={7} color={colors.brand} />
              <Eyebrow>Paso 2 de 2</Eyebrow>
            </View>
          </AnimatedEntry>
          <AnimatedEntry delay={120}>
            <H1 style={{ fontSize: 34, letterSpacing: -0.8, lineHeight: 40 }}>
              Queremos avisarte al instante.
            </H1>
          </AnimatedEntry>
          <AnimatedEntry delay={200}>
            <Body
              style={{ fontSize: 16, marginTop: 14, color: colors.inkSoft, lineHeight: 22 }}
            >
              Cada segundo cuenta. Con notificaciones push recibes alertas tan
              pronto alguien reporte cerca de ti o de tu mascota.
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
                  backgroundColor: colors.brandSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="flash" size={20} color={colors.brand} />
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: colors.inkSoft, lineHeight: 20 }}>
                Solo te avisamos de lo importante: avistamientos, coincidencias
                probables y actualizaciones de tus casos.
              </Text>
            </View>
          </GlassSurface>
        </AnimatedEntry>

        <AnimatedEntry delay={360}>
          <View style={{ gap: 10 }}>
            <PremiumButton
              label="Activar notificaciones"
              size="lg"
              block
              glow
              loading={busy}
              leading={<Ionicons name="notifications" size={18} color="#fff" />}
              onPress={() => finish(true)}
            />
            <PremiumButton
              label="Ahora no"
              variant="ghost"
              block
              onPress={() => finish(false)}
            />
          </View>
        </AnimatedEntry>
      </View>
    </Screen>
  );
}
