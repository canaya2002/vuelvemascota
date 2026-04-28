import type { ChatCanal, ChatMensaje } from "@vuelvecasa/shared";
import type { ApiClient } from "./client";

export function makeChatApi(c: ApiClient) {
  return {
    /** Lista mensajes del canal global "comunidad". */
    list(canal: ChatCanal, params?: { limit?: number; before?: string }): Promise<ChatMensaje[]> {
      return c.request<ChatMensaje[]>(`/api/v1/chat/${canal}`, { search: params });
    },
    /** Postea al canal global. Sujeto a reputación. */
    send(canal: ChatCanal, cuerpo: string): Promise<{ posted: boolean; shadowed?: boolean }> {
      return c.request(`/api/v1/chat/${canal}`, {
        method: "POST",
        body: { cuerpo },
      });
    },
    /** Hilo de chat de un caso. */
    listCaso(slug: string, params?: { limit?: number; before?: string }): Promise<ChatMensaje[]> {
      return c.request<ChatMensaje[]>(`/api/v1/casos/${slug}/chat`, {
        search: params,
      });
    },
    /** Postea al hilo de un caso. */
    sendCaso(
      slug: string,
      cuerpo: string
    ): Promise<{ posted: boolean; id?: string; shadowed?: boolean }> {
      return c.request(`/api/v1/casos/${slug}/chat`, {
        method: "POST",
        body: { cuerpo },
      });
    },
    /** Reporta un mensaje. 3 reportes únicos → mensaje oculto + autor con shadow_until. */
    report(
      mensajeId: string,
      motivo?: string
    ): Promise<{ reported: boolean; silenced: boolean; total: number }> {
      return c.request(`/api/v1/chat/${mensajeId}/report`, {
        method: "POST",
        body: motivo ? { motivo } : {},
      });
    },
  };
}
