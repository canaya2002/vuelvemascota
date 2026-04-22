import { Alert, Pressable, Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text, GlassSurface } from "@/components/ui";
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
    <GlassSurface radius={22}>
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: alerta.activa ? colors.brandSoft : colors.line,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={alerta.activa ? "notifications" : "notifications-off-outline"}
                  size={14}
                  color={alerta.activa ? colors.brandInk : colors.muted}
                />
              </View>
              <Text
                style={{ fontSize: 16, fontWeight: "800", color: colors.ink, letterSpacing: -0.2 }}
              >
                {alerta.ciudad ?? "Tu zona"}
                {alerta.colonia ? ` · ${alerta.colonia}` : ""}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2, marginLeft: 36 }}>
              <Ionicons name="resize" size={12} color={colors.muted} />
              <Text style={{ fontSize: 12, color: colors.muted }}>
                Radio {radio}
              </Text>
            </View>
            {alerta.especies.length > 0 ? (
              <View
                style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 8, marginLeft: 36 }}
              >
                {alerta.especies.map((e) => (
                  <View
                    key={e}
                    style={{
                      backgroundColor: colors.brandSoft,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 9999,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.brandInk, fontWeight: "700" }}>
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
            marginTop: 14,
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 4,
          }}
        >
          <Ionicons name="trash-outline" size={14} color={colors.muted} />
          <Text style={{ fontSize: 13, color: colors.muted, fontWeight: "600" }}>
            Borrar alerta
          </Text>
        </Pressable>
      </View>
    </GlassSurface>
  );
}
