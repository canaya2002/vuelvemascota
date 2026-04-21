/**
 * Perfil principal. Muestra avatar + email + rol + accesos a:
 *  - editar perfil
 *  - donar (webview)
 *  - foros / chat
 *  - privacidad / términos
 *  - cerrar sesión
 *  - borrar cuenta (Apple requirement)
 */

import { Alert, Pressable, View } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import {
  Screen,
  H2,
  Body,
  Button,
  Card,
  Divider,
  Eyebrow,
  Text,
} from "@/components/ui";
import { useMe, useDeleteMe } from "@/lib/hooks";
import { colors } from "@/lib/theme";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";

type Row = {
  icon: keyof typeof import("@expo/vector-icons/Ionicons").default.glyphMap;
  label: string;
  onPress: () => void;
  tone?: "default" | "danger";
};

export default function PerfilScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const me = useMe();
  const deleteMe = useDeleteMe();

  const confirmDelete = () => {
    haptics.warn();
    Alert.alert(
      "Borrar cuenta",
      "Se eliminarán tus casos, alertas y datos personales. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMe.mutateAsync();
              await signOut();
              router.replace("/(auth)/sign-in");
            } catch (err) {
              Alert.alert("No se pudo borrar", errorMessage(err));
            }
          },
        },
      ]
    );
  };

  const rows: Row[] = [
    {
      icon: "person-outline",
      label: "Editar perfil",
      onPress: () => router.push("/editar-perfil" as never),
    },
    {
      icon: "chatbubbles-outline",
      label: "Foros",
      onPress: () => router.push("/foros" as never),
    },
    {
      icon: "heart-outline",
      label: "Donar",
      onPress: () => router.push("/donar" as never),
    },
    {
      icon: "settings-outline",
      label: "Ajustes",
      onPress: () => router.push("/settings" as never),
    },
    {
      icon: "shield-outline",
      label: "Privacidad",
      onPress: () => router.push("/privacidad" as never),
    },
    {
      icon: "document-text-outline",
      label: "Términos",
      onPress: () => router.push("/terminos" as never),
    },
  ];

  return (
    <Screen scroll edges={["top"]}>
      <View style={{ gap: 20, paddingTop: 8, paddingBottom: 120 }}>
        <Eyebrow>Perfil</Eyebrow>

        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                overflow: "hidden",
                backgroundColor: colors.brandSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Ionicons
                  name="person"
                  size={28}
                  color={colors.brandInk}
                />
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <H2 style={{ fontSize: 20 }}>
                {user?.fullName ?? "Tu cuenta"}
              </H2>
              <Body style={{ color: colors.muted, fontSize: 13 }}>
                {user?.emailAddresses[0]?.emailAddress ?? ""}
              </Body>
              {me.data?.rol ? (
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.brandInk,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    marginTop: 2,
                  }}
                >
                  {me.data.rol}
                </Text>
              ) : null}
            </View>
          </View>
        </Card>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          {rows.map((r, i) => (
            <Pressable
              key={r.label}
              onPress={() => {
                haptics.tap();
                r.onPress();
              }}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Ionicons name={r.icon} size={20} color={colors.ink} />
                <Text style={{ fontSize: 16, color: colors.ink }}>
                  {r.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.muted}
              />
              {i < rows.length - 1 ? null : null}
            </Pressable>
          ))}
        </Card>

        <Button
          label="Cerrar sesión"
          variant="outline"
          block
          onPress={async () => {
            haptics.medium();
            await signOut();
          }}
        />

        <Divider style={{ marginTop: 8 }} />

        <Pressable onPress={confirmDelete} style={{ alignSelf: "center" }}>
          <Text style={{ color: colors.brand, fontSize: 14 }}>
            Borrar mi cuenta
          </Text>
        </Pressable>
        <Body
          style={{
            textAlign: "center",
            fontSize: 12,
            color: colors.muted,
            marginTop: -8,
          }}
        >
          Acción permanente. No se puede deshacer.
        </Body>
      </View>
    </Screen>
  );
}
