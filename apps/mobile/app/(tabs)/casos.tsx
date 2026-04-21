/**
 * Feed de casos. Permite filtrar por tipo/especie y, si el usuario otorga
 * ubicación, ordena por distancia.
 */

import { useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

import {
  Screen,
  H2,
  Body,
  Button,
  CasoCardSkeleton,
  EmptyState,
  ErrorState,
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
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 8 }}>
        <H2>Casos cerca</H2>
        <Body style={{ color: colors.muted }}>
          {coords
            ? "Ordenados por cercanía. Toca uno para ver detalles."
            : locationAsked
              ? "Activa ubicación para ver casos cercanos."
              : " "}
        </Body>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <FiltrosBar
          value={{ tipo, especie }}
          onChange={(v) => {
            setTipo(v.tipo);
            setEspecie(v.especie);
          }}
        />
      </View>

      {casosQuery.isPending ? (
        <View style={{ padding: 20, gap: 12 }}>
          <CasoCardSkeleton />
          <CasoCardSkeleton />
          <CasoCardSkeleton />
          <CasoCardSkeleton />
        </View>
      ) : casosQuery.isError ? (
        <ErrorState onRetry={() => casosQuery.refetch()} />
      ) : casosQuery.data && casosQuery.data.length === 0 ? (
        <EmptyState
          icon="paw-outline"
          title="Sin casos que mostrar"
          description="Cambia los filtros o reporta una mascota tú mismo."
          action={<Button label="Reportar ahora" style={{ marginTop: 8 }} />}
        />
      ) : (
        <FlatList
          data={casosQuery.data}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <CasoCard caso={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 120,
          }}
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
