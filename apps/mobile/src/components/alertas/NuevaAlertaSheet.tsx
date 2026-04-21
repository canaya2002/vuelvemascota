/**
 * Modal sheet con el formulario de nueva alerta. Los campos son:
 *  - ciudad (Select)
 *  - colonia (opcional)
 *  - radio (slider con presets)
 *  - especies (multiselect)
 *
 * Opcionalmente la alerta usa coords — si el usuario tiene ubicación
 * activa se usa su posición; si no, solo ciudad/colonia.
 */

import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  Body,
  Button,
  Chip,
  FormField,
  H2,
  IconButton,
  Input,
  Select,
} from "@/components/ui";
import { colors } from "@/lib/theme";
import { useCities, useCreateAlerta } from "@/lib/hooks";
import { getCurrentPosition } from "@/lib/location";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";
import type { CasoEspecie } from "@vuelvecasa/shared";

type Props = { visible: boolean; onClose: () => void };

const RADIOS = [1000, 2500, 5000, 10000];

const ESPECIES: { value: CasoEspecie; label: string }[] = [
  { value: "perro", label: "Perros" },
  { value: "gato", label: "Gatos" },
  { value: "otro", label: "Otros" },
];

export function NuevaAlertaSheet({ visible, onClose }: Props) {
  const cities = useCities();
  const createAlerta = useCreateAlerta();

  const [ciudad, setCiudad] = useState("");
  const [colonia, setColonia] = useState("");
  const [radio, setRadio] = useState(5000);
  const [especies, setEspecies] = useState<CasoEspecie[]>([]);
  const [useGeo, setUseGeo] = useState(false);

  const toggleEspecie = (e: CasoEspecie) => {
    haptics.tap();
    setEspecies((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  };

  const submit = async () => {
    if (!ciudad && !useGeo) {
      Alert.alert("Define una zona", "Selecciona ciudad o activa tu ubicación.");
      return;
    }
    try {
      let coords: { lat: number; lng: number } | null = null;
      if (useGeo) {
        coords = await getCurrentPosition();
        if (!coords) {
          Alert.alert("Sin ubicación", "Permite acceso o elige ciudad.");
          return;
        }
      }
      await createAlerta.mutateAsync({
        ciudad: ciudad || null,
        colonia: colonia || null,
        radio_m: radio,
        especies,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      });
      haptics.success();
      onClose();
      setCiudad("");
      setColonia("");
      setRadio(5000);
      setEspecies([]);
      setUseGeo(false);
    } catch (err) {
      haptics.error();
      Alert.alert("No se pudo crear", errorMessage(err));
    }
  };

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
            paddingBottom: 40,
            maxHeight: "90%",
          }}
        >
          <View
            style={{
              width: 48,
              height: 5,
              borderRadius: 3,
              backgroundColor: colors.line,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />
          <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <H2>Nueva alerta</H2>
              <IconButton onPress={onClose}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </IconButton>
            </View>

            <Body style={{ color: colors.muted }}>
              Te avisamos cuando alguien reporte una mascota que encaje con los
              criterios.
            </Body>

            <FormField label="Ciudad">
              <Select
                value={ciudad}
                onChange={setCiudad}
                placeholder="Selecciona ciudad"
                options={(cities.data ?? []).map((c) => ({
                  label: c.name,
                  value: c.name,
                }))}
              />
            </FormField>

            <FormField label="Colonia (opcional)">
              <Input
                placeholder="Ej. Del Valle"
                value={colonia}
                onChangeText={setColonia}
              />
            </FormField>

            <FormField label="Radio">
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {RADIOS.map((r) => (
                  <Chip
                    key={r}
                    label={r >= 1000 ? `${r / 1000} km` : `${r} m`}
                    selected={radio === r}
                    onPress={() => setRadio(r)}
                  />
                ))}
              </View>
            </FormField>

            <FormField label="Especies (todas si no eliges)">
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {ESPECIES.map((e) => (
                  <Chip
                    key={e.value}
                    label={e.label}
                    selected={especies.includes(e.value)}
                    onPress={() => toggleEspecie(e.value)}
                  />
                ))}
              </View>
            </FormField>

            <Chip
              label={
                useGeo ? "Usará mi ubicación actual" : "Usar mi ubicación actual"
              }
              selected={useGeo}
              onPress={() => setUseGeo((v) => !v)}
            />

            <Button
              label="Crear alerta"
              block
              size="lg"
              loading={createAlerta.isPending}
              onPress={submit}
              style={{ marginTop: 8 }}
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
