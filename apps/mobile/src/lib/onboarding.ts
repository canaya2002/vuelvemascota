/**
 * Flag local para marcar si el usuario ya terminó el onboarding.
 * Guardado en SecureStore (igual que el token de Clerk) para sobrevivir
 * reinstalaciones de app.
 */

import * as SecureStore from "expo-secure-store";

const KEY = "vc:onboarded:v1";

export async function hasOnboarded(): Promise<boolean> {
  try {
    const v = await SecureStore.getItemAsync(KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export async function markOnboarded(): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, "1");
  } catch {
    /* noop */
  }
}

export async function resetOnboarded(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    /* noop */
  }
}
