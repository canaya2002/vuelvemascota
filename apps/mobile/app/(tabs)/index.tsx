/**
 * Home. Muestra stats heroicas + feed corto de casos cerca + accesos
 * rápidos a reportar, alertas y foros.
 */

import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H1,
  H2,
  Body,
  Eyebrow,
  Card,
  Button,
  EmptyState,
  LoadingState,
} from "@/components/ui";
import { CasoCard } from "@/components/casos/CasoCard";
import { useCasos, useAlertas } from "@/lib/hooks";
import { getCurrentPosition, type Coords } from "@/lib/location";
import { colors } from "@/lib/theme";
import { SITE } from "@vuelvecasa/shared";
import * as haptics from "@/lib/haptics";

export default function HomeScreen() {
  const { user } = useUser();
  const firstName =
    user?.firstName ?? (user?.emailAddresses[0]?.emailAddress ?? "Hola").split("@")[0];
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    (async () => {
      const c = await getCurrentPosition();
      if (c) setCoords(c);
    })();
  }, []);

  const casos = useCasos({
    lat: coords?.lat,
    lng: coords?.lng,
    radio_km: coords ? 25 : undefined,
    limit: 6,
  });

  const alertas = useAlertas();
  const activas = (alertas.data ?? []).filter((a) => a.activa).length;

  return (
    <Screen edges={["top"]} padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={casos.isRefetching || alertas.isRefetching}
            onRefresh={() => {
              casos.refetch();
              alertas.refetch();
            }}
            tintColor={colors.brand}
          />
        }
      >
        <View style={{ gap: 6, marginBottom: 16 }}>
          <Eyebrow>Hola, {firstName}</Eyebrow>
          <H1 style={{ fontSize: 36 }}>{SITE.tagline}</H1>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
          <StatCard
            label="Casos cerca"
            value={casos.data?.length ?? 0}
            tone="brand"
            onPress={() => router.push("/(tabs)/casos")}
          />
          <StatCard
            label="Alertas activas"
            value={activas}
            tone="accent"
            onPress={() => router.push("/(tabs)/alertas")}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          <Button
            label="Reportar"
            size="lg"
            style={{ flex: 1 }}
            leading={<Ionicons name="add" size={18} color="#fff" />}
            onPress={() => router.push("/(tabs)/reportar")}
          />
          <Button
            label="Buscar"
            variant="outline"
            size="lg"
            style={{ flex: 1 }}
            leading={<Ionicons name="search" size={18} color={colors.ink} />}
            onPress={() => router.push("/(tabs)/casos")}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <H2 style={{ fontSize: 22 }}>Casos cerca</H2>
          <Pressable onPress={() => router.push("/(tabs)/casos")}>
            <Body style={{ fontSize: 13, color: colors.brand, fontWeight: "600" }}>
              Ver todo
            </Body>
          </Pressable>
        </View>

        {casos.isPending ? (
          <LoadingState compact />
        ) : (casos.data ?? []).length === 0 ? (
          <EmptyState
            icon="paw-outline"
            title="Sin casos cerca"
            description={
              coords
                ? "Eres el primero. ¿Reportas uno?"
                : "Activa ubicación para ver casos a tu alrededor."
            }
          />
        ) : (
          <View style={{ gap: 12 }}>
            {(casos.data ?? []).map((c) => (
              <CasoCard key={c.id} caso={c} />
            ))}
          </View>
        )}

        <View style={{ marginTop: 24, gap: 10 }}>
          <QuickAccess
            label="Conversar con la comunidad"
            description="Foros, consejos y experiencias."
            icon="chatbubbles"
            onPress={() => router.push("/foros" as never)}
          />
          <QuickAccess
            label="Canales de chat"
            description="Urgencias, veterinarias, rescatistas."
            icon="wifi"
            onPress={() => router.push("/chat" as never)}
          />
          <QuickAccess
            label="Apoyar con una donación"
            description="Ayúdanos a mantener la red viva."
            icon="heart"
            onPress={() => router.push("/donar" as never)}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatCard({
  label,
  value,
  tone,
  onPress,
}: {
  label: string;
  value: number;
  tone: "brand" | "accent";
  onPress: () => void;
}) {
  const bg = tone === "brand" ? colors.brandSoft : colors.accentSoft;
  const fg = tone === "brand" ? colors.brandInk : colors.accent;
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={{
        flex: 1,
        backgroundColor: bg,
        borderRadius: 22,
        padding: 18,
        gap: 6,
      }}
    >
      <Body style={{ fontSize: 12, color: fg, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </Body>
      <Body style={{ fontSize: 34, fontWeight: "700", color: fg }}>
        {value}
      </Body>
    </Pressable>
  );
}

function QuickAccess({
  label,
  description,
  icon,
  onPress,
}: {
  label: string;
  description: string;
  icon: keyof typeof import("@expo/vector-icons/Ionicons").default.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
    >
      <Card>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.brandSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={icon} size={20} color={colors.brandInk} />
          </View>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: "700", color: colors.ink, fontSize: 15 }}>
              {label}
            </Body>
            <Body style={{ color: colors.muted, fontSize: 13 }}>
              {description}
            </Body>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </View>
      </Card>
    </Pressable>
  );
}
