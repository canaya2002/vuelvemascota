/**
 * Helpers de ubicación usando expo-location. Expone un `getCurrentPosition`
 * que pide permisos amigablemente y retorna `null` si el usuario los niega
 * (la app sigue funcionando con selects manuales de ciudad).
 */

import * as Location from "expo-location";

export type Coords = { lat: number; lng: number };

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentPosition(): Promise<Coords | null> {
  try {
    const granted = await requestLocationPermission();
    if (!granted) return null;
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ city?: string; state?: string; street?: string } | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });
    const first = results[0];
    if (!first) return null;
    return {
      city: first.city ?? first.subregion ?? undefined,
      state: first.region ?? undefined,
      street: first.street ?? undefined,
    };
  } catch {
    return null;
  }
}
