/**
 * Feed de casos con aurora de fondo, hero de texto e items animados
 * entrando en stagger.
 */

import { useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

import {
  Screen,
  H1,
  Body,
  Button,
  CasoCardSkeleton,
  EmptyState,
  ErrorState,
  AuroraBackground,
  AnimatedEntry,
  GlassSurface,
  Eyebrow,
  PulseDot,
  Text,
} from "@/components/ui";
import { CasoCard } from "@/components/casos/CasoCard";
import { FiltrosBar } from "@/components/casos/FiltrosBar";
import { useCasos } from "@/lib/hooks";
import { getCurrentPosition, type Coords } from "@/lib/location";
import { colors } from "@/lib/theme";
import type { CasoEspecie, CasoTipo } from "@vuelvecasa/shared";

export default function CasosListScreen() {
  const [tipo, setTipo] = useState<CasoTipo | undefined>();
  const [especie, setEspecie] = useState<CasoEspecie | undefined>();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationAsked, setLocationAsked] = useState(false);

  useEffect(() => {
    (async () => {
      const c = await getCurrentPosition();
      if (c) setCoords(c);
      setLocationAsked(true);
    })();
  }, []);

  const filters = useMemo(
    () => ({
      tipo,
      especie,
      lat: coords?.lat,
      lng: coords?.lng,
      radio_km: coords ? 50 : undefined,
      limit: 30,
    }),
    [tipo, especie, coords]
  );

  const casosQuery = useCasos(filters);

  return (
    <Screen edges={["top"]} padded={false}>
      <AuroraBackground variant="rose" />

      <AnimatedEntry delay={40}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <PulseDot size={7} color={colors.brand} />
            <Eyebrow>Casos en vivo</Eyebrow>
          </View>
          <H1 style={{ fontSize: 30, letterSpacing: -0.8 }}>
            Cada historia empieza con una búsqueda.
          </H1>
          <Body style={{ color: colors.inkSoft, fontSize: 14 }}>
            {coords
              ? "Ordenados por cercanía. Toca uno para ver detalles."
              : locationAsked
                ? "Activa ubicación para ver casos cercanos."
                : "Cargando ubicación…"}
          </Body>
        </View>
      </AnimatedEntry>

      <AnimatedEntry delay={120}>
        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          <FiltrosBar
            value={{ tipo, especie }}
            onChange={(v) => {
              setTipo(v.tipo);
              setEspecie(v.especie);
            }}
          />
        </View>
      </AnimatedEntry>

      {casosQuery.isPending ? (
        <View style={{ padding: 18, gap: 12 }}>
          <CasoCardSkeleton />
          <CasoCardSkeleton />
          <CasoCardSkeleton />
          <CasoCardSkeleton />
        </View>
      ) : casosQuery.isError ? (
        <ErrorState error={casosQuery.error} onRetry={() => casosQuery.refetch()} />
      ) : casosQuery.data && casosQuery.data.length === 0 ? (
        <View style={{ padding: 18 }}>
          <GlassSurface>
            <EmptyState
              icon="paw-outline"
              title="Sin casos que mostrar"
              description="Cambia los filtros o reporta una mascota tú mismo."
              action={<Button label="Reportar ahora" style={{ marginTop: 8 }} />}
            />
          </GlassSurface>
        </View>
      ) : (
        <FlatList
          data={casosQuery.data}
          keyExtractor={(c) => c.id}
          renderItem={({ item, index }) => (
            <AnimatedEntry delay={index < 8 ? 180 + index * 60 : 0}>
              <CasoCard caso={item} />
            </AnimatedEntry>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{
            padding: 18,
            paddingBottom: 160,
          }}
          ListHeaderComponent={
            casosQuery.data && casosQuery.data.length > 0 ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  paddingTop: 4,
                }}
              >
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {casosQuery.data.length} resultados
                </Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={casosQuery.isRefetching && !casosQuery.isPending}
              onRefresh={() => casosQuery.refetch()}
              tintColor={colors.brand}
            />
          }
        />
      )}
    </Screen>
  );
}
