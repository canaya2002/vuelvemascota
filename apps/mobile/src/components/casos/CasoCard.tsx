/**
 * Card de caso en el feed. Toca → navega al detail.
 */

import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import type { Caso } from "@vuelvecasa/shared";
import { Text, Card } from "@/components/ui";
import { colors } from "@/lib/theme";
import { EstadoBadge } from "./EstadoBadge";
import * as haptics from "@/lib/haptics";

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
      <Pressable onPress={() => haptics.tap()}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: 110,
                height: 130,
                backgroundColor: colors.line,
              }}
            >
              {firstPhoto ? (
                <Image
                  source={{ uri: firstPhoto }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
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
            </View>
            <View style={{ flex: 1, padding: 14, gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <EstadoBadge tipo={caso.tipo} estado={caso.estado} />
                {distancia ? (
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {distancia}
                  </Text>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={{ fontSize: 17, fontWeight: "700", color: colors.ink }}
              >
                {caso.nombre ?? descripcionCorta(caso)}
              </Text>
              <Text
                numberOfLines={2}
                style={{ fontSize: 13, color: colors.inkSoft }}
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
                  size={13}
                  color={colors.muted}
                />
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {caso.ciudad}
                  {caso.colonia ? ` • ${caso.colonia}` : ""}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

function descripcionCorta(caso: Caso): string {
  if (caso.especie === "perro") return "Perro";
  if (caso.especie === "gato") return "Gato";
  return "Mascota";
}
