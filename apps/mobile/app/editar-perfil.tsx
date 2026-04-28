/**
 * Editar perfil local (datos guardados en nuestra DB — no Clerk user).
 *
 * Sincronizamos: nombre, ciudad, estado, rol, bio. La foto queda manejada
 * por Clerk UserButton / profile (abre la UI nativa de Clerk en Fase 4).
 */

import { useEffect, useState } from "react";
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
  LoadingState,
  ErrorState,
} from "@/components/ui";
import { useCities, usePerfil, useUpdatePerfil } from "@/lib/hooks";
import { ESTADOS_MX } from "@vuelvecasa/shared";
import type { PerfilRol } from "@vuelvecasa/shared";
import { colors } from "@/lib/theme";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";

const ROLES: { label: string; value: PerfilRol }[] = [
  { label: "Dueño / Tutor", value: "dueño" },
  { label: "Voluntario", value: "voluntario" },
  { label: "Rescatista", value: "rescatista" },
  { label: "Veterinaria / Clínica", value: "veterinaria" },
  { label: "Aliado / Negocio", value: "aliado" },
];

export default function EditarPerfilScreen() {
  const perfil = usePerfil();
  const update = useUpdatePerfil();
  const cities = useCities();

  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [rol, setRol] = useState<PerfilRol | "">("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (perfil.data) {
      setNombre(perfil.data.nombre ?? "");
      setCiudad(perfil.data.ciudad ?? "");
      setEstado(perfil.data.estado ?? "");
      setRol((perfil.data.rol as PerfilRol | null) ?? "");
      setBio(perfil.data.bio ?? "");
    }
  }, [perfil.data]);

  const submit = async () => {
    try {
      await update.mutateAsync({
        nombre: nombre || null,
        ciudad: ciudad || null,
        estado: estado || null,
        rol: (rol || null) as PerfilRol | null,
        bio: bio || null,
      });
      haptics.success();
      router.back();
    } catch (err) {
      haptics.error();
      Alert.alert("No se pudo guardar", errorMessage(err));
    }
  };

  if (perfil.isPending) {
    return (
      <Screen edges={["top"]}>
        <LoadingState />
      </Screen>
    );
  }
  if (perfil.isError) {
    return (
      <Screen edges={["top"]}>
        <ErrorState error={perfil.error} onRetry={() => perfil.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]} scroll>
      <View style={{ marginBottom: 8 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ gap: 16, paddingBottom: 40 }}>
        <H2>Editar perfil</H2>
        <Body style={{ color: colors.muted }}>
          Actualiza cómo te ve la comunidad.
        </Body>

        <FormField label="Nombre">
          <Input
            placeholder="Cómo te llamas"
            value={nombre}
            onChangeText={setNombre}
          />
        </FormField>

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

        <FormField label="Estado">
          <Select
            value={estado}
            onChange={setEstado}
            placeholder="Selecciona estado"
            options={ESTADOS_MX.map((e) => ({ label: e, value: e }))}
          />
        </FormField>

        <FormField label="Rol en la comunidad">
          <Select
            value={rol}
            onChange={(v) => setRol(v as PerfilRol)}
            placeholder="Selecciona"
            options={ROLES}
          />
        </FormField>

        <FormField label="Bio">
          <Input
            placeholder="Cuéntanos brevemente qué haces en la comunidad."
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />
        </FormField>

        <Button
          label="Guardar cambios"
          size="lg"
          block
          loading={update.isPending}
          onPress={submit}
          style={{ marginTop: 8 }}
        />
      </View>
    </Screen>
  );
}
