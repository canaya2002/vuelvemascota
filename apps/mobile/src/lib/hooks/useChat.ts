import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatCanal, ChatMensaje } from "@vuelvecasa/shared";

import { useApi } from "../api";
import { qk } from "../query";

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
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.chat(canal) }),
  });
}
