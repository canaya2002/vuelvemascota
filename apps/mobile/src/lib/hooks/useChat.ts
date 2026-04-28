import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatCanal, ChatMensaje } from "@vuelvecasa/shared";

import { useApi } from "../api";
import { qk } from "../query";

/** Canal global "comunidad" (gateado por reputación). */
export function useChat(canal: ChatCanal) {
  const api = useApi();
  return useQuery<ChatMensaje[]>({
    queryKey: qk.chat(canal),
    queryFn: () => api.chat.list(canal, { limit: 100 }),
    refetchInterval: 6_000,
  });
}

export function useEnviarMensaje(canal: ChatCanal) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cuerpo: string) => api.chat.send(canal, cuerpo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.chat(canal) });
    },
  });
}

/** Hilo del caso. */
export function useChatCaso(slug: string | null | undefined) {
  const api = useApi();
  return useQuery<ChatMensaje[]>({
    queryKey: qk.chatCaso(slug ?? ""),
    queryFn: () => api.chat.listCaso(slug!, { limit: 100 }),
    refetchInterval: 6_000,
    enabled: !!slug,
  });
}

export function useEnviarCaso(slug: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cuerpo: string) => api.chat.sendCaso(slug, cuerpo),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.chatCaso(slug) }),
  });
}

/**
 * Reportar mensaje. Idempotente.
 *
 * Recibe el `scope` opcional para invalidar SOLO el queryKey afectado en vez
 * de tirar todo el árbol de chat (era un re-fetch innecesario y agresivo).
 */
export function useReportarMensaje(scope?: { canal?: ChatCanal; casoSlug?: string }) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      api.chat.report(id, motivo),
    onSuccess: () => {
      if (scope?.casoSlug) {
        qc.invalidateQueries({ queryKey: qk.chatCaso(scope.casoSlug) });
      } else if (scope?.canal) {
        qc.invalidateQueries({ queryKey: qk.chat(scope.canal) });
      } else {
        qc.invalidateQueries({ queryKey: [...qk.all, "chat"] });
        qc.invalidateQueries({ queryKey: [...qk.all, "chatCaso"] });
      }
    },
  });
}
