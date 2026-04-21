import { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H2,
  Body,
  Button,
  EmptyState,
  LoadingState,
  ErrorState,
  Eyebrow,
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
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 4 }}>
        <Eyebrow>Mis alertas</Eyebrow>
        <H2>Te avisamos cerca de ti.</H2>
        <Body style={{ color: colors.muted, marginBottom: 8 }}>
          Recibe push cuando alguien reporte una mascota en tu zona.
        </Body>
      </View>

      {query.isPending ? (
        <LoadingState label="Cargando alertas..." />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data && query.data.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="Aún sin alertas"
          description="Crea tu primera alerta por zona y especie."
          action={
            <Button
              label="Nueva alerta"
              leading={<Ionicons name="add" size={18} color="#fff" />}
              onPress={() => setSheetOpen(true)}
              style={{ marginTop: 8 }}
            />
          }
        />
      ) : (
        <FlatList
          data={query.data}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <AlertaCard
              alerta={item}
              onToggle={(id, activa) => toggle.mutate({ id, activa })}
              onDelete={(id) => remove.mutate(id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching && !query.isPending}
              onRefresh={() => query.refetch()}
              tintColor={colors.brand}
            />
          }
          ListFooterComponent={
            <View style={{ marginTop: 20 }}>
              <Button
                label="Nueva alerta"
                variant="outline"
                block
                leading={<Ionicons name="add" size={18} color={colors.ink} />}
                onPress={() => setSheetOpen(true)}
              />
            </View>
          }
        />
      )}

      <NuevaAlertaSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}
