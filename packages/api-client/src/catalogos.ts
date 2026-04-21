import type { ApiClient } from "./client";

export type CityEntry = {
  slug: string;
  name: string;
  short: string;
  state: string;
};

export function makeCatalogosApi(c: ApiClient) {
  return {
    cities(): Promise<CityEntry[]> {
      return c.request<CityEntry[]>("/api/v1/cities");
    },
    estados(): Promise<string[]> {
      return c.request<string[]>("/api/v1/estados");
    },
  };
}
