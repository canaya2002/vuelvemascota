/**
 * Index de avistamientos — el usuario quiere reportar que vio una mascota
 * pero llegó por un atajo (no desde un caso específico). Le mostramos los
 * casos cercanos para que elija cuál matchea con lo que vio.
 *
 * Si no hay coords, mostramos los más recientes.
 */

import { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H1,
  Body,
  Text,
  Eyebrow,
  IconButton,
  CasoCardSkeleton,
  EmptyState,
  ErrorState,
  PremiumButton,
} from "@/components/ui";
import { CasoCard } from "@/components/casos/CasoCard";
import { useCasos } from "@/lib/hooks";
import { getCurrentPosition, type Coords } from "@/lib/location";
import { colors } from "@/lib/theme";

export default function AvistamientoIndexScreen() {
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    (async () => {
      const c = await getCurrentPosition();
      if (c) setCoords(c);
    })();
  }, []);

  const query = useCasos({
    lat: coords?.lat,
    lng: coords?.lng,
    radio_km: coords ? 30 : undefined,
    limit: 20,
  });

  const casos = query.data ?? [];

  return (
    <Screen edges={["top"]} padded={false} scroll>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
        <Eyebrow>Reportar avistamiento</Eyebrow>
        <H1
          style={{
            fontSize: 30,
            letterSpacing: -0.6,
            lineHeight: 36,
            marginTop: 8,
          }}
        >
          ¿Cuál mascota viste?
        </H1>
        <Body
          style={{
            color: colors.inkSoft,
            fontSize: 14.5,
            lineHeight: 21,
            marginTop: 8,
          }}
        >
          {coords
            ? "Te mostramos los casos abiertos en un radio de 30 km. Toca el que coincida con la mascota que viste."
            : "Activa tu ubicación o busca por ciudad para ver casos cercanos."}
        </Body>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 10, paddingBottom: 40 }}>
        {query.isPending ? (
          <>
            <CasoCardSkeleton />
            <CasoCardSkeleton />
            <CasoCardSkeleton />
          </>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : casos.length === 0 ? (
          <View style={{ paddingVertical: 30 }}>
            <EmptyState
              icon="paw-outline"
              title="No hay casos cerca"
              description={
                coords
                  ? "Aún no hay reportes activos en tu zona. Si encontraste una mascota sin reporte, créale uno desde la pestaña Reportar."
                  : "Activa la ubicación desde Ajustes para ver casos cerca de ti."
              }
              action={
                <PremiumButton
                  label="Crear reporte"
                  size="md"
                  onPress={() => router.push("/(tabs)/reportar")}
                  style={{ marginTop: 8 }}
                />
              }
            />
          </View>
        ) : (
          <>
            <Text
              style={{
                marginLeft: 4,
                marginBottom: 4,
                fontSize: 11,
                fontWeight: "700",
                color: colors.muted,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              {casos.length} {casos.length === 1 ? "caso" : "casos"} cerca
            </Text>
            {casos.map((c) => (
              <CasoCard
                key={c.id}
                caso={c}
                onPress={() => router.push(`/avistamiento/${c.slug}` as never)}
              />
            ))}
          </>
        )}
      </View>
    </Screen>
  );
}
