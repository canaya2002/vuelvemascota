import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useApi } from "../api";
import { qk } from "../query";

export function useSilencias() {
  const api = useApi();
  return useQuery<string[]>({
    queryKey: qk.silencias(),
    queryFn: () => api.silencias.list(),
  });
}

export function useSilenciar() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (usuarioId: string) => api.silencias.add(usuarioId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.silencias() }),
  });
}

export function useDessilenciar() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (usuarioId: string) => api.silencias.remove(usuarioId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.silencias() }),
  });
}
