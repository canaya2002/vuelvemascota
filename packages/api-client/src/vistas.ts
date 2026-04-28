import type { Vista, VistaInput } from "@vuelvecasa/shared";
import type { ApiClient } from "./client";

export function makeVistasApi(c: ApiClient) {
  return {
    list(): Promise<Vista[]> {
      return c.request<Vista[]>("/api/v1/vistas");
    },
    get(id: string): Promise<Vista> {
      return c.request<Vista>(`/api/v1/vistas/${id}`);
    },
    create(input: VistaInput): Promise<Vista> {
      return c.request<Vista>("/api/v1/vistas", {
        method: "POST",
        body: input,
      });
    },
    update(id: string, input: Partial<VistaInput>): Promise<Vista> {
      return c.request<Vista>(`/api/v1/vistas/${id}`, {
        method: "PATCH",
        body: input,
      });
    },
    remove(id: string): Promise<{ deleted: boolean }> {
      return c.request(`/api/v1/vistas/${id}`, { method: "DELETE" });
    },
    subscribe(id: string): Promise<{ suscrito: boolean }> {
      return c.request(`/api/v1/vistas/${id}/suscribirme`, { method: "POST" });
    },
    unsubscribe(id: string): Promise<{ suscrito: boolean }> {
      return c.request(`/api/v1/vistas/${id}/suscribirme`, { method: "DELETE" });
    },
  };
}
