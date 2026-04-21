/**
 * Lista de hilos. Usuario puede filtrar por categoría vía chips y crear un
 * hilo nuevo con el FAB de arriba.
 */

import { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H2,
  Button,
  Chip,
  EmptyState,
  HiloSkeleton,
  ErrorState,
  IconButton,
  Eyebrow,
} from "@/components/ui";
import { HiloCard } from "@/components/foros/HiloCard";
import { useForos } from "@/lib/hooks";
import { colors } from "@/lib/theme";
import type { ForoCategoria } from "@vuelvecasa/shared";

const CATEGORIAS: { label: string; value: ForoCategoria }[] = [
  { label: "Experiencias", value: "experiencias" },
  { label: "Consejos", value: "consejos" },
  { label: "Rescates", value: "rescates" },
  { label: "Búsqueda", value: "busqueda" },
  { label: "Adopción", value: "adopcion" },
  { label: "Otros", value: "otros" },
];

export default function ForosIndex() {
  const [cat, setCat] = useState<ForoCategoria | undefined>();
  const query = useForos(cat);

  return (
    <Screen edges={["top"]} padded={false}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
        <IconButton
          tone="brand"
          onPress={() => router.push("/foros/nuevo" as never)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </IconButton>
      </View>

      <View style={{ paddingHorizontal: 20, gap: 4, marginTop: 10 }}>
        <Eyebrow>Foros</Eyebrow>
        <H2>Conversaciones de la comunidad.</H2>
      </View>

      <View style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ label: "Todos", value: undefined }, ...CATEGORIAS]}
          keyExtractor={(c) => c.value ?? "all"}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          contentContainerStyle={{ paddingHorizontal: 4 }}
          renderItem={({ item }) => (
            <Chip
              label={item.label}
              selected={cat === item.value}
              onPress={() => setCat(item.value as ForoCategoria | undefined)}
            />
          )}
        />
      </View>

      {query.isPending ? (
        <View style={{ padding: 20, gap: 10 }}>
          <HiloSkeleton />
          <HiloSkeleton />
          <HiloSkeleton />
        </View>
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : (query.data?.hilos ?? []).length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="Aún no hay hilos"
          description="Sé el primero en empezar una conversación."
          action={
            <Button
              label="Crear hilo"
              onPress={() => router.push("/foros/nuevo" as never)}
              style={{ marginTop: 8 }}
            />
          }
        />
      ) : (
        <FlatList
          data={query.data?.hilos ?? []}
          keyExtractor={(h) => h.id}
          renderItem={({ item }) => <HiloCard hilo={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching && !query.isPending}
              onRefresh={() => query.refetch()}
              tintColor={colors.brand}
            />
          }
        />
      )}
    </Screen>
  );
}
