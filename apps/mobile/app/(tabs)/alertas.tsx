import { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H1,
  Body,
  EmptyState,
  LoadingState,
  ErrorState,
  Eyebrow,
  AuroraBackground,
  AnimatedEntry,
  GlassSurface,
  PremiumButton,
  Hero,
  Text,
} from "@/components/ui";
import { AlertaCard } from "@/components/alertas/AlertaCard";
import { NuevaAlertaSheet } from "@/components/alertas/NuevaAlertaSheet";
import {
  useAlertas,
  useToggleAlerta,
  useDeleteAlerta,
} from "@/lib/hooks";
import { colors } from "@/lib/theme";

export default function AlertasScreen() {
  const query = useAlertas();
  const toggle = useToggleAlerta();
  const remove = useDeleteAlerta();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Screen edges={["top"]} padded={false}>
      <AuroraBackground variant="sunrise" />

      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <AnimatedEntry delay={40}>
          <View style={{ gap: 6, marginBottom: 14 }}>
            <Eyebrow>Mis alertas</Eyebrow>
            <H1 style={{ fontSize: 30, letterSpacing: -0.8 }}>
              Te avisamos cerca de ti.
            </H1>
            <Body style={{ color: colors.inkSoft, fontSize: 14 }}>
              Recibe push cuando alguien reporte una mascota en tu zona.
            </Body>
          </View>
        </AnimatedEntry>

        <AnimatedEntry delay={140}>
          <Hero preset="forest" overlay="soft" style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.22)",
                }}
              >
                <Ionicons name="wifi" size={16} color="#fff" />
              </View>
              <Text
                style={{
                  color: "rgba(255,255,255,0.95)",
                  fontSize: 11,
                  fontWeight: "800",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Tu zona está escuchando
              </Text>
            </View>
            <Text style={{ color: "#fff", fontSize: 15, lineHeight: 20 }}>
              Cada caso reportado dentro de tu radio activa una notificación
              instantánea en tu teléfono.
            </Text>
            <View style={{ marginTop: 14 }}>
              <PremiumButton
                label="Nueva alerta"
                variant="glass"
                size="md"
                leading={<Ionicons name="add" size={16} color={colors.ink} />}
                onPress={() => setSheetOpen(true)}
              />
            </View>
          </Hero>
        </AnimatedEntry>
      </View>

      {query.isPending ? (
        <LoadingState label="Cargando alertas..." />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data && query.data.length === 0 ? (
        <View style={{ paddingHorizontal: 20 }}>
          <GlassSurface>
            <EmptyState
              icon="notifications-outline"
              title="Aún sin alertas"
              description="Crea tu primera alerta por zona y especie."
              action={
                <PremiumButton
                  label="Crear alerta"
                  leading={<Ionicons name="add" size={16} color="#fff" />}
                  onPress={() => setSheetOpen(true)}
                  style={{ marginTop: 12 }}
                />
              }
            />
          </GlassSurface>
        </View>
      ) : (
        <FlatList
          data={query.data}
          keyExtractor={(a) => a.id}
          renderItem={({ item, index }) => (
            <AnimatedEntry delay={index < 6 ? 240 + index * 70 : 0}>
              <AlertaCard
                alerta={item}
                onToggle={(id, activa) => toggle.mutate({ id, activa })}
                onDelete={(id) => remove.mutate(id)}
              />
            </AnimatedEntry>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 160 }}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching && !query.isPending}
              onRefresh={() => query.refetch()}
              tintColor={colors.brand}
            />
          }
        />
      )}

      <NuevaAlertaSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}
