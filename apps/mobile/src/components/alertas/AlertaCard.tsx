import { Alert, Pressable, Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Body, Card, Text } from "@/components/ui";
import type { Alerta } from "@vuelvecasa/shared";
import { colors } from "@/lib/theme";
import * as haptics from "@/lib/haptics";

type Props = {
  alerta: Alerta;
  onToggle: (id: string, activa: boolean) => void;
  onDelete: (id: string) => void;
};

export function AlertaCard({ alerta, onToggle, onDelete }: Props) {
  const radio =
    alerta.radio_m >= 1000
      ? `${(alerta.radio_m / 1000).toFixed(0)} km`
      : `${alerta.radio_m} m`;

  const confirmDelete = () => {
    haptics.warn();
    Alert.alert("¿Borrar alerta?", "Ya no recibirás avisos de esta zona.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: () => onDelete(alerta.id),
      },
    ]);
  };

  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}
          >
            {alerta.ciudad ?? "Tu zona"}
            {alerta.colonia ? ` · ${alerta.colonia}` : ""}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="resize" size={14} color={colors.muted} />
            <Text style={{ fontSize: 13, color: colors.muted }}>
              Radio {radio}
            </Text>
          </View>
          {alerta.especies.length > 0 ? (
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              {alerta.especies.map((e) => (
                <View
                  key={e}
                  style={{
                    backgroundColor: colors.line,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 9999,
                  }}
                >
                  <Text style={{ fontSize: 11, color: colors.inkSoft }}>
                    {e}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        <Switch
          value={alerta.activa}
          onValueChange={(v) => {
            haptics.light();
            onToggle(alerta.id, v);
          }}
          trackColor={{ false: colors.line, true: colors.brand }}
        />
      </View>

      <Pressable
        onPress={confirmDelete}
        hitSlop={12}
        style={{
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Ionicons name="trash-outline" size={14} color={colors.muted} />
        <Body style={{ fontSize: 13, color: colors.muted }}>Borrar alerta</Body>
      </Pressable>
    </Card>
  );
}
