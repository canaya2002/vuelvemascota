import type { PerfilMe } from "@vuelvecasa/shared";
import type { ApiClient } from "./client";

export function makeMeApi(c: ApiClient) {
  return {
    get(): Promise<PerfilMe> {
      return c.request<PerfilMe>("/api/v1/me");
    },
    delete(): Promise<{ deleted: boolean }> {
      return c.request("/api/v1/me", { method: "DELETE" });
    },
  };
}
