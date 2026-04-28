import type { ApiClient } from "./client";

export function makeSilenciasApi(c: ApiClient) {
  return {
    list(): Promise<string[]> {
      return c.request<string[]>("/api/v1/silencias");
    },
    add(usuarioId: string): Promise<{ silenciado: boolean }> {
      return c.request(`/api/v1/silencias`, {
        method: "POST",
        body: { usuario_id: usuarioId },
      });
    },
    remove(usuarioId: string): Promise<{ silenciado: boolean }> {
      return c.request(`/api/v1/silencias?usuario_id=${encodeURIComponent(usuarioId)}`, {
        method: "DELETE",
      });
    },
  };
}
