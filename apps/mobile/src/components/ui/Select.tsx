/**
 * Select-like component. En iOS + Android abre un modal nativo con opciones.
 * Más simple y consistente que el Picker de RN (que en iOS es un wheel y en
 * Android un dropdown, se ven totalmente distintos).
 */

import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors, presets } from "@/lib/theme";
import * as haptics from "@/lib/haptics";

type Option = { label: string; value: string };

type Props = {
  value?: string | null;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

export function Select({
  value,
  options,
  onChange,
  placeholder = "Selecciona",
  style,
}: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => {
          haptics.tap();
          setOpen(true);
        }}
        style={[
          presets.input,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
          style,
        ]}
      >
        <Text
          style={{
            color: current ? colors.ink : colors.muted,
            fontSize: 16,
          }}
        >
          {current?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(10,26,43,0.4)",
            justifyContent: "flex-end",
          }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 12,
              paddingBottom: 32,
              maxHeight: "75%",
            }}
          >
            <View
              style={{
                width: 48,
                height: 5,
                borderRadius: 3,
                backgroundColor: colors.line,
                alignSelf: "center",
                marginBottom: 12,
              }}
            />
            <ScrollView>
              {options.map((o) => {
                const sel = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => {
                      haptics.light();
                      onChange(o.value);
                      setOpen(false);
                    }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: sel ? "700" : "400",
                        color: sel ? colors.brandInk : colors.ink,
                      }}
                    >
                      {o.label}
                    </Text>
                    {sel ? (
                      <Ionicons name="checkmark" size={20} color={colors.brand} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
