import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ForoCategoria,
  ForoHilo,
  ForoHiloDetail,
  ForoHiloInput,
} from "@vuelvecasa/shared";

import { useApi } from "../api";
import { qk } from "../query";

export function useForos(cat?: ForoCategoria) {
  const api = useApi();
  return useQuery({
    queryKey: qk.foros.list(cat),
    queryFn: () => api.foros.list({ cat, limit: 50 }),
  });
}

export function useHilo(id: string | undefined) {
  const api = useApi();
  return useQuery<ForoHiloDetail>({
    queryKey: qk.foros.detail(id ?? ""),
    queryFn: () => api.foros.detail(id as string),
    enabled: !!id,
  });
}

export function useCrearHilo() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ForoHiloInput) => api.foros.createHilo(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.foros.all() }),
  });
}

export function useResponderHilo(hiloId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cuerpo: string) => api.foros.reply(hiloId, cuerpo),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.foros.detail(hiloId) }),
  });
}

export type { ForoHilo };
