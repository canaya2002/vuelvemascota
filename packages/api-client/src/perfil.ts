import type { Perfil, PerfilInput } from "@vuelvecasa/shared";
import type { ApiClient } from "./client";

export function makePerfilApi(c: ApiClient) {
  return {
    get(): Promise<Perfil> {
      return c.request<Perfil>("/api/v1/perfil");
    },
    update(patch: PerfilInput): Promise<Perfil> {
      return c.request<Perfil>("/api/v1/perfil", {
        method: "PATCH",
        body: patch,
      });
    },
  };
}
