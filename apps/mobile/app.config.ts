import type { ExpoConfig } from "expo/config";

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

const config: ExpoConfig = {
  name: "VuelveaCasa",
  slug: "vuelvecasa",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "vuelvecasa",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#fbf7f1",
  },
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
    adaptiveIcon: {
      foregroundImage: "./assets/images/icon-foreground.png",
      backgroundColor: "#fbf7f1",
    },
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
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash.png",
        backgroundColor: "#fbf7f1",
        imageWidth: 200,
      },
    ],
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
        icon: "./assets/images/notification-icon.png",
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
      projectId: process.env.EAS_PROJECT_ID ?? "",
    },
  },
  owner: "vuelvecasa",
};

export default config;
