import { useQuery } from "@tanstack/react-query";
import type { CityEntry } from "@vuelvecasa/api-client";

import { useApi } from "../api";
import { qk } from "../query";

export function useCities() {
  const api = useApi();
  return useQuery<CityEntry[]>({
    queryKey: qk.catalogos.cities(),
    queryFn: () => api.catalogos.cities(),
    staleTime: 24 * 60 * 60_000,
  });
}

export function useEstados() {
  const api = useApi();
  return useQuery<string[]>({
    queryKey: qk.catalogos.estados(),
    queryFn: () => api.catalogos.estados(),
    staleTime: 24 * 60 * 60_000,
  });
}
