/**
 * Vista pública del propio perfil — así te ven los demás usuarios.
 *
 * Muestra: avatar, nombre, rol, ciudad, bio, badges (donador, verificado).
 * Diseño glassmorphic premium con gradient background. El usuario puede
 * tocar "Editar perfil" para volver a la pantalla de edición.
 *
 * Si más adelante creamos `/perfil/[id]` para ver perfiles ajenos, esta
 * misma layout funciona — solo cambia la fuente de datos.
 */

import { Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";

import {
  Screen,
  H1,
  Body,
  Text,
  Eyebrow,
  IconButton,
  GlassSurface,
  GradientFill,
  AuroraBackground,
  AnimatedEntry,
  PremiumButton,
} from "@/components/ui";
import { useMe } from "@/lib/hooks";
import { colors } from "@/lib/theme";

const ROLES_LABEL: Record<string, string> = {
  dueño: "Dueño / Tutor",
  voluntario: "Voluntario",
  rescatista: "Rescatista",
  veterinaria: "Veterinaria / Clínica",
  aliado: "Aliado / Negocio",
};

export default function PerfilPublicoScreen() {
  const { user } = useUser();
  const me = useMe();

  const fullName =
    user?.fullName ??
    user?.firstName ??
    me.data?.nombre ??
    "Usuario VuelveaCasa";
  const ciudad = me.data?.ciudad;
  const estado = me.data?.estado;
  const rol = me.data?.rol;
  const bio = me.data?.bio;
  const verificado = me.data?.verificado === true;
  const initials = fullName
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Screen edges={["top"]} padded={false}>
      <AuroraBackground variant="rose" />

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 6,
          paddingBottom: 8,
        }}
      >
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: 80,
        }}
      >
        <AnimatedEntry delay={40}>
          <Eyebrow style={{ marginBottom: 6 }}>Vista pública</Eyebrow>
          <H1
            style={{
              fontSize: 26,
              letterSpacing: -0.6,
              lineHeight: 32,
            }}
          >
            Así te ve la comunidad.
          </H1>
        </AnimatedEntry>

        {/* --- Tarjeta hero glassmorphic --- */}
        <AnimatedEntry delay={130}>
          <View
            style={{
              marginTop: 20,
              borderRadius: 28,
              overflow: "hidden",
              shadowColor: colors.brand,
              shadowOpacity: 0.18,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 14 },
              elevation: 8,
            }}
          >
            <GradientFill preset="brand" radius={28}>
              <View style={{ padding: 24, alignItems: "center", gap: 14 }}>
                <View
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: 55,
                    backgroundColor: "rgba(255,255,255,0.16)",
                    borderWidth: 3,
                    borderColor: "rgba(255,255,255,0.55)",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {user?.imageUrl ? (
                    <Image
                      source={{ uri: user.imageUrl }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Text
                      style={{
                        fontSize: 38,
                        fontWeight: "700",
                        color: "#fff",
                        letterSpacing: -1,
                      }}
                    >
                      {initials}
                    </Text>
                  )}
                </View>

                <View style={{ alignItems: "center", gap: 4 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "700",
                        color: "#fff",
                        letterSpacing: -0.3,
                      }}
                    >
                      {fullName}
                    </Text>
                    {verificado ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#fff"
                      />
                    ) : null}
                  </View>
                  {ciudad || estado ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name="location-outline"
                        size={13}
                        color="rgba(255,255,255,0.85)"
                      />
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: 13.5,
                        }}
                      >
                        {[ciudad, estado].filter(Boolean).join(", ")}
                      </Text>
                    </View>
                  ) : null}
                  {rol ? (
                    <View
                      style={{
                        marginTop: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 9999,
                        backgroundColor: "rgba(255,255,255,0.22)",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#fff",
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        {ROLES_LABEL[rol] ?? rol}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </GradientFill>
          </View>
        </AnimatedEntry>

        {/* --- Bio en glass card --- */}
        {bio ? (
          <AnimatedEntry delay={220}>
            <View style={{ marginTop: 16 }}>
              <GlassSurface radius={20}>
                <View style={{ padding: 18 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: colors.muted,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Bio
                  </Text>
                  <Body
                    style={{
                      fontSize: 14.5,
                      lineHeight: 21,
                      color: colors.ink,
                    }}
                  >
                    {bio}
                  </Body>
                </View>
              </GlassSurface>
            </View>
          </AnimatedEntry>
        ) : null}

        {/* --- Stats placeholder (futuro: casos, donaciones) --- */}
        <AnimatedEntry delay={300}>
          <View style={{ marginTop: 16, flexDirection: "row", gap: 10 }}>
            <StatTile label="En la comunidad desde" value={memberSince ?? "—"} />
          </View>
        </AnimatedEntry>

        {/* --- CTA editar --- */}
        <AnimatedEntry delay={380}>
          <View style={{ marginTop: 22 }}>
            <PremiumButton
              label="Editar mi perfil"
              size="lg"
              block
              onPress={() => router.push("/editar-perfil" as never)}
              leading={
                <Ionicons name="create-outline" size={18} color="#fff" />
              }
            />
          </View>
        </AnimatedEntry>

        <Pressable
          onPress={() => router.push("/donar" as never)}
          style={{ marginTop: 18, alignSelf: "center" }}
        >
          <Text
            style={{
              fontSize: 13,
              color: colors.brandInk,
              fontWeight: "600",
              letterSpacing: -0.005,
            }}
          >
            Apoyar la red con una donación →
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <GlassSurface radius={16}>
        <View style={{ padding: 14 }}>
          <Text
            style={{
              fontSize: 10.5,
              fontWeight: "700",
              color: colors.muted,
              letterSpacing: 1.1,
              textTransform: "uppercase",
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: colors.ink,
              marginTop: 4,
              textTransform: "capitalize",
            }}
          >
            {value}
          </Text>
        </View>
      </GlassSurface>
    </View>
  );
}
