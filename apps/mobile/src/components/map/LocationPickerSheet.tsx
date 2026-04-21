/**
 * Modal bottom-sheet con mapa interactivo + pin draggable. Al soltar el pin
 * actualizamos las coords y hacemos reverse geocode para sugerir ciudad.
 */

import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Body, Button, H2, IconButton } from "@/components/ui";
import { Map } from "./Map";
import { colors } from "@/lib/theme";
import { getCurrentPosition, reverseGeocode } from "@/lib/location";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (coords: {
    lat: number;
    lng: number;
    city?: string;
    state?: string;
  }) => void;
  initial?: { lat: number; lng: number } | null;
};

export function LocationPickerSheet({
  visible,
  onClose,
  onConfirm,
  initial,
}: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initial ?? null
  );
  const [geo, setGeo] = useState<{ city?: string; state?: string } | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setCoords(initial);
      return;
    }
    (async () => {
      const c = await getCurrentPosition();
      if (c) setCoords(c);
    })();
  }, [visible, initial]);

  useEffect(() => {
    if (!coords) return;
    (async () => {
      const r = await reverseGeocode(coords.lat, coords.lng);
      setGeo(r);
    })();
  }, [coords]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(10,26,43,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 12,
            paddingBottom: 36,
            height: "88%",
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

          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <H2 style={{ fontSize: 22 }}>Elige la ubicación</H2>
            <IconButton onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </IconButton>
          </View>

          <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
            <Body style={{ color: colors.muted }}>
              Arrastra el pin al lugar exacto.
            </Body>
          </View>

          <View style={{ flex: 1, marginHorizontal: 12 }}>
            {coords ? (
              <Map
                lat={coords.lat}
                lng={coords.lng}
                interactive
                height={0}
                style={{ flex: 1, height: undefined }}
                onDragEnd={(c) => setCoords(c)}
                openInNativeMapOnTap={false}
              />
            ) : null}
          </View>

          <View style={{ padding: 20, gap: 10 }}>
            {geo?.city ? (
              <Body style={{ textAlign: "center", color: colors.muted }}>
                {geo.city}
                {geo.state ? ` · ${geo.state}` : ""}
              </Body>
            ) : null}
            <Button
              label="Usar esta ubicación"
              block
              size="lg"
              disabled={!coords}
              onPress={() => {
                if (!coords) return;
                onConfirm({ ...coords, city: geo?.city, state: geo?.state });
                onClose();
              }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
