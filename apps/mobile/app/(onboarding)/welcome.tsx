import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H1,
  Body,
  Button,
  Eyebrow,
  Card,
} from "@/components/ui";
import { colors } from "@/lib/theme";

export default function OnboardingWelcome() {
  return (
    <Screen edges={["top", "bottom"]} padded>
      <View style={{ flex: 1, justifyContent: "space-between", paddingTop: 32 }}>
        <View style={{ gap: 20, marginTop: 40 }}>
          <Eyebrow>Bienvenido</Eyebrow>
          <H1 style={{ fontSize: 42 }}>
            Vamos a configurarte en un minuto.
          </H1>
          <Body style={{ fontSize: 17 }}>
            Te pediremos dos permisos para sacar el máximo de VuelveaCasa.
            Puedes cambiarlos cuando quieras desde Ajustes.
          </Body>
        </View>

        <View style={{ gap: 12, marginVertical: 24 }}>
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <IconBubble icon="location" />
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: "700", color: colors.ink }}>
                  Ubicación
                </Body>
                <Body style={{ fontSize: 13, color: colors.muted }}>
                  Para mostrarte casos cerca y alertarte cuando alguien reporte
                  una mascota en tu zona.
                </Body>
              </View>
            </View>
          </Card>
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <IconBubble icon="notifications" />
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: "700", color: colors.ink }}>
                  Notificaciones
                </Body>
                <Body style={{ fontSize: 13, color: colors.muted }}>
                  Para avisarte al instante si hay una mascota perdida cerca o
                  pistas sobre la tuya.
                </Body>
              </View>
            </View>
          </Card>
        </View>

        <Button
          label="Comenzar"
          size="lg"
          block
          onPress={() => router.push("/(onboarding)/location" as never)}
        />
      </View>
    </Screen>
  );
}

function IconBubble({
  icon,
}: {
  icon: keyof typeof import("@expo/vector-icons/Ionicons").default.glyphMap;
}) {
  return (
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.brandSoft,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={22} color={colors.brandInk} />
    </View>
  );
}
