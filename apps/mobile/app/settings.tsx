/**
 * Settings — toggles y acceso a info. Gestiona push y onboarding.
 */

import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, Switch, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import * as Notifications from "expo-notifications";

import {
  Screen,
  H2,
  Body,
  Card,
  IconButton,
  Eyebrow,
  Text,
  Divider,
} from "@/components/ui";
import { colors } from "@/lib/theme";
import { useApi } from "@/lib/api";
import {
  registerPushWithBackend,
  requestNotificationsPermission,
} from "@/lib/push";
import { resetOnboarded } from "@/lib/onboarding";
import * as haptics from "@/lib/haptics";

export default function SettingsScreen() {
  const api = useApi();
  const [pushOn, setPushOn] = useState<boolean>(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setPushOn(status === "granted");
    })();
  }, []);

  const togglePush = async (next: boolean) => {
    haptics.light();
    setBusy(true);
    try {
      if (next) {
        const granted = await requestNotificationsPermission();
        if (!granted) {
          Alert.alert(
            "Permiso denegado",
            "Activa notificaciones en Ajustes del sistema.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Abrir Ajustes", onPress: () => Linking.openSettings() },
            ]
          );
          setPushOn(false);
          return;
        }
        await registerPushWithBackend(api);
        setPushOn(true);
      } else {
        // No podemos revocar el permiso desde la app — solo dejamos de registrar.
        Alert.alert(
          "Desactivar notificaciones",
          "Abrimos Ajustes del sistema para apagar las notificaciones de VuelveaCasa.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Abrir Ajustes", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={["top"]} scroll>
      <View style={{ marginBottom: 12 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ gap: 16, paddingBottom: 80 }}>
        <Eyebrow>Ajustes</Eyebrow>
        <H2>Preferencias</H2>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <Row
            icon="notifications-outline"
            label="Notificaciones push"
            description="Alertas de mascotas cerca de ti."
            right={
              <Switch
                value={pushOn}
                onValueChange={togglePush}
                trackColor={{ false: colors.line, true: colors.brand }}
                disabled={busy}
              />
            }
          />
          <Divider />
          <Row
            icon="location-outline"
            label="Permisos de ubicación"
            description="Se gestionan desde Ajustes del sistema."
            onPress={() => Linking.openSettings()}
            chevron
          />
        </Card>

        <H2 style={{ fontSize: 20, marginTop: 8 }}>Acerca de</H2>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <Row
            icon="shield-outline"
            label="Privacidad"
            onPress={() => router.push("/privacidad" as never)}
            chevron
          />
          <Divider />
          <Row
            icon="document-text-outline"
            label="Términos"
            onPress={() => router.push("/terminos" as never)}
            chevron
          />
          <Divider />
          <Row
            icon="information-circle-outline"
            label={`Versión ${Application.nativeApplicationVersion ?? "1.0.0"}`}
            description={`Build ${Application.nativeBuildVersion ?? "—"}`}
          />
        </Card>

        <Pressable
          onPress={async () => {
            haptics.warn();
            await resetOnboarded();
            Alert.alert("Listo", "Verás el onboarding en el próximo inicio.");
          }}
          style={{ alignSelf: "center", marginTop: 12 }}
        >
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            Resetear onboarding (dev)
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

type RowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
};

function Row({ icon, label, description, right, onPress, chevron }: RowProps) {
  const body = (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Ionicons name={icon} size={20} color={colors.ink} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: colors.ink, fontWeight: "600" }}>
          {label}
        </Text>
        {description ? (
          <Body style={{ fontSize: 12, color: colors.muted }}>{description}</Body>
        ) : null}
      </View>
      {right ?? (chevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      ) : null)}
    </View>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          haptics.tap();
          onPress();
        }}
      >
        {body}
      </Pressable>
    );
  }
  return body;
}
