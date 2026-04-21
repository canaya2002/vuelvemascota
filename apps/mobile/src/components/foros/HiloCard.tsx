import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Body, Card, Text } from "@/components/ui";
import type { ForoHilo } from "@vuelvecasa/shared";
import { colors } from "@/lib/theme";
import { relativeTime } from "@/lib/format";
import * as haptics from "@/lib/haptics";

export function HiloCard({ hilo }: { hilo: ForoHilo }) {
  return (
    <Link href={`/foros/${hilo.id}` as never} asChild>
      <Pressable onPress={() => haptics.tap()}>
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 0.4,
                color: colors.brandInk,
              }}
            >
              {hilo.categoria}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              {relativeTime(hilo.created_at)}
            </Text>
          </View>
          <Text
            numberOfLines={2}
            style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}
          >
            {hilo.titulo}
          </Text>
          <Body numberOfLines={2} style={{ marginTop: 4 }}>
            {hilo.cuerpo}
          </Body>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
            }}
          >
            <Ionicons name="chatbubble-outline" size={14} color={colors.muted} />
            <Text style={{ fontSize: 12, color: colors.muted }}>
              {hilo.respuestas_count} respuestas
            </Text>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
