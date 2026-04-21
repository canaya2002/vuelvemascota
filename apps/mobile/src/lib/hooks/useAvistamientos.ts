import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AvistamientoInput } from "@vuelvecasa/api-client";

import { useApi } from "../api";
import { qk } from "../query";

export function useCrearAvistamiento() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AvistamientoInput) => api.avistamientos.create(input),
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: qk.casos.detail(input.caso_slug) });
    },
  });
}
