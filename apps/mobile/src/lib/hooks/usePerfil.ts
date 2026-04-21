import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Perfil, PerfilInput, PerfilMe } from "@vuelvecasa/shared";

import { useApi } from "../api";
import { qk } from "../query";

export function useMe() {
  const api = useApi();
  return useQuery<PerfilMe>({
    queryKey: qk.me(),
    queryFn: () => api.me.get(),
  });
}

export function usePerfil() {
  const api = useApi();
  return useQuery<Perfil>({
    queryKey: qk.perfil(),
    queryFn: () => api.perfil.get(),
  });
}

export function useUpdatePerfil() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: PerfilInput) => api.perfil.update(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.perfil() });
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });
}

export function useDeleteMe() {
  const api = useApi();
  return useMutation({
    mutationFn: () => api.me.delete(),
  });
}
