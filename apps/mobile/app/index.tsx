/**
 * Redirector inicial. Tres estados:
 *   - Sin sesión → /(auth)/sign-in
 *   - Con sesión y NO onboarded → /(onboarding)/welcome
 *   - Con sesión y onboarded → /(tabs)
 */

import { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { hasOnboarded } from "@/lib/onboarding";
import { colors } from "@/lib/theme";

type Ready = "auth" | "onboarding" | "tabs" | null;

export default function Index() {
  const { isSignedIn } = useAuth();
  const [ready, setReady] = useState<Ready>(null);

  useEffect(() => {
    (async () => {
      if (!isSignedIn) {
        setReady("auth");
        return;
      }
      const done = await hasOnboarded();
      setReady(done ? "tabs" : "onboarding");
    })();
  }, [isSignedIn]);

  if (ready === null) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }
  if (ready === "auth") return <Redirect href="/(auth)/sign-in" />;
  if (ready === "onboarding") return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(tabs)" />;
}
