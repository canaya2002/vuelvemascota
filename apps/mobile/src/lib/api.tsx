/**
 * Cliente API móvil.
 *
 * Diseño:
 *  - Usamos el api-client compartido (mismos tipos que web).
 *  - `useApi()` inyecta el getToken de la sesión de Clerk cada request, así
 *    el helper siempre manda un JWT fresco (Clerk lo rota solo).
 *  - `ApiProvider` expone la instancia vía contexto para evitar recrearla
 *    en cada render.
 *  - Un singleton "público" (sin auth) queda disponible para prefetch en
 *    pantallas que no requieren sesión (casos públicos, catálogos).
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
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
  const { getToken, isSignedIn } = useAuth();

  const api = useMemo(
    () =>
      createApi({
        baseUrl: API_URL,
        defaultHeaders: publicHeaders,
        getAuthToken: async () => {
          if (!isSignedIn) return null;
          try {
            return (await getToken()) ?? null;
          } catch {
            return null;
          }
        },
      }),
    [getToken, isSignedIn]
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
