/**
 * Card de caso en el feed — ahora con tilt + scale + glass accent. Navega
 * al detail al tocar.
 */

import { View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import type { Caso } from "@vuelvecasa/shared";
import { Text, TiltPressable, GlassSurface } from "@/components/ui";
import { colors } from "@/lib/theme";
import { EstadoBadge } from "./EstadoBadge";

type Props = { caso: Caso };

function formatDistance(km?: number | null): string | null {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function CasoCard({ caso }: Props) {
  const firstPhoto = caso.fotos[0]?.url;
  const distancia = formatDistance(caso.distancia_km);

  return (
    <Link href={`/casos/${caso.slug}` as never} asChild>
      <TiltPressable
        style={{
          borderRadius: 24,
          overflow: "hidden",
          shadowColor: "#0a1a2b",
          shadowOpacity: 0.09,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 5,
        }}
        tilt={2.5}
      >
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
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={colors.muted}
                />
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {caso.ciudad}
                  {caso.colonia ? ` • ${caso.colonia}` : ""}
                </Text>
              </View>
            </View>
          </View>
        </GlassSurface>
      </TiltPressable>
    </Link>
  );
}

function descripcionCorta(caso: Caso): string {
  if (caso.especie === "perro") return "Perro";
  if (caso.especie === "gato") return "Gato";
  return "Mascota";
}
