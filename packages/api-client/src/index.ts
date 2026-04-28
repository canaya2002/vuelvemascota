/**
 * Entry point de @vuelvecasa/api-client.
 *
 * Uso típico (web):
 *   const api = createApi({ baseUrl: "" });
 *   const casos = await api.casos.list();
 *
 * Uso típico (Expo):
 *   const api = createApi({
 *     baseUrl: "https://vuelvecasa.com",
 *     getAuthToken: () => clerkSession?.getToken() ?? null,
 *     defaultHeaders: { "X-Client-Platform": "ios" },
 *   });
 */

import { createClient, type ClientConfig, type ApiClient } from "./client";
import { makeCasosApi, type ListCasosFilters } from "./casos";
import { makeAlertasApi } from "./alertas";
import { makeForosApi } from "./foros";
import { makeChatApi } from "./chat";
import { makePerfilApi } from "./perfil";
import { makeMeApi } from "./me";
import { makePushApi } from "./push";
import { makeAvistamientosApi, type AvistamientoInput } from "./avistamientos";
import { makeCatalogosApi, type CityEntry } from "./catalogos";
import { makeVistasApi } from "./vistas";
import { makeSilenciasApi } from "./silencias";

export type { ClientConfig, ApiClient, ListCasosFilters, AvistamientoInput, CityEntry };
export { ApiClientError, createClient } from "./client";

export function createApi(config: ClientConfig) {
  const client = createClient(config);
  return {
    client,
    casos: makeCasosApi(client),
    alertas: makeAlertasApi(client),
    foros: makeForosApi(client),
    chat: makeChatApi(client),
    perfil: makePerfilApi(client),
    me: makeMeApi(client),
    push: makePushApi(client),
    avistamientos: makeAvistamientosApi(client),
    catalogos: makeCatalogosApi(client),
    vistas: makeVistasApi(client),
    silencias: makeSilenciasApi(client),
  };
}

export type Api = ReturnType<typeof createApi>;
