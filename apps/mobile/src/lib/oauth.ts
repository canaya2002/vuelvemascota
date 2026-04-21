/**
 * OAuth helper — usa `useOAuth` de Clerk Expo para abrir el flujo web-based.
 *
 * Importante para iOS: `WebBrowser.maybeCompleteAuthSession()` debe correr
 * al arranque del módulo (lo hacemos al importar este archivo) para que la
 * app reanude la sesión después de regresar del navegador.
 */

import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useCallback } from "react";

WebBrowser.maybeCompleteAuthSession();

type Strategy = "oauth_apple" | "oauth_google";

export function useOAuthFlow(strategy: Strategy) {
  const { startOAuthFlow } = useOAuth({ strategy });
  return useCallback(async () => {
    const redirectUrl = Linking.createURL("/(tabs)");
    const result = await startOAuthFlow({ redirectUrl });
    if (result.createdSessionId && result.setActive) {
      await result.setActive({ session: result.createdSessionId });
      return true;
    }
    return false;
  }, [startOAuthFlow]);
}
