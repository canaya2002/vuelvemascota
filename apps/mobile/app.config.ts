import type { ExpoConfig } from "expo/config";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Config de la app Expo. Las cosas sensibles (keys de Clerk, Mapbox) entran
 * vía env al momento del build — no se hardcodean.
 *
 * En dev, se leen de un `.env` en la raíz de apps/mobile (expo lo carga
 * automáticamente). En producción (EAS), los valores vienen de los secrets
 * configurados en el proyecto de Expo.
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://vuelvecasa.com";
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const MAPBOX_PUBLIC_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "";
const MAPBOX_DOWNLOAD_TOKEN = process.env.MAPBOX_DOWNLOAD_TOKEN ?? "";
const EAS_PROJECT_ID =
  process.env.EAS_PROJECT_ID ?? "817a12b4-ce4e-451b-8a03-f272e9149fc0";

/** Referencia una imagen del asset pipeline solo si existe en disco.
 *  Así la app puede buildearse aunque el usuario aún no haya corrido el
 *  generador de assets. */
function imgIfExists(relPath: string): string | undefined {
  return existsSync(resolve(__dirname, relPath)) ? relPath : undefined;
}
const iconPath = imgIfExists("./assets/images/icon.png");
const iconForegroundPath = imgIfExists("./assets/images/icon-foreground.png");
const splashPath = imgIfExists("./assets/images/splash.png");
const notificationIconPath = imgIfExists("./assets/images/notification-icon.png");
const faviconPath = imgIfExists("./assets/images/favicon.png");

const config: ExpoConfig = {
  name: "VuelveaCasa",
  slug: "vuelvecasa",
  version: "1.0.0",
  orientation: "portrait",
  ...(iconPath ? { icon: iconPath } : {}),
  scheme: "vuelvecasa",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ...(splashPath
    ? {
        splash: {
          image: splashPath,
          resizeMode: "contain",
          backgroundColor: "#fbf7f1",
        },
      }
    : {}),
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.vuelvecasa.app",
    supportsTablet: true,
    associatedDomains: ["applinks:vuelvecasa.com"],
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription:
        "VuelveaCasa usa tu cámara para tomar fotos de la mascota perdida o avistada y subirlas al reporte.",
      NSPhotoLibraryUsageDescription:
        "Elige fotos de tu galería para adjuntarlas al reporte de la mascota.",
      NSLocationWhenInUseUsageDescription:
        "VuelveaCasa usa tu ubicación para mostrar casos cercanos y marcar dónde se perdió o avistó la mascota.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "VuelveaCasa usa tu ubicación para enviarte alertas cuando una mascota se reporte perdida cerca de ti.",
      NSUserTrackingUsageDescription:
        "Usamos tu actividad solo para mejorar la app y los reportes. Nunca la compartimos con terceros.",
    },
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.vuelvecasa.app",
    ...(iconForegroundPath
      ? {
          adaptiveIcon: {
            foregroundImage: iconForegroundPath,
            backgroundColor: "#fbf7f1",
          },
        }
      : {}),
    permissions: [
      "CAMERA",
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "NOTIFICATIONS",
    ],
    intentFilters: [
      {
        action: "VIEW",
        data: [{ scheme: "https", host: "vuelvecasa.com" }],
        category: ["BROWSABLE", "DEFAULT"],
        autoVerify: true,
      },
    ],
  },
  web: {
    bundler: "metro",
    ...(faviconPath ? { favicon: faviconPath } : {}),
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
    ...(splashPath
      ? ([
          [
            "expo-splash-screen",
            {
              image: splashPath,
              backgroundColor: "#fbf7f1",
              imageWidth: 200,
            },
          ],
        ] as [string, Record<string, unknown>][])
      : []),
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "VuelveaCasa necesita tu ubicación para alertarte de mascotas perdidas cerca de ti.",
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission:
          "VuelveaCasa usa tu cámara para tomar fotos de la mascota al reportarla.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "VuelveaCasa necesita acceso a tus fotos para adjuntarlas al reporte.",
      },
    ],
    [
      "expo-notifications",
      {
        ...(notificationIconPath ? { icon: notificationIconPath } : {}),
        color: "#e11d48",
      },
    ],
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsDownloadToken: MAPBOX_DOWNLOAD_TOKEN,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: API_URL,
    clerkPublishableKey: CLERK_PUBLISHABLE_KEY,
    mapboxToken: MAPBOX_PUBLIC_TOKEN,
    eas: {
      projectId: EAS_PROJECT_ID,
    },
  },
  // owner: se infiere de la cuenta logueada. Si luego creas una org en
  // Expo llamada p.ej. "vuelvecasa", la añades aquí y reconfigureas EAS.
};

export default config;
