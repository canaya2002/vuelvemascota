/**
 * Helpers para tomar/elegir fotos. Siempre devolvemos `LocalPhoto[]` que
 * encapsula el formato que espera `FormData` en RN: { uri, name, type }.
 */

import * as ImagePicker from "expo-image-picker";

export type LocalPhoto = {
  uri: string;
  name: string;
  type: string;
};

function inferFromUri(uri: string): { name: string; type: string } {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png"))
    return { name: `photo-${Date.now()}.png`, type: "image/png" };
  if (lower.endsWith(".heic"))
    return { name: `photo-${Date.now()}.heic`, type: "image/heic" };
  return { name: `photo-${Date.now()}.jpg`, type: "image/jpeg" };
}

export async function pickFromLibrary(max = 6): Promise<LocalPhoto[]> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return [];
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: max,
    quality: 0.85,
    exif: false,
  });
  if (res.canceled) return [];
  return res.assets.map((a) => ({
    uri: a.uri,
    ...inferFromUri(a.uri),
  }));
}

export async function takePhoto(): Promise<LocalPhoto | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.85,
    exif: false,
    cameraType: ImagePicker.CameraType.back,
  });
  if (res.canceled || !res.assets[0]) return null;
  const a = res.assets[0];
  return { uri: a.uri, ...inferFromUri(a.uri) };
}
