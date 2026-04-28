/**
 * Hub de Comunidad. Reemplaza los 4 canales fijos. Tres bloques:
 *  1. Mis vistas — filtros guardados (al tap → lista de casos filtrada).
 *  2. Comunidad global — canal único con gate de reputación.
 *  3. Hilos por caso — entrada al chat del caso desde el detalle del caso.
 */

import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H1,
  Body,
  Card,
  Eyebrow,
  IconButton,
  Text,
  EmptyState,
  LoadingState,
  ErrorState,
  AnimatedEntry,
  GlassSurface,
  TiltPressable,
} from "@/components/ui";
import { colors } from "@/lib/theme";
import { useVistas } from "@/lib/hooks";
import * as haptics from "@/lib/haptics";

export default function ComunidadHub() {
  const vistas = useVistas();

  return (
    <Screen edges={["top"]} scroll>
      <View style={{ marginBottom: 12 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ gap: 18, paddingBottom: 80 }}>
        <View>
          <Eyebrow>Comunidad</Eyebrow>
          <H1
            style={{ fontSize: 28, letterSpacing: -0.6, marginTop: 4, lineHeight: 34 }}
          >
            Vistas y conversaciones.
          </H1>
          <Body style={{ color: colors.muted, marginTop: 6, fontSize: 13 }}>
            Crea vistas con filtros para ver solo lo que te importa. La
            conversación vive dentro de cada caso para evitar spam.
          </Body>
        </View>

        {/* --- Mis vistas --- */}
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: colors.muted,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              Mis vistas
            </Text>
            <Pressable
              onPress={() => {
                haptics.tap();
                router.push("/chat/vista/nueva" as never);
              }}
              accessibilityLabel="Crear nueva vista"
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text
                style={{ color: colors.brand, fontWeight: "700", fontSize: 13 }}
              >
                + Nueva
              </Text>
            </Pressable>
          </View>

          {vistas.isPending ? (
            <LoadingState compact />
          ) : vistas.isError ? (
            <ErrorState error={vistas.error} onRetry={() => vistas.refetch()} />
          ) : (vistas.data ?? []).length === 0 ? (
            <Card style={{ padding: 18, gap: 8 }}>
              <Text style={{ fontSize: 15, color: colors.ink, fontWeight: "700" }}>
                Crea tu primera vista
              </Text>
              <Body style={{ fontSize: 13, color: colors.muted }}>
                Por ejemplo: "Perros perdidos cerca de casa" o "Urgentes en mi
                ciudad esta semana".
              </Body>
              <Pressable
                onPress={() => {
                  haptics.tap();
                  router.push("/chat/vista/nueva" as never);
                }}
                style={{
                  marginTop: 8,
                  alignSelf: "flex-start",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 999,
                  backgroundColor: colors.brand,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                  Crear vista
                </Text>
              </Pressable>
            </Card>
          ) : (
            (vistas.data ?? []).map((v, i) => (
              <AnimatedEntry key={v.id} delay={60 * i}>
                <TiltPressable
                  onPress={() => {
                    haptics.tap();
                    router.push(`/chat/vista/${v.id}` as never);
                  }}
                  tilt={2}
                  style={{ borderRadius: 18 }}
                >
                  <GlassSurface radius={18}>
                    <View
                      style={{
                        padding: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
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
                        <Ionicons name="filter" size={18} color={colors.brandInk} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{ fontSize: 15, fontWeight: "700", color: colors.ink }}
                        >
                          {v.nombre}
                        </Text>
                        <Text
                          style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}
                          numberOfLines={1}
                        >
                          {summarizeFiltros(v.filtros)}
                        </Text>
                      </View>
                      {v.publica ? (
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 999,
                            backgroundColor: colors.bgAlt,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "700",
                              color: colors.muted,
                              letterSpacing: 0.6,
                              textTransform: "uppercase",
                            }}
                          >
                            Pública
                          </Text>
                        </View>
                      ) : null}
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.muted}
                      />
                    </View>
                  </GlassSurface>
                </TiltPressable>
              </AnimatedEntry>
            ))
          )}
        </View>

        {/* --- Comunidad global --- */}
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: colors.muted,
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            Conversación
          </Text>

          <TiltPressable
            tilt={2}
            onPress={() => {
              haptics.tap();
              router.push("/chat/comunidad" as never);
            }}
            style={{ borderRadius: 18 }}
          >
            <Card style={{ padding: 14, gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
                  <Ionicons name="chatbubbles" size={18} color={colors.brandInk} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: "700", color: colors.ink }}
                  >
                    Comunidad global
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}
                  >
                    Canal único para anuncios y dudas. Solo cuentas con
                    reputación pueden iniciar mensajes.
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.muted}
                />
              </View>
            </Card>
          </TiltPressable>
        </View>

        {/* --- Cómo funciona --- */}
        <View
          style={{
            backgroundColor: colors.bgAlt,
            borderRadius: 18,
            padding: 14,
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.ink }}>
            Cómo evitamos el spam
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
            • Casos nuevos: solo cuentas con +7 días o 3 casos confirmados pueden
            iniciar conversación abierta.{"\n"}
            • 3 reportes ocultan un mensaje y silencian al autor 24h.{"\n"}
            • Mantén pulsado un mensaje para reportar o silenciar a su autor.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function summarizeFiltros(f: import("@vuelvecasa/shared").VistaFiltros): string {
  const parts: string[] = [];
  if (f.tipo?.length) parts.push(f.tipo.join(" / "));
  if (f.especies?.length) parts.push(f.especies.join(" + "));
  if (f.ciudad) parts.push(f.ciudad);
  if (f.colonia) parts.push(f.colonia);
  if (f.radio_km) parts.push(`${f.radio_km}km`);
  if (f.recientes_horas) parts.push(`<${f.recientes_horas}h`);
  if (f.solo_verificados) parts.push("verificados");
  return parts.join(" · ") || "Sin filtros";
}
