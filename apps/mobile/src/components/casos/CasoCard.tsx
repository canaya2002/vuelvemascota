/**
 * Card de caso en el feed. Por default navega a `/casos/[slug]`; los callers
 * pueden cambiar el destino vía `href` o `onPress` (ej. avistamientos).
 */

import { View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import type { Caso } from "@vuelvecasa/shared";
import { Text, TiltPressable, GlassSurface } from "@/components/ui";
import { colors } from "@/lib/theme";
import { EstadoBadge } from "./EstadoBadge";

type Props = {
  caso: Caso;
  /** Override del destino al tocar (default: /casos/[slug]). */
  href?: string;
  /** Si viene, ignora el href y dispara un onPress custom. */
  onPress?: () => void;
};

function formatDistance(km?: number | null): string | null {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function CasoCard({ caso, href, onPress }: Props) {
  const firstPhoto = caso.fotos[0]?.url;
  const distancia = formatDistance(caso.distancia_km);
  const accessibilityLabel = `Ver caso de ${caso.nombre ?? caso.especie}`;

  const inner = (
    <GlassSurface radius={24} border>
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            width: 118,
            height: 136,
            backgroundColor: colors.line,
            overflow: "hidden",
          }}
        >
          {firstPhoto ? (
            <Image
              source={{ uri: firstPhoto }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="paw" size={32} color={colors.muted} />
            </View>
          )}
          {distancia ? (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 9999,
                backgroundColor: "rgba(10,26,43,0.72)",
              }}
            >
              <Ionicons name="location" size={11} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                {distancia}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={{ flex: 1, padding: 14, gap: 6, justifyContent: "center" }}>
          <EstadoBadge tipo={caso.tipo} estado={caso.estado} />
          <Text
            numberOfLines={1}
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: colors.ink,
              letterSpacing: -0.3,
            }}
          >
            {caso.nombre ?? descripcionCorta(caso)}
          </Text>
          <Text
            numberOfLines={2}
            style={{ fontSize: 13, color: colors.inkSoft, lineHeight: 18 }}
          >
            {[caso.raza, caso.color, caso.tamano].filter(Boolean).join(" • ")}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            <Ionicons name="location-outline" size={12} color={colors.muted} />
            <Text style={{ fontSize: 12, color: colors.muted }}>
              {caso.ciudad}
              {caso.colonia ? ` • ${caso.colonia}` : ""}
            </Text>
          </View>
        </View>
      </View>
    </GlassSurface>
  );

  const shadowWrap = {
    borderRadius: 24,
    shadowColor: "#0a1a2b",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  } as const;

  if (onPress) {
    return (
      <View style={shadowWrap}>
        <TiltPressable
          onPress={onPress}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          style={{ borderRadius: 24, overflow: "hidden" }}
          tilt={2.5}
        >
          {inner}
        </TiltPressable>
      </View>
    );
  }

  return (
    <View style={shadowWrap}>
      <Link href={target(caso, href) as never} asChild>
        <TiltPressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          style={{ borderRadius: 24, overflow: "hidden" }}
          tilt={2.5}
        >
          {inner}
        </TiltPressable>
      </Link>
    </View>
  );
}

function target(caso: Caso, href: string | undefined): string {
  return href ?? `/casos/${caso.slug}`;
}

function descripcionCorta(caso: Caso): string {
  if (caso.especie === "perro") return "Perro";
  if (caso.especie === "gato") return "Gato";
  return "Mascota";
}
