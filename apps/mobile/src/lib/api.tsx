/**
 * Cliente API móvil.
 *
 * Diseño:
 *  - Usamos el api-client compartido (mismos tipos que web).
 *  - `useApi()` inyecta el getToken de Clerk en cada request — siempre JWT
 *    fresco (Clerk lo rota solo).
 *  - `ApiProvider` mantiene UNA SOLA instancia de Api para todo el árbol,
 *    independiente de re-renders. La forma estable es vía useRef:
 *    `getToken` y `isSignedIn` cambian de referencia en cada render del
 *    ClerkProvider; si los pones como deps de useMemo, recreás Api en cada
 *    render → rompe el cache de React Query y, peor, durante el primer
 *    render `isSignedIn` puede ser `undefined` (Clerk aún cargando) y el
 *    cliente captura esa closure para siempre — los requests posteriores
 *    no incluyen el Bearer token aunque el usuario sí esté logueado.
 *  - Un singleton "público" (sin auth) queda disponible para prefetch en
 *    pantallas que no requieren sesión.
 */

import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { createApi, type Api } from "@vuelvecasa/api-client";
import { Platform } from "react-native";

import { API_URL } from "./constants";

const publicHeaders = {
  "X-Client-Platform": Platform.OS,
  "X-Client-App": "vuelvecasa-mobile",
};

export const publicApi: Api = createApi({
  baseUrl: API_URL,
  defaultHeaders: publicHeaders,
});

const ApiCtx = createContext<Api | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  // Ref que apunta al `useAuth()` más reciente. Se actualiza en cada render
  // sin recrear la instancia de Api. La closure de getAuthToken siempre lee
  // el valor "live" — no captura un snapshot del primer render.
  const authRef = useRef(auth);
  authRef.current = auth;

  const api = useMemo(
    () =>
      createApi({
        baseUrl: API_URL,
        defaultHeaders: publicHeaders,
        getAuthToken: async () => {
          // Espera hasta 1.5s a que Clerk Expo cargue (bursts de 100ms).
          // Antes devolvíamos null inmediato y las primeras requests salían
          // sin token aunque el usuario estuviera logueado (bug
          // "no-bearer-token"): la closure capturaba isSignedIn=undefined
          // del primer render y nunca se renovaba.
          let tries = 0;
          while (!authRef.current.isLoaded && tries < 15) {
            await new Promise((r) => setTimeout(r, 100));
            tries++;
          }
          const { isLoaded, isSignedIn, getToken } = authRef.current;
          if (!isLoaded || !isSignedIn) return null;
          try {
            return (await getToken()) ?? null;
          } catch {
            return null;
          }
        },
      }),
    [] // no deps — UNA instancia para toda la sesión
  );

  return <ApiCtx.Provider value={api}>{children}</ApiCtx.Provider>;
}

export function useApi(): Api {
  const api = useContext(ApiCtx);
  if (!api) {
    throw new Error("useApi must be used inside <ApiProvider>");
  }
  return api;
}
