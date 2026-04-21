/**
 * Photo picker — muestra miniaturas con botón de eliminar y dos botones
 * grandes (cámara + galería). Máximo 6 fotos.
 */

import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/Text";
import { colors } from "@/lib/theme";
import {
  pickFromLibrary,
  takePhoto,
  type LocalPhoto,
} from "@/lib/imagePicker";
import * as haptics from "@/lib/haptics";

type Props = {
  photos: LocalPhoto[];
  onChange: (next: LocalPhoto[]) => void;
  max?: number;
};

export function PhotoPicker({ photos, onChange, max = 6 }: Props) {
  const canAdd = photos.length < max;

  const addFromCamera = async () => {
    haptics.tap();
    const p = await takePhoto();
    if (p) onChange([...photos, p].slice(0, max));
  };

  const addFromLibrary = async () => {
    haptics.tap();
    const remaining = max - photos.length;
    if (remaining <= 0) return;
    const picked = await pickFromLibrary(remaining);
    if (picked.length === 0) return;
    onChange([...photos, ...picked].slice(0, max));
  };

  const remove = (uri: string) => {
    haptics.light();
    onChange(photos.filter((p) => p.uri !== uri));
  };

  return (
    <View style={{ gap: 10 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      >
        {photos.map((p) => (
          <View
            key={p.uri}
            style={{
              width: 120,
              height: 120,
              borderRadius: 16,
              overflow: "hidden",
              position: "relative",
              backgroundColor: colors.line,
            }}
          >
            <Image
              source={{ uri: p.uri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
            <Pressable
              onPress={() => remove(p.uri)}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                backgroundColor: "rgba(10,26,43,0.7)",
                borderRadius: 999,
                width: 24,
                height: 24,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {canAdd ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={addFromCamera}
            style={styles.picker}
          >
            <Ionicons name="camera" size={22} color={colors.brand} />
            <Text style={styles.pickerText}>Tomar foto</Text>
          </Pressable>
          <Pressable
            onPress={addFromLibrary}
            style={styles.picker}
          >
            <Ionicons name="images" size={22} color={colors.brand} />
            <Text style={styles.pickerText}>De galería</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={{ color: colors.muted, fontSize: 13 }}>
          Máximo {max} fotos.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    flex: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.lineStrong,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.surface,
  },
  pickerText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
});
