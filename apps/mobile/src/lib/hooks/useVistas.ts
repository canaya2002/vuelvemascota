import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Vista, VistaInput } from "@vuelvecasa/shared";

import { useApi } from "../api";
import { qk } from "../query";

export function useVistas() {
  const api = useApi();
  return useQuery<Vista[]>({
    queryKey: qk.vistas.all(),
    queryFn: () => api.vistas.list(),
  });
}

export function useVista(id: string | null | undefined) {
  const api = useApi();
  return useQuery<Vista>({
    queryKey: qk.vistas.detail(id ?? ""),
    queryFn: () => api.vistas.get(id!),
    enabled: !!id,
  });
}

export function useCreateVista() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VistaInput) => api.vistas.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.vistas.all() }),
  });
}

export function useUpdateVista(id: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<VistaInput>) => api.vistas.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.vistas.all() });
      qc.invalidateQueries({ queryKey: qk.vistas.detail(id) });
    },
  });
}

export function useDeleteVista() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.vistas.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.vistas.all() }),
  });
}
