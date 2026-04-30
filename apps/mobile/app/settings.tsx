/**
 * Settings — preferencias, links legales y account management.
 *
 * Diseño premium: cards con secciones agrupadas, rows con icon container
 * pildora, chevron sutil para navegables. Cerrar sesión y Borrar cuenta
 * en el último grupo (zona de peligro).
 */

import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, Switch, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import * as Notifications from "expo-notifications";
import { useAuth, useUser } from "@clerk/clerk-expo";

import {
  Screen,
  H1,
  Body,
  Card,
  IconButton,
  Eyebrow,
  Text,
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
  const { signOut } = useAuth();
  const { user } = useUser();
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
        Alert.alert(
          "Desactivar notificaciones",
          "Abrimos Ajustes del sistema para apagar las notificaciones.",
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

  const handleSignOut = () => {
    haptics.warn();
    Alert.alert(
      "Cerrar sesión",
      "Vas a salir de tu cuenta en este dispositivo. Puedes volver a entrar cuando quieras.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/(auth)/sign-in" as never);
            } catch (err) {
              Alert.alert(
                "No pudimos cerrar sesión",
                err instanceof Error ? err.message : "Intenta de nuevo."
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    haptics.warn();
    Alert.alert(
      "Borrar cuenta",
      "Esto desactiva tu perfil permanentemente y anonimiza tus datos. No se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar mi cuenta",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "¿Estás absolutamente seguro?",
              "Tu nombre, foto y datos personales se eliminan. Tus reportes y donaciones quedan anónimos.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Sí, borrar todo",
                  style: "destructive",
                  onPress: doDeleteAccount,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const doDeleteAccount = async () => {
    setBusy(true);
    try {
      // 1. Anonimiza la fila de usuarios en nuestra DB.
      await api.me.delete();
      // 2. Borra el user en Clerk (si soporta self-delete).
      try {
        await user?.delete();
      } catch {
        /* algunos environments de Clerk no permiten self-delete; ignoramos */
      }
      // 3. Cierra sesión local.
      await signOut();
      router.replace("/(auth)/sign-in" as never);
      Alert.alert(
        "Cuenta eliminada",
        "Tus datos se anonimizaron. Si necesitas algo más, escríbenos desde vuelvecasa.com/contacto."
      );
    } catch (err) {
      Alert.alert(
        "No pudimos completar el borrado",
        err instanceof Error ? err.message : "Intenta de nuevo más tarde."
      );
    } finally {
      setBusy(false);
    }
  };

  const isDev = __DEV__;

  return (
    <Screen edges={["top"]} scroll>
      <View style={{ marginBottom: 16 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ gap: 22, paddingBottom: 80 }}>
        <View>
          <Eyebrow>Ajustes</Eyebrow>
          <H1
            style={{
              fontSize: 32,
              letterSpacing: -0.7,
              marginTop: 6,
              lineHeight: 38,
            }}
          >
            Tus preferencias.
          </H1>
        </View>

        {/* --- Identity --- */}
        <Card style={{ padding: 16, gap: 4 }}>
          <Text
            style={{ fontSize: 11, color: colors.muted, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: "700" }}
          >
            Cuenta
          </Text>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: colors.ink,
              marginTop: 4,
            }}
          >
            {user?.firstName ??
              user?.emailAddresses[0]?.emailAddress?.split("@")[0] ??
              "Usuario"}
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted }}>
            {user?.emailAddresses[0]?.emailAddress ?? "Sin email"}
          </Text>
          <Pressable
            onPress={() => router.push("/editar-perfil" as never)}
            style={{ marginTop: 10 }}
          >
            <Text style={{ color: colors.brandInk, fontWeight: "600", fontSize: 14 }}>
              Editar perfil →
            </Text>
          </Pressable>
        </Card>

        {/* --- Preferencias --- */}
        <SectionTitle>Preferencias</SectionTitle>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <Row
            icon="notifications-outline"
            tone="brand"
            label="Notificaciones push"
            description="Alertas de mascotas cerca de ti."
            right={
              <Switch
                value={pushOn}
                onValueChange={togglePush}
                trackColor={{ false: colors.line, true: colors.brand }}
                thumbColor="#fff"
                ios_backgroundColor={colors.line}
                disabled={busy}
              />
            }
          />
          <RowDivider />
          <Row
            icon="location-outline"
            tone="ink"
            label="Permisos de ubicación"
            description="Se gestionan desde Ajustes del sistema."
            onPress={() => Linking.openSettings()}
            chevron
          />
        </Card>

        {/* --- Acerca de --- */}
        <SectionTitle>Acerca de</SectionTitle>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <Row
            icon="shield-checkmark-outline"
            tone="ink"
            label="Aviso de privacidad"
            onPress={() => router.push("/privacidad" as never)}
            chevron
          />
          <RowDivider />
          <Row
            icon="document-text-outline"
            tone="ink"
            label="Términos y condiciones"
            onPress={() => router.push("/terminos" as never)}
            chevron
          />
          <RowDivider />
          <Row
            icon="information-circle-outline"
            tone="ink"
            label="Versión"
            description={Application.nativeApplicationVersion ?? "1.0.0"}
          />
        </Card>

        {/* --- Zona de peligro --- */}
        <SectionTitle danger>Cuenta y sesión</SectionTitle>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <Row
            icon="log-out-outline"
            tone="ink"
            label="Cerrar sesión"
            description="Salir en este dispositivo."
            onPress={handleSignOut}
            chevron
          />
          <RowDivider />
          <Row
            icon="trash-outline"
            tone="brand"
            label="Borrar mi cuenta"
            description="Anonimiza tus datos permanentemente."
            danger
            onPress={handleDeleteAccount}
            chevron
          />
        </Card>

        {isDev ? (
          <Pressable
            onPress={async () => {
              haptics.warn();
              await resetOnboarded();
              Alert.alert(
                "Listo",
                "Verás el onboarding en el próximo inicio."
              );
            }}
            style={{ alignSelf: "center", marginTop: 8, paddingVertical: 6 }}
          >
            <Text
              style={{
                color: colors.muted,
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              Resetear onboarding (solo dev)
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

function SectionTitle({
  children,
  danger,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: "700",
        color: danger ? colors.brand : colors.muted,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        marginBottom: -8,
        marginLeft: 4,
      }}
    >
      {children}
    </Text>
  );
}

function RowDivider() {
  return (
    <View
      style={{
        height: 1,
        marginLeft: 60,
        backgroundColor: colors.line,
      }}
    />
  );
}

type RowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  tone?: "brand" | "ink";
  danger?: boolean;
};

function Row({
  icon,
  label,
  description,
  right,
  onPress,
  chevron,
  tone = "ink",
  danger = false,
}: RowProps) {
  const iconBg =
    tone === "brand"
      ? danger
        ? "#fbe9ee"
        : colors.brandSoft
      : colors.bgAlt;
  const iconFg =
    tone === "brand" || danger ? colors.brandInk : colors.ink;
  const labelColor = danger ? colors.brand : colors.ink;

  const body = (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={18} color={iconFg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: labelColor, fontWeight: "600" }}>
          {label}
        </Text>
        {description ? (
          <Text
            style={{
              fontSize: 12.5,
              color: colors.muted,
              marginTop: 2,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {right}
      {chevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      ) : null}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} android_ripple={{ color: colors.line }}>
      {body}
    </Pressable>
  );
}
