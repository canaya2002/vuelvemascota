/**
 * Reportar un avistamiento de un caso específico. El usuario captura:
 *  - descripción libre
 *  - opcionalmente su ubicación actual
 *  - opcionalmente nombre y teléfono (si no está logueado, son requeridos)
 */

import { useState } from "react";
import { Alert, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";

import {
  Screen,
  H2,
  Body,
  Button,
  Input,
  FormField,
  IconButton,
} from "@/components/ui";
import { useCrearAvistamiento } from "@/lib/hooks";
import { getCurrentPosition } from "@/lib/location";
import { colors } from "@/lib/theme";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";

export default function AvistamientoScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isSignedIn } = useAuth();

  const [descripcion, setDescripcion] = useState("");
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingGeo, setGettingGeo] = useState(false);

  const mutation = useCrearAvistamiento();

  const getLocation = async () => {
    setGettingGeo(true);
    const c = await getCurrentPosition();
    if (c) {
      setCoords(c);
      haptics.success();
    } else {
      Alert.alert(
        "Sin ubicación",
        "Permite acceso a tu ubicación para registrar el lugar exacto."
      );
    }
    setGettingGeo(false);
  };

  const submit = async () => {
    if (descripcion.trim().length < 10) {
      Alert.alert(
        "Descripción corta",
        "Cuéntanos al menos una frase de lo que viste."
      );
      return;
    }
    try {
      await mutation.mutateAsync({
        caso_slug: slug,
        descripcion: descripcion.trim(),
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        autor_nombre: nombre || null,
        autor_contacto: contacto || null,
      });
      haptics.success();
      Alert.alert(
        "¡Gracias!",
        "Avisamos al dueño con los datos que compartiste."
      );
      router.back();
    } catch (err) {
      haptics.error();
      Alert.alert("No se pudo enviar", errorMessage(err));
    }
  };

  return (
    <Screen edges={["top"]} scroll>
      <View style={{ marginBottom: 8 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ gap: 18 }}>
        <H2>Reportar avistamiento</H2>
        <Body>
          Cualquier detalle ayuda: dónde lo viste, cómo se veía, si se movía
          solo o con alguien.
        </Body>

        <FormField label="¿Qué viste?">
          <Input
            placeholder="Ej. Vi un perro beige con collar rojo caminando solo en la colonia Roma."
            multiline
            numberOfLines={5}
            value={descripcion}
            onChangeText={setDescripcion}
            style={{ minHeight: 120, textAlignVertical: "top" }}
          />
        </FormField>

        <Button
          label={
            coords
              ? `Ubicación capturada (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
              : "Usar mi ubicación actual"
          }
          variant={coords ? "outline" : "dark"}
          block
          loading={gettingGeo}
          leading={
            <Ionicons
              name={coords ? "checkmark-circle" : "location"}
              size={18}
              color={coords ? colors.accent : "#fff"}
            />
          }
          onPress={getLocation}
        />

        {!isSignedIn ? (
          <>
            <FormField label="Tu nombre (opcional)">
              <Input
                placeholder="Como quieres que te llamen"
                value={nombre}
                onChangeText={setNombre}
              />
            </FormField>
            <FormField label="Teléfono / WhatsApp (opcional)">
              <Input
                placeholder="+52..."
                keyboardType="phone-pad"
                value={contacto}
                onChangeText={setContacto}
              />
            </FormField>
          </>
        ) : null}

        <Button
          label="Enviar aviso al dueño"
          size="lg"
          block
          loading={mutation.isPending}
          onPress={submit}
          style={{ marginTop: 8 }}
        />
      </View>
    </Screen>
  );
}
