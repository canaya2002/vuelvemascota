import type { ApiClient } from "./client";

export type AvistamientoInput = {
  caso_slug: string;
  descripcion: string;
  fecha_avistado?: string;
  lat?: number | null;
  lng?: number | null;
  autor_nombre?: string | null;
  autor_contacto?: string | null;
};

export function makeAvistamientosApi(c: ApiClient) {
  return {
    create(input: AvistamientoInput): Promise<{ created: boolean }> {
      return c.request("/api/v1/avistamientos", {
        method: "POST",
        body: input,
      });
    },
  };
}
