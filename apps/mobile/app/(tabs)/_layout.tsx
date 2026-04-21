/**
 * Tabs shell. 5 tabs alineados con los pilares de la web:
 *   1. Inicio (home/descubrir)
 *   2. Casos (feed de perdidos/encontrados)
 *   3. Reportar (FAB-like, acción principal)
 *   4. Alertas (gestión de alertas por zona)
 *   5. Perfil (sesión + ajustes)
 *
 * Gate: si no hay sesión → redirige a (auth)/sign-in. El flujo "leer casos
 * sin login" se activará con una variante de este layout en Fase 3 — por
 * ahora todas las tabs requieren usuario autenticado (premium-first).
 */

import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { BlurView } from "expo-blur";

import { colors } from "@/lib/theme";
import { AuthedBootstrap } from "@/lib/AuthedBootstrap";

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
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor:
            Platform.OS === "ios" ? "transparent" : colors.surface,
          height: Platform.OS === "ios" ? 82 : 64,
          paddingTop: 6,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              tint="light"
              intensity={80}
              style={{
                flex: 1,
                borderTopWidth: 1,
                borderTopColor: colors.line,
              }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.line,
              }}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="casos"
        options={{
          title: "Casos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportar"
        options={{
          title: "Reportar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={(size ?? 22) + 6} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
