import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Alerta, AlertaInput } from "@vuelvecasa/shared";

import { useApi } from "../api";
import { qk } from "../query";

export function useAlertas() {
  const api = useApi();
  return useQuery<Alerta[]>({
    queryKey: qk.alertas(),
    queryFn: () => api.alertas.list(),
  });
}

export function useCreateAlerta() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AlertaInput) => api.alertas.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.alertas() }),
  });
}

export function useToggleAlerta() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activa }: { id: string; activa: boolean }) =>
      api.alertas.toggle(id, activa),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.alertas() }),
  });
}

export function useDeleteAlerta() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.alertas.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.alertas() }),
  });
}
