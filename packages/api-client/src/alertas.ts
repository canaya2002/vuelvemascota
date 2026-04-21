import type { Alerta, AlertaInput } from "@vuelvecasa/shared";
import type { ApiClient } from "./client";

export function makeAlertasApi(c: ApiClient) {
  return {
    list(): Promise<Alerta[]> {
      return c.request<Alerta[]>("/api/v1/alertas");
    },
    create(input: AlertaInput): Promise<{ created: boolean }> {
      return c.request("/api/v1/alertas", { method: "POST", body: input });
    },
    toggle(id: string, activa: boolean): Promise<{ id: string; activa: boolean }> {
      return c.request(`/api/v1/alertas/${id}/toggle`, {
        method: "PATCH",
        body: { activa },
      });
    },
    remove(id: string): Promise<{ deleted: boolean }> {
      return c.request(`/api/v1/alertas/${id}`, { method: "DELETE" });
    },
  };
}
