/**
 * Perfil premium. Hero glassmorphic con avatar grande, gradiente ambiental
 * y lista de accesos animada. Acciones críticas (cerrar sesión, borrar) en
 * un bloque diferenciado.
 */

import { Alert, Pressable, ScrollView, View } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import {
  Screen,
  H1,
  Body,
  Text,
  Divider,
  Eyebrow,
  AuroraBackground,
  AnimatedEntry,
  GlassSurface,
  PremiumButton,
  TiltPressable,
  GradientFill,
  PulseDot,
} from "@/components/ui";
import { useMe, useDeleteMe } from "@/lib/hooks";
import { colors } from "@/lib/theme";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";

type Row = {
  icon: keyof typeof Ionicons.glyphMap;
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
      icon: "filter-outline",
      label: "Comunidad",
      onPress: () => router.push("/chat" as never),
    },
    {
      icon: "book-outline",
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
    <Screen edges={["top"]} padded={false}>
      <AuroraBackground variant="sunrise" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 18, paddingBottom: 180 }}
      >
        <AnimatedEntry delay={40}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <PulseDot size={7} color={colors.brand} />
            <Eyebrow>Tu cuenta</Eyebrow>
          </View>
          <H1 style={{ fontSize: 30, letterSpacing: -0.8, marginBottom: 16 }}>
            Hola, {user?.firstName ?? "tú"}.
          </H1>
        </AnimatedEntry>

        <AnimatedEntry delay={120}>
          <View
            style={{
              borderRadius: 28,
              shadowColor: colors.brand,
              shadowOpacity: 0.18,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 14 },
              elevation: 8,
            }}
          >
            <Pressable
              onPress={() => {
                haptics.tap();
                router.push("/perfil-publico" as never);
              }}
              style={{ borderRadius: 28, overflow: "hidden" }}
            >
              <GradientFill preset="brand" radius={28}>
                <View style={{ padding: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      overflow: "hidden",
                      backgroundColor: "rgba(255,255,255,0.18)",
                      borderWidth: 2,
                      borderColor: "rgba(255,255,255,0.45)",
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
                      <Ionicons name="person" size={30} color="#fff" />
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "800",
                        color: "#fff",
                        letterSpacing: -0.3,
                      }}
                    >
                      {user?.fullName ?? "Tu cuenta"}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 13,
                      }}
                    >
                      {user?.emailAddresses[0]?.emailAddress ?? ""}
                    </Text>
                    {me.data?.rol ? (
                      <View
                        style={{
                          marginTop: 4,
                          alignSelf: "flex-start",
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          borderRadius: 9999,
                          backgroundColor: "rgba(255,255,255,0.22)",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10.5,
                            fontWeight: "800",
                            color: "#fff",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                          }}
                        >
                          {me.data.rol}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="rgba(255,255,255,0.85)"
                  />
                </View>
                <Text
                  style={{
                    marginTop: 14,
                    color: "rgba(255,255,255,0.78)",
                    fontSize: 12,
                    fontWeight: "500",
                    letterSpacing: 0.3,
                  }}
                >
                  Toca para ver tu vista pública →
                </Text>
                </View>
              </GradientFill>
            </Pressable>
          </View>
        </AnimatedEntry>

        <View style={{ marginTop: 18, gap: 10 }}>
          {rows.map((r, i) => (
            <AnimatedEntry key={r.label} delay={200 + i * 50}>
              <TiltPressable
                onPress={() => {
                  haptics.tap();
                  r.onPress();
                }}
                style={{ borderRadius: 20 }}
                tilt={2}
              >
                <GlassSurface radius={20}>
                  <View
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
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
                        <Ionicons name={r.icon} size={18} color={colors.brandInk} />
                      </View>
                      <Text style={{ fontSize: 15, color: colors.ink, fontWeight: "600" }}>
                        {r.label}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.muted}
                    />
                  </View>
                </GlassSurface>
              </TiltPressable>
            </AnimatedEntry>
          ))}
        </View>

        <AnimatedEntry delay={580}>
          <View style={{ marginTop: 24, gap: 16 }}>
            <PremiumButton
              label="Cerrar sesión"
              variant="glass"
              block
              onPress={async () => {
                haptics.medium();
                await signOut();
              }}
            />

            <Divider />

            <Pressable onPress={confirmDelete} style={{ alignSelf: "center" }}>
              <Text
                style={{
                  color: colors.brand,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
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
        </AnimatedEntry>
      </ScrollView>
    </Screen>
  );
}
