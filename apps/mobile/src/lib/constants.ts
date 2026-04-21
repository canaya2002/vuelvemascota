/**
 * Constantes de runtime. Leemos desde `Constants.expoConfig.extra` que es
 * donde `app.config.ts` inyecta los valores de env en tiempo de build.
 */

import Constants from "expo-constants";

type Extra = {
  apiUrl?: string;
  clerkPublishableKey?: string;
  mapboxToken?: string;
};

const extra: Extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const API_URL: string = extra.apiUrl || "https://vuelvecasa.com";
export const CLERK_PUBLISHABLE_KEY: string = extra.clerkPublishableKey || "";
export const MAPBOX_PUBLIC_TOKEN: string = extra.mapboxToken || "";

export const IS_DEV = __DEV__;
