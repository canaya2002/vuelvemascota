/**
 * Home. Hero gradient animado, stats con count-up, feed corto de casos
 * cerca y accesos rápidos con efecto tilt. Aurora animada en el fondo.
 */

import { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H2,
  Text,
  EmptyState,
  LoadingState,
  AuroraBackground,
  AnimatedEntry,
  StatTile,
  PremiumButton,
  TiltPressable,
  GlassSurface,
  Hero,
  PulseDot,
} from "@/components/ui";
import { CasoCard } from "@/components/casos/CasoCard";
import {
  AnnouncementCarousel,
  type Announcement,
} from "@/components/AnnouncementCarousel";
import { useCasos, useAlertas } from "@/lib/hooks";
import { getCurrentPosition, type Coords } from "@/lib/location";
import { colors } from "@/lib/theme";
import { SITE } from "@vuelvecasa/shared";
import * as haptics from "@/lib/haptics";

export default function HomeScreen() {
  const { user } = useUser();
  const firstName =
    user?.firstName ??
    (user?.emailAddresses[0]?.emailAddress ?? "Hola").split("@")[0];
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

  const announcements: Announcement[] = [
    {
      id: "report",
      icon: "add-circle-outline",
      tone: "brand",
      title: "Reporta un caso en menos de 2 minutos",
      description: "Foto + zona + contacto. Activa la red local al instante.",
      href: "/(tabs)/reportar",
    },
    {
      id: "alerts",
      icon: "notifications-outline",
      tone: "brand",
      title:
        activas > 0
          ? `Tienes ${activas} ${activas === 1 ? "alerta activa" : "alertas activas"}`
          : "Activa una alerta por zona",
      description:
        activas > 0
          ? "Te avisamos al instante si aparece un caso cerca."
          : "Recibe avisos en tiempo real cuando se reporte cerca de ti.",
      href: "/(tabs)/alertas",
    },
    {
      id: "donate",
      icon: "heart-outline",
      tone: "success",
      title: "Sostén la red con $100 al mes",
      description: "Veterinaria, transporte y rescates verificados.",
      href: "/donar",
    },
    {
      id: "foros",
      icon: "chatbubbles-outline",
      tone: "ink",
      title: "Conversa con la comunidad",
      description: "Consejos, historias y apoyo en los foros.",
      href: "/foros",
    },
    {
      id: "chat",
      icon: "flash-outline",
      tone: "brand",
      title: "Canal de urgencias 24/7",
      description: "Coordina rescates en vivo con vecinos y rescatistas.",
      href: "/chat/urgencias",
    },
  ];

  return (
    <Screen edges={["top"]} padded={false}>
      <AuroraBackground variant="rose" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 18, paddingTop: 10, paddingBottom: 160 }}
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
        {/* ── HERO ─────────────────────────────────────────────── */}
        <AnimatedEntry delay={40}>
          <Hero preset="sunrise" overlay="soft">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <PulseDot size={8} color="#fff" />
              <Text
                style={{
                  color: "rgba(255,255,255,0.95)",
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Red viva · Hola, {firstName}
              </Text>
            </View>
            <Text
              style={{
                color: "#fff",
                fontSize: 32,
                fontWeight: "800",
                letterSpacing: -0.8,
                lineHeight: 38,
              }}
            >
              {SITE.tagline}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 14,
                marginTop: 10,
                lineHeight: 20,
              }}
            >
              Reporta, comparte y encuentra. Miles de vecinos tejen la red más
              cálida de México.
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <PremiumButton
                label="Reportar"
                variant="glass"
                size="md"
                leading={<Ionicons name="add" size={18} color={colors.ink} />}
                onPress={() => router.push("/(tabs)/reportar")}
              />
              <PremiumButton
                label="Ver casos"
                variant="dark"
                size="md"
                leading={<Ionicons name="search" size={16} color="#fff" />}
                onPress={() => router.push("/(tabs)/casos")}
              />
            </View>
          </Hero>
        </AnimatedEntry>

        {/* ── ANNOUNCEMENTS (cross-fade auto-rota cada 5s) ────── */}
        <AnimatedEntry delay={100}>
          <View style={{ marginTop: 18 }}>
            <AnnouncementCarousel items={announcements} intervalMs={5000} />
          </View>
        </AnimatedEntry>

        {/* ── STATS ────────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
          <StatTile
            label="Casos cerca"
            value={casos.data?.length ?? 0}
            tone="brand"
            icon="paw"
            subtitle={coords ? "25 km a la redonda" : "Activa ubicación"}
            delay={120}
            onPress={() => router.push("/(tabs)/casos")}
          />
          <StatTile
            label="Alertas"
            value={activas}
            tone="forest"
            icon="notifications"
            subtitle={activas > 0 ? "Escuchando por ti" : "Sin alertas activas"}
            delay={220}
            onPress={() => router.push("/(tabs)/alertas")}
          />
        </View>

        {/* ── QUICK ACTIONS ───────────────────────────────────── */}
        <AnimatedEntry delay={320}>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
            <QuickPill
              icon="flash"
              label="Avistamiento"
              onPress={() => router.push("/avistamiento" as never)}
            />
            <QuickPill
              icon="chatbubbles"
              label="Foros"
              onPress={() => router.push("/foros" as never)}
            />
            <QuickPill
              icon="heart"
              label="Donar"
              onPress={() => router.push("/donar" as never)}
            />
          </View>
        </AnimatedEntry>

        {/* ── FEED ────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 26,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
            <H2 style={{ fontSize: 22 }}>Cerca de ti</H2>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {coords ? "ordenado por cercanía" : "activa ubicación"}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              haptics.tap();
              router.push("/(tabs)/casos");
            }}
            hitSlop={10}
          >
            <Text
              style={{
                fontSize: 13,
                color: colors.brand,
                fontWeight: "700",
              }}
            >
              Ver todo →
            </Text>
          </Pressable>
        </View>

        {casos.isPending ? (
          <LoadingState compact />
        ) : (casos.data ?? []).length === 0 ? (
          <GlassSurface style={{ padding: 4 }}>
            <EmptyState
              icon="paw-outline"
              title="Sin casos cerca"
              description={
                coords
                  ? "Eres el primero. ¿Reportas uno?"
                  : "Activa ubicación para ver casos a tu alrededor."
              }
            />
          </GlassSurface>
        ) : (
          <View style={{ gap: 12 }}>
            {(casos.data ?? []).map((c, i) => (
              <AnimatedEntry key={c.id} delay={380 + i * 80} distance={12}>
                <CasoCard caso={c} />
              </AnimatedEntry>
            ))}
          </View>
        )}

        {/* ── QUICK ACCESS CARDS ──────────────────────────────── */}
        <View style={{ marginTop: 28, gap: 12 }}>
          <H2 style={{ fontSize: 20 }}>Más cerca de la comunidad</H2>
          <QuickAccess
            delay={140}
            tone="rose"
            label="Conversar en foros"
            description="Consejos, historias y apoyo."
            icon="chatbubbles"
            onPress={() => router.push("/foros" as never)}
          />
          <QuickAccess
            delay={210}
            tone="ocean"
            label="Canales de chat"
            description="Urgencias, veterinarias, rescatistas."
            icon="wifi"
            onPress={() => router.push("/chat" as never)}
          />
          <QuickAccess
            delay={280}
            tone="forest"
            label="Apoyar con una donación"
            description="Ayuda a mantener la red viva."
            icon="heart"
            onPress={() => router.push("/donar" as never)}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function QuickPill({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TiltPressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: 22,
        overflow: "hidden",
      }}
    >
      <GlassSurface radius={22} style={{ alignItems: "center", paddingVertical: 14, gap: 8 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.brandSoft,
          }}
        >
          <Ionicons name={icon} size={18} color={colors.brandInk} />
        </View>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: colors.ink,
          }}
        >
          {label}
        </Text>
      </GlassSurface>
    </TiltPressable>
  );
}

function QuickAccess({
  label,
  description,
  icon,
  onPress,
  tone = "rose",
  delay = 0,
}: {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tone?: "rose" | "ocean" | "forest";
  delay?: number;
}) {
  const bubble =
    tone === "rose"
      ? { bg: colors.brandSoft, fg: colors.brandInk }
      : tone === "ocean"
        ? { bg: colors.skySoft, fg: colors.sky }
        : { bg: colors.accentSoft, fg: colors.accent };

  return (
    <AnimatedEntry delay={delay}>
      <TiltPressable
        onPress={onPress}
        style={{ borderRadius: 22 }}
      >
        <GlassSurface radius={22}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: bubble.bg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={icon} size={22} color={bubble.fg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: colors.ink, fontSize: 15 }}>
                {label}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
                {description}
              </Text>
            </View>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.7)",
              }}
            >
              <Ionicons name="chevron-forward" size={16} color={colors.inkSoft} />
            </View>
          </View>
        </GlassSurface>
      </TiltPressable>
    </AnimatedEntry>
  );
}

