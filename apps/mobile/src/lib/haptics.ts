/**
 * Haptics helpers. En iOS es la experiencia premium que marca la diferencia
 * entre una app "bien hecha" y una app "común". En Android se degrada
 * elegantemente a una vibración corta estándar.
 */

import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export const tap = () => {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync().catch(() => {});
};

export const success = () => {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {}
  );
};

export const warn = () => {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
    () => {}
  );
};

export const error = () => {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
    () => {}
  );
};

export const light = () => {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export const medium = () => {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

export const heavy = () => {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
};
