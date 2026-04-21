import type {
  Caso,
  CasoDetailResponse,
  CasoInput,
  CasoEstado,
} from "@vuelvecasa/shared";
import type { ApiClient } from "./client";

export type ListCasosFilters = {
  tipo?: "perdida" | "encontrada" | "avistamiento";
  especie?: "perro" | "gato" | "otro";
  estado?: string;
  ciudad?: string;
  municipio?: string;
  q?: string;
  lat?: number;
  lng?: number;
  radio_km?: number;
  limit?: number;
  offset?: number;
};

export function makeCasosApi(c: ApiClient) {
  return {
    list(filters: ListCasosFilters = {}): Promise<Caso[]> {
      return c.request<Caso[]>("/api/v1/casos", {
        method: "GET",
        search: filters,
      });
    },
    detail(slug: string): Promise<CasoDetailResponse> {
      return c.request<CasoDetailResponse>(`/api/v1/casos/${slug}`);
    },
    create(input: CasoInput): Promise<{ id: string; slug: string; url: string }> {
      return c.request("/api/v1/casos", {
        method: "POST",
        body: input,
      });
    },
    update(slug: string, patch: Partial<CasoInput>): Promise<{ updated: boolean }> {
      return c.request(`/api/v1/casos/${slug}`, {
        method: "PATCH",
        body: patch,
      });
    },
    changeState(slug: string, estado: CasoEstado): Promise<{ estado: CasoEstado }> {
      return c.request(`/api/v1/casos/${slug}/estado`, {
        method: "PATCH",
        body: { estado },
      });
    },
    uploadPhotos(
      slug: string,
      files: Array<{ uri: string; name: string; type: string } | Blob>
    ): Promise<{ added: number; rejected: number; rejections: string[] }> {
      const fd = new FormData();
      for (const f of files) {
        // RN: el objeto { uri, name, type } es el formato que FormData espera.
        // Web: pasamos Blob.
        fd.append("fotos", f as unknown as Blob);
      }
      return c.request(`/api/v1/casos/${slug}/fotos`, {
        method: "POST",
        formData: fd,
      });
    },
  };
}
