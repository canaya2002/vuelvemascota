import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Screen, H1, Body, Button, Card, Eyebrow } from "@/components/ui";
import { colors } from "@/lib/theme";
import { requestNotificationsPermission, registerPushWithBackend } from "@/lib/push";
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
      <View style={{ flex: 1, justifyContent: "space-between", paddingTop: 32 }}>
        <View style={{ gap: 20, marginTop: 40 }}>
          <Eyebrow>Paso 2 de 2</Eyebrow>
          <H1 style={{ fontSize: 38 }}>
            Queremos avisarte al instante.
          </H1>
          <Body style={{ fontSize: 17 }}>
            Cada segundo cuenta. Con notificaciones push recibes alertas tan
            pronto alguien reporte cerca de ti o de tu mascota.
          </Body>
        </View>

        <Card style={{ marginVertical: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <Ionicons name="flash" size={22} color={colors.brand} />
            <Body style={{ flex: 1, fontSize: 14 }}>
              Solo te avisamos de lo importante: avistamientos, coincidencias
              probables y actualizaciones de tus casos.
            </Body>
          </View>
        </Card>

        <View style={{ gap: 10 }}>
          <Button
            label="Activar notificaciones"
            size="lg"
            block
            loading={busy}
            leading={<Ionicons name="notifications" size={18} color="#fff" />}
            onPress={() => finish(true)}
          />
          <Button
            label="Ahora no"
            variant="ghost"
            block
            onPress={() => finish(false)}
          />
        </View>
      </View>
    </Screen>
  );
}
