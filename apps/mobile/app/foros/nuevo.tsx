import { useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H2,
  Body,
  Button,
  Input,
  FormField,
  IconButton,
  Select,
} from "@/components/ui";
import { useCrearHilo } from "@/lib/hooks";
import { colors } from "@/lib/theme";
import type { ForoCategoria } from "@vuelvecasa/shared";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";

const CATS: { label: string; value: ForoCategoria }[] = [
  { label: "Experiencias", value: "experiencias" },
  { label: "Consejos", value: "consejos" },
  { label: "Rescates", value: "rescates" },
  { label: "Búsqueda", value: "busqueda" },
  { label: "Adopción", value: "adopcion" },
  { label: "Otros", value: "otros" },
];

export default function NuevoHilo() {
  const create = useCrearHilo();
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [categoria, setCategoria] = useState<ForoCategoria>("experiencias");

  const submit = async () => {
    if (titulo.trim().length < 6) {
      Alert.alert("Título muy corto", "Usa al menos 6 caracteres.");
      return;
    }
    if (cuerpo.trim().length < 20) {
      Alert.alert("Cuerpo muy corto", "Escribe al menos 20 caracteres.");
      return;
    }
    try {
      const created = await create.mutateAsync({
        titulo: titulo.trim(),
        cuerpo: cuerpo.trim(),
        categoria,
      });
      haptics.success();
      router.replace(`/foros/${created.id}` as never);
    } catch (err) {
      haptics.error();
      Alert.alert("No se pudo crear", errorMessage(err));
    }
  };

  return (
    <Screen edges={["top"]} scroll>
      <View style={{ marginBottom: 8 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ gap: 14, paddingBottom: 40 }}>
        <H2>Nuevo hilo</H2>
        <Body style={{ color: colors.muted }}>
          Comparte una experiencia, pide consejo o celebra un rescate.
        </Body>

        <FormField label="Categoría">
          <Select
            value={categoria}
            onChange={(v) => setCategoria(v as ForoCategoria)}
            options={CATS}
          />
        </FormField>

        <FormField label="Título">
          <Input
            placeholder="Ej. ¿Tips para encontrar a un gato?"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={100}
          />
        </FormField>

        <FormField label="Cuerpo">
          <Input
            placeholder="Cuéntanos lo que sepas o lo que necesites."
            multiline
            numberOfLines={8}
            value={cuerpo}
            onChangeText={setCuerpo}
            style={{ minHeight: 180, textAlignVertical: "top" }}
          />
        </FormField>

        <Button
          label="Publicar"
          size="lg"
          block
          loading={create.isPending}
          onPress={submit}
        />
      </View>
    </Screen>
  );
}
