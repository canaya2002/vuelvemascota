/**
 * Detalle de una vista guardada: corre el filtro y muestra los casos
 * resultantes. Botones para editar privacidad / borrar.
 */

import { useMemo } from "react";
import { Alert, FlatList, Pressable, RefreshControl, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H2,
  Body,
  IconButton,
  EmptyState,
  ErrorState,
  LoadingState,
  Text,
} from "@/components/ui";
import { CasoCard } from "@/components/casos/CasoCard";
import {
  useCasos,
  useDeleteVista,
  useUpdateVista,
  useVista,
} from "@/lib/hooks";
import { colors } from "@/lib/theme";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";
import type { Caso, Vista, VistaFiltros } from "@vuelvecasa/shared";

export default function VistaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vista = useVista(id);
  const updateVista = useUpdateVista(id ?? "");
  const deleteVista = useDeleteVista();

  const filters = useMemo(() => buildListFilters(vista.data?.filtros), [vista.data?.filtros]);
  const casos = useCasos(filters);

  const filtered = useMemo(() => {
    const f = vista.data?.filtros;
    if (!f || !casos.data) return casos.data ?? [];
    return casos.data.filter((c) => matchesClientSide(c, f));
  }, [casos.data, vista.data?.filtros]);

  if (vista.isPending) {
    return (
      <Screen edges={["top"]}>
        <LoadingState label="Cargando vista..." />
      </Screen>
    );
  }
  if (vista.isError || !vista.data) {
    return (
      <Screen edges={["top"]}>
        <ErrorState error={vista.error} onRetry={() => vista.refetch()} />
      </Screen>
    );
  }

  const v = vista.data;

  const togglePublica = async () => {
    haptics.medium();
    try {
      await updateVista.mutateAsync({ publica: !v.publica });
    } catch (err) {
      Alert.alert("No se pudo actualizar", errorMessage(err));
    }
  };

  const remove = () => {
    haptics.warn();
    Alert.alert("Borrar vista", "¿Quieres borrar esta vista? No se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteVista.mutateAsync(v.id);
            router.back();
          } catch (err) {
            Alert.alert("No se pudo borrar", errorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <Screen edges={["top"]} padded={false}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
        <View style={{ flex: 1 }}>
          <H2 style={{ fontSize: 22 }} numberOfLines={1}>
            {v.nombre}
          </H2>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
            {summarize(v.filtros)}
          </Text>
        </View>
        <Pressable
          onPress={togglePublica}
          accessibilityLabel="Alternar pública"
          accessibilityRole="button"
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: v.publica ? colors.brand : colors.bgAlt,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: v.publica ? "#fff" : colors.muted,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {v.publica ? "Pública" : "Privada"}
          </Text>
        </Pressable>
        <IconButton onPress={remove}>
          <Ionicons name="trash-outline" size={18} color={colors.brand} />
        </IconButton>
      </View>

      {casos.isPending ? (
        <LoadingState label="Buscando casos..." />
      ) : casos.isError ? (
        <ErrorState error={casos.error} onRetry={() => casos.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="paw-outline"
          title="Sin coincidencias todavía"
          description="Cuando aparezcan casos que cumplan tus filtros, los verás aquí."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              <CasoCard caso={item} />
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 80,
          }}
          refreshControl={
            <RefreshControl
              refreshing={casos.isRefetching}
              onRefresh={() => casos.refetch()}
              tintColor={colors.brand}
            />
          }
        />
      )}
    </Screen>
  );
}

function buildListFilters(f: VistaFiltros | undefined) {
  if (!f) return {};
  return {
    tipo: f.tipo?.[0],
    especie: f.especies?.[0],
    ciudad: f.ciudad,
    municipio: f.municipio,
    radio_km: f.radio_km,
    limit: 60,
  };
}

function matchesClientSide(c: Caso, f: VistaFiltros): boolean {
  if (f.tipo?.length && !f.tipo.includes(c.tipo)) return false;
  if (f.especies?.length && !f.especies.includes(c.especie)) return false;
  if (f.colonia && c.colonia && !c.colonia.toLowerCase().includes(f.colonia.toLowerCase()))
    return false;
  if (f.estado_caso?.length && !f.estado_caso.includes(c.estado as never))
    return false;
  if (f.recientes_horas) {
    const cutoff = Date.now() - f.recientes_horas * 3_600_000;
    if (new Date(c.created_at).getTime() < cutoff) return false;
  }
  return true;
}

function summarize(f: VistaFiltros): string {
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
