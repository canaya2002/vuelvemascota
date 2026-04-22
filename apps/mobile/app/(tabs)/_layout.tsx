/**
 * Tabs shell. 5 tabs alineados con los pilares de la web:
 *   1. Inicio (home/descubrir)
 *   2. Casos (feed de perdidos/encontrados)
 *   3. Reportar (FAB-like, acción principal)
 *   4. Alertas (gestión de alertas por zona)
 *   5. Perfil (sesión + ajustes)
 *
 * Gate: si no hay sesión → redirige a (auth)/sign-in.
 * Look & feel: tab bar flotante glassmorphic (ver FloatingTabBar).
 */

import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { AuthedBootstrap } from "@/lib/AuthedBootstrap";
import { FloatingTabBar } from "@/components/ui";

export default function TabsLayout() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <AuthedBootstrap>
      <TabsInner />
    </AuthedBootstrap>
  );
}

function TabsInner() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
      tabBar={(props: BottomTabBarProps) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="casos" options={{ title: "Casos" }} />
      <Tabs.Screen name="reportar" options={{ title: "Reportar" }} />
      <Tabs.Screen name="alertas" options={{ title: "Alertas" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
