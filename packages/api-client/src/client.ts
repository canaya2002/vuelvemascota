/**
 * Cliente HTTP compartido web + Expo.
 *
 * Diseño:
 *  - Una sola instancia con baseUrl + getAuthToken configurable por app.
 *  - Cada método devuelve el `data` si ok, o lanza `ApiClientError` si err.
 *    Así los consumidores escriben try/catch corto y TanStack Query trata
 *    los errores como errores reales.
 *  - Soporta FormData para subida de fotos.
 *  - No depende de React: es plain TS → se puede usar en server actions,
 *    worker threads, scripts, tests.
 */

import type { ApiErr, ApiResult } from "@vuelvecasa/shared";

export type AuthTokenProvider = () =>
  | string
  | null
  | undefined
  | Promise<string | null | undefined>;

export type ClientConfig = {
  baseUrl: string;
  /** Retorna el token Bearer (web: cookie-based, Expo: Clerk session token). */
  getAuthToken?: AuthTokenProvider;
  /** Headers extra que siempre viajan (ej. X-Client-Platform). */
  defaultHeaders?: Record<string, string>;
  /** Timeout por request en ms. Default 15s. */
  timeoutMs?: number;
  /** Callback para errores globales (ej. 401 → logout). */
  onUnauthenticated?: () => void | Promise<void>;
};

export class ApiClientError extends Error {
  code: string;
  status: number;
  fields?: Record<string, string>;
  constructor(params: {
    code: string;
    message: string;
    status: number;
    fields?: Record<string, string>;
  }) {
    super(params.message);
    this.name = "ApiClientError";
    this.code = params.code;
    this.status = params.status;
    this.fields = params.fields;
  }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

export function createClient(config: ClientConfig) {
  const timeoutMs = config.timeoutMs ?? 15000;

  async function request<T>(
    path: string,
    opts: {
      method?: Method;
      body?: unknown;
      search?: Record<string, string | number | boolean | undefined | null>;
      formData?: FormData;
      cache?: RequestCache;
    } = {}
  ): Promise<T> {
    const method = opts.method ?? "GET";
    const url = new URL(
      `${config.baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
    );
    if (opts.search) {
      for (const [k, v] of Object.entries(opts.search)) {
        if (v == null || v === "") continue;
        url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = {
      ...(config.defaultHeaders ?? {}),
      Accept: "application/json",
    };
    if (config.getAuthToken) {
      const tok = await config.getAuthToken();
      if (tok) headers["Authorization"] = `Bearer ${tok}`;
    }

    let body: BodyInit | undefined;
    if (opts.formData) {
      body = opts.formData;
      // No poner Content-Type — el runtime lo añade con el boundary.
    } else if (opts.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method,
        headers,
        body,
        signal: ctrl.signal,
        cache: opts.cache ?? "no-store",
        credentials: "include",
      });
    } catch (err) {
      clearTimeout(timer);
      throw new ApiClientError({
        code: "network",
        message:
          err instanceof Error && err.name === "AbortError"
            ? "La conexión tardó demasiado. Intenta de nuevo."
            : "No hay conexión. Revisa tu internet e inténtalo otra vez.",
        status: 0,
      });
    }
    clearTimeout(timer);

    let json: ApiResult<T> | null = null;
    try {
      json = (await res.json()) as ApiResult<T>;
    } catch {
      /* ignore parse */
    }

    if (!res.ok || !json || "ok" in json ? !json?.ok : false) {
      const err = (json as ApiErr | null)?.error;
      if (res.status === 401 && config.onUnauthenticated) {
        try {
          await config.onUnauthenticated();
        } catch {
          /* noop */
        }
      }
      throw new ApiClientError({
        code: err?.code ?? `http_${res.status}`,
        message: err?.message ?? `Error ${res.status}`,
        status: res.status,
        fields: err?.fields,
      });
    }

    return (json as { ok: true; data: T }).data;
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createClient>;
