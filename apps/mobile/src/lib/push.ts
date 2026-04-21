/**
 * Push notifications setup.
 *
 * Flujo:
 *  1. Al arrancar una sesión autenticada, pedimos permiso de notificaciones.
 *  2. Si el usuario acepta, obtenemos el Expo push token.
 *  3. Lo mandamos a /api/v1/push/register-token — el backend lo guarda y
 *     lo usa en el loop de alertas.
 *  4. Setup de handlers para: notificación recibida en foreground,
 *     notificación tocada (navigate al caso relacionado).
 */

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Application from "expo-application";
import type { Api } from "@vuelvecasa/api-client";
import type { PushPlatform } from "@vuelvecasa/shared";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Alertas",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#e11d48",
  });
}

export async function requestNotificationsPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;
  try {
    await ensureAndroidChannel();
    const granted = await requestNotificationsPermission();
    if (!granted) return null;
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data ?? null;
  } catch {
    return null;
  }
}

function platformKey(): PushPlatform {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

export async function registerPushWithBackend(api: Api): Promise<string | null> {
  const token = await getExpoPushToken();
  if (!token) return null;
  try {
    await api.push.registerToken({
      token,
      platform: platformKey(),
      device_name: Device.deviceName ?? Application.applicationName ?? null,
    });
    return token;
  } catch {
    return null;
  }
}

export async function unregisterPushWithBackend(
  api: Api,
  token: string
): Promise<void> {
  try {
    await api.push.unregisterToken(token);
  } catch {
    /* noop */
  }
}
