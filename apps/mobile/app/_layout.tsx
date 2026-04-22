/**
 * Root layout. Ejecuta en frío al abrir la app:
 *  1. Mantenemos splash visible hasta que fuentes + sesión de Clerk estén listas.
 *  2. Inicializamos Clerk con tokenCache en SecureStore.
 *  3. Montamos QueryClient global.
 *  4. Montamos ApiProvider para que useApi() tenga una instancia con JWT fresco.
 *  5. Gesture handler root para que Reanimated + gestos funcionen.
 *
 * El primer renderizado muestra splash; cuando todo está listo, se oculta
 * con un fade suave controlado por expo-splash-screen.
 */

import "react-native-gesture-handler";
import "../global.css";

import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { QueryClientProvider } from "@tanstack/react-query";
import * as SystemUI from "expo-system-ui";

import { ApiProvider } from "@/lib/api";
import { createQueryClient } from "@/lib/query";
import { tokenCache } from "@/lib/secure-storage";
import { CLERK_PUBLISHABLE_KEY } from "@/lib/constants";
import { colors } from "@/lib/theme";
import { ToastProvider } from "@/components/ui";

// En web, NativeWind/Reanimated necesita saber que el dark mode va por
// clase CSS — si no, crashea con "Cannot manually set color scheme".
if (Platform.OS === "web") {
  (StyleSheet as unknown as { setFlag?: (flag: string, value: string) => void })
    .setFlag?.("darkMode", "class");
}

SplashScreen.preventAutoHideAsync().catch(() => {});
// setOptions solo existe en expo-splash-screen ≥ 0.30; si la versión
// instalada no lo tiene (o estamos en web), lo ignoramos silenciosamente.
const splashApi = SplashScreen as typeof SplashScreen & {
  setOptions?: (o: { fade?: boolean; duration?: number }) => void;
};
splashApi.setOptions?.({ fade: true, duration: 300 });

const queryClient = createQueryClient();

export default function RootLayout() {
  // NOTA: Cuando tengas las 5 TTFs en assets/fonts/, descomenta el bloque
  // de abajo (y re-añade `useFonts` al import de expo-font) para habilitar
  // la tipografía premium. Mientras, usamos system fonts.
  //
  // const [fontsLoaded, fontsError] = useFonts({
  //   PlusJakartaSans: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
  //   "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
  //   "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
  //   Fraunces: require("../assets/fonts/Fraunces-Regular.ttf"),
  //   "Fraunces-Bold": require("../assets/fonts/Fraunces-Bold.ttf"),
  // });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
  }, []);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      />
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <QueryClientProvider client={queryClient}>
          <ApiProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <ToastProvider>
                  <Slot />
                </ToastProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </ApiProvider>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
