/**
 * QueryClient compartido. Config optimizada para móvil:
 *  - staleTime 30s → evita refetches agresivos en navegaciones rápidas.
 *  - gcTime 10min → cache razonable para volver atrás sin spinner.
 *  - retry: solo 1 vez y nunca en 401/403/404 (no tiene sentido).
 *  - refetchOnReconnect → TanStack Query detecta reconexiones y revalida.
 */

import { QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "@vuelvecasa/api-client";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 10 * 60_000,
        retry: (failureCount, error) => {
          if (error instanceof ApiClientError) {
            if ([401, 403, 404].includes(error.status)) return false;
          }
          return failureCount < 1;
        },
        refetchOnReconnect: "always",
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/** Keys centrales — usamos el patrón factory para evitar strings mágicos. */
export const qk = {
  all: ["vuelvecasa"] as const,
  me: () => [...qk.all, "me"] as const,
  perfil: () => [...qk.all, "perfil"] as const,
  casos: {
    all: () => [...qk.all, "casos"] as const,
    list: (filters: Record<string, unknown>) =>
      [...qk.casos.all(), "list", filters] as const,
    detail: (slug: string) => [...qk.casos.all(), "detail", slug] as const,
  },
  alertas: () => [...qk.all, "alertas"] as const,
  foros: {
    all: () => [...qk.all, "foros"] as const,
    list: (cat?: string) => [...qk.foros.all(), "list", cat ?? "todas"] as const,
    detail: (id: string) => [...qk.foros.all(), "detail", id] as const,
  },
  chat: (canal: string) => [...qk.all, "chat", canal] as const,
  catalogos: {
    cities: () => [...qk.all, "catalogos", "cities"] as const,
    estados: () => [...qk.all, "catalogos", "estados"] as const,
  },
} as const;
