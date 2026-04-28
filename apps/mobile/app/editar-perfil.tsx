/**
 * Editar perfil — pantalla nativa premium con foto, nombre, ciudad, estado,
 * rol y bio. La foto se guarda en Clerk (UserResource.setProfileImage). El
 * resto de los campos viven en la tabla `usuarios` de Supabase.
 */

import { useEffect, useState } from "react";
import { Alert, Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";

import {
  Screen,
  H1,
  Body,
  Eyebrow,
  Input,
  IconButton,
  Select,
  LoadingState,
  ErrorState,
  PremiumButton,
  Text,
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
  const { user } = useUser();

  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [rol, setRol] = useState<PerfilRol | "">("");
  const [bio, setBio] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    if (perfil.data) {
      setNombre(perfil.data.nombre ?? "");
      setCiudad(perfil.data.ciudad ?? "");
      setEstado(perfil.data.estado ?? "");
      setRol((perfil.data.rol as PerfilRol | null) ?? "");
      setBio(perfil.data.bio ?? "");
    }
  }, [perfil.data]);

  const pickPhoto = async () => {
    haptics.light();
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permiso de fotos requerido",
        "Activa el permiso de galería en Ajustes."
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];
    setPhotoBusy(true);
    try {
      // Clerk Expo acepta este shape RN-style en runtime aunque el typing
      // oficial dice Blob | File. Casteamos a never para silenciar TS.
      const file = {
        uri: asset.uri,
        name: `avatar.${asset.uri.split(".").pop() ?? "jpg"}`,
        type: asset.mimeType ?? "image/jpeg",
      } as unknown as Blob;
      await user?.setProfileImage({ file });
      haptics.success();
    } catch (err) {
      haptics.error();
      Alert.alert("No pudimos subir la foto", errorMessage(err));
    } finally {
      setPhotoBusy(false);
    }
  };

  const submit = async () => {
    try {
      await update.mutateAsync({
        nombre: nombre || null,
        ciudad: ciudad || null,
        estado: estado || null,
        rol: (rol || null) as PerfilRol | null,
        bio: bio || null,
      });
      // También actualizamos firstName en Clerk si cambió.
      if (user && nombre && nombre !== user.firstName) {
        try {
          await user.update({ firstName: nombre });
        } catch {
          /* no bloqueamos guardado del perfil local */
        }
      }
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

  const avatarUri = user?.imageUrl;
  const initials = (nombre || user?.firstName || "U")
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <Screen edges={["top"]} scroll>
      <View style={{ marginBottom: 12 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ gap: 22, paddingBottom: 60 }}>
        <View>
          <Eyebrow>Editar perfil</Eyebrow>
          <H1
            style={{
              fontSize: 30,
              letterSpacing: -0.7,
              marginTop: 6,
              lineHeight: 36,
            }}
          >
            Cómo te ven en la red.
          </H1>
        </View>

        {/* --- Avatar --- */}
        <View style={{ alignItems: "center", paddingVertical: 12 }}>
          <Pressable
            onPress={pickPhoto}
            disabled={photoBusy}
            style={{
              width: 116,
              height: 116,
              borderRadius: 58,
              backgroundColor: colors.brandSoft,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.ink,
              shadowOpacity: 0.08,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 116, height: 116, borderRadius: 58 }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 42,
                  fontWeight: "700",
                  color: colors.brandInk,
                  letterSpacing: -1,
                }}
              >
                {initials}
              </Text>
            )}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.ink,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: colors.bg,
              }}
            >
              <Ionicons
                name={photoBusy ? "cloud-upload" : "camera"}
                size={16}
                color="#fff"
              />
            </View>
          </Pressable>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginTop: 12,
              fontWeight: "500",
            }}
          >
            Toca para cambiar foto
          </Text>
        </View>

        {/* --- Inputs --- */}
        <View style={{ gap: 18 }}>
          <Input
            label="Nombre público"
            placeholder="Cómo te llamas"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            leading={
              <Ionicons name="person-outline" size={18} color={colors.muted} />
            }
          />

          <View style={{ gap: 7 }}>
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: "700",
                color: colors.muted,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              Ciudad
            </Text>
            <Select
              value={ciudad}
              onChange={setCiudad}
              placeholder="Selecciona tu ciudad"
              options={(cities.data ?? []).map((c) => ({
                label: c.name,
                value: c.name,
              }))}
            />
          </View>

          <View style={{ gap: 7 }}>
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: "700",
                color: colors.muted,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              Estado
            </Text>
            <Select
              value={estado}
              onChange={setEstado}
              placeholder="Selecciona estado"
              options={ESTADOS_MX.map((e) => ({ label: e, value: e }))}
            />
          </View>

          <View style={{ gap: 7 }}>
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: "700",
                color: colors.muted,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              Rol en la comunidad
            </Text>
            <Select
              value={rol}
              onChange={(v) => setRol(v as PerfilRol)}
              placeholder="Selecciona"
              options={ROLES}
            />
          </View>

          <Input
            label="Bio"
            placeholder="Cuéntanos brevemente qué haces en la comunidad."
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
            style={{ minHeight: 100, textAlignVertical: "top", paddingTop: 12 }}
            helper={`${bio.length}/400`}
          />
        </View>

        <PremiumButton
          label="Guardar cambios"
          size="lg"
          block
          loading={update.isPending}
          onPress={submit}
        />
      </View>
    </Screen>
  );
}
