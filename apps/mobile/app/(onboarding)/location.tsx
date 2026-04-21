import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, H1, Body, Button, Card, Eyebrow } from "@/components/ui";
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
      <View style={{ flex: 1, justifyContent: "space-between", paddingTop: 32 }}>
        <View style={{ gap: 20, marginTop: 40 }}>
          <Eyebrow>Paso 1 de 2</Eyebrow>
          <H1 style={{ fontSize: 38 }}>
            ¿Puedes compartir tu ubicación?
          </H1>
          <Body style={{ fontSize: 17 }}>
            La usamos únicamente dentro de la app para ordenar casos por
            cercanía. Nunca la vendemos ni compartimos con terceros.
          </Body>
        </View>

        <Card style={{ marginVertical: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <Ionicons name="shield-checkmark" size={22} color={colors.accent} />
            <Body style={{ flex: 1, fontSize: 14 }}>
              Puedes apagarla cuando quieras. La app sigue funcionando —
              simplemente elegirás ciudad manualmente.
            </Body>
          </View>
        </Card>

        <View style={{ gap: 10 }}>
          <Button
            label="Permitir ubicación"
            size="lg"
            block
            loading={busy}
            leading={<Ionicons name="location" size={18} color="#fff" />}
            onPress={() => go(true)}
          />
          <Button
            label="Ahora no"
            variant="ghost"
            block
            onPress={() => go(false)}
          />
        </View>
      </View>
    </Screen>
  );
}
