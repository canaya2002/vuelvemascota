import type {
  ForoCategoria,
  ForoHilo,
  ForoHiloDetail,
  ForoHiloInput,
} from "@vuelvecasa/shared";
import type { ApiClient } from "./client";

export function makeForosApi(c: ApiClient) {
  return {
    list(params?: { cat?: ForoCategoria; limit?: number }): Promise<{
      categorias: readonly { slug: ForoCategoria; titulo: string; desc: string }[];
      hilos: ForoHilo[];
    }> {
      return c.request("/api/v1/foros", { search: params });
    },
    detail(id: string): Promise<ForoHiloDetail> {
      return c.request<ForoHiloDetail>(`/api/v1/foros/${id}`);
    },
    createHilo(input: ForoHiloInput): Promise<{ id: string; url: string }> {
      return c.request("/api/v1/foros/hilos", { method: "POST", body: input });
    },
    reply(hiloId: string, cuerpo: string): Promise<{ posted: boolean }> {
      return c.request(`/api/v1/foros/hilos/${hiloId}/respuestas`, {
        method: "POST",
        body: { cuerpo },
      });
    },
  };
}
