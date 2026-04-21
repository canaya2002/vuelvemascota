/**
 * Layout del grupo (auth). Si ya hay sesión, el usuario no debería ver las
 * pantallas de sign-in → redirige a tabs.
 */

import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AuthLayout() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#fbf7f1" },
      }}
    />
  );
}
