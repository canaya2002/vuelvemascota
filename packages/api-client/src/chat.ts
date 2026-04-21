import type { ChatCanal, ChatMensaje } from "@vuelvecasa/shared";
import type { ApiClient } from "./client";

export function makeChatApi(c: ApiClient) {
  return {
    list(canal: ChatCanal, params?: { limit?: number; before?: string }): Promise<ChatMensaje[]> {
      return c.request<ChatMensaje[]>(`/api/v1/chat/${canal}`, { search: params });
    },
    send(canal: ChatCanal, cuerpo: string): Promise<{ posted: boolean }> {
      return c.request(`/api/v1/chat/${canal}`, {
        method: "POST",
        body: { cuerpo },
      });
    },
  };
}
