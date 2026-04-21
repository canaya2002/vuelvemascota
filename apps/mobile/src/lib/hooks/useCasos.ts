import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Caso,
  CasoDetailResponse,
  CasoEstado,
  CasoInput,
} from "@vuelvecasa/shared";
import type { ListCasosFilters } from "@vuelvecasa/api-client";

import { useApi } from "../api";
import { qk } from "../query";

export function useCasos(filters: ListCasosFilters = {}) {
  const api = useApi();
  return useQuery<Caso[]>({
    queryKey: qk.casos.list(filters as Record<string, unknown>),
    queryFn: () => api.casos.list(filters),
  });
}

export function useCaso(slug: string | undefined) {
  const api = useApi();
  return useQuery<CasoDetailResponse>({
    queryKey: qk.casos.detail(slug ?? ""),
    queryFn: () => api.casos.detail(slug as string),
    enabled: !!slug,
  });
}

export function useCreateCaso() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CasoInput) => api.casos.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.casos.all() });
    },
  });
}

export function useUploadFotos(slug: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: Array<{ uri: string; name: string; type: string }>) =>
      api.casos.uploadPhotos(slug, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.casos.detail(slug) });
      qc.invalidateQueries({ queryKey: qk.casos.all() });
    },
  });
}

export function useChangeEstado(slug: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (estado: CasoEstado) => api.casos.changeState(slug, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.casos.detail(slug) });
      qc.invalidateQueries({ queryKey: qk.casos.all() });
    },
  });
}
