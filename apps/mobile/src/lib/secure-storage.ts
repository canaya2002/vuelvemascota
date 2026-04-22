/**
 * Token cache para Clerk Expo. Guarda el JWT de sesión en Keychain (iOS)
 * / Keystore (Android) vía expo-secure-store. Clerk llama a este objeto
 * automáticamente cuando configuramos `tokenCache` en el ClerkProvider.
 */

import * as SecureStore from "expo-secure-store";
import type { TokenCache } from "@clerk/clerk-expo";

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      /* noop */
    }
  },
};
