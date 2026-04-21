/**
 * Helpers para route handlers bajo /api/v1/*.
 *
 * Objetivos:
 *  - Respuestas JSON consistentes (ok/error, CORS, cache-control).
 *  - Autenticación con Clerk en server routes sin duplicar código.
 *  - Gate de FLAGS.auth/db para degradar correctamente en dev.
 *  - Rate limiting opcional con la misma infra que ya tenemos (Upstash).
 *
 * Todos los endpoints bajo `/api/v1/*` deben pasar por estos helpers para
 * que el comportamiento (headers, CORS, errores) sea homogéneo. Las apps
 * cliente (web fetch + Expo) confían en ese contrato.
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { FLAGS } from "./flags";
import { db } from "./db";
import { checkRateLimit } from "./rateLimit";

/* ----------------------------- CORS ----------------------------- */

/**
 * Orígenes permitidos:
 *  - Producción: SITE.url y subdominios.
 *  - Dev web: cualquier localhost:3000.
 *  - Dev Expo: `exp://*` y `http://*` en LAN — en dev hacemos permissive.
 *  - Prod móvil: la app nativa no envía Origin, pero EAS dev build sí — lo
 *    permitimos por User-Agent que contiene "Expo".
 *
 * Para endpoints MUY sensibles (webhooks, admin) no usar este helper —
 * aplicar allowlist manual.
 */
const PROD_ORIGINS = [
  "https://vuelvecasa.com",
  "https://www.vuelvecasa.com",
  "https://vuelveacasa.mx",
  "https://www.vuelveacasa.mx",
];

function corsHeadersFor(req: NextRequest | Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const isProd = PROD_ORIGINS.includes(origin);
  const isLocal =
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("http://192.168.");
  const isExpo = origin.startsWith("exp://");
  const allowed = isProd || isLocal || isExpo;

  return {
    "Access-Control-Allow-Origin": allowed ? origin : PROD_ORIGINS[0],
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Clerk-Auth, X-Client-Version, X-Client-Platform",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function handleOptions(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeadersFor(req as NextRequest),
  });
}

/* --------------------------- Responses -------------------------- */

export type ApiOk<T> = { ok: true; data: T; meta?: Record<string, unknown> };
export type ApiErr = {
  ok: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export function jsonOk<T>(
  req: Request,
  data: T,
  opts?: { status?: number; meta?: Record<string, unknown>; cache?: string }
): NextResponse<ApiOk<T>> {
  return NextResponse.json(
    { ok: true, data, meta: opts?.meta } satisfies ApiOk<T>,
    {
      status: opts?.status ?? 200,
      headers: {
        ...corsHeadersFor(req),
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": opts?.cache ?? "no-store",
      },
    }
  );
}

export function jsonErr(
  req: Request,
  code: string,
  message: string,
  opts?: { status?: number; fields?: Record<string, string> }
): NextResponse<ApiErr> {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message, fields: opts?.fields },
    } satisfies ApiErr,
    {
      status: opts?.status ?? 400,
      headers: {
        ...corsHeadersFor(req),
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }
  );
}

/* --------------------------- Auth guard ------------------------- */

type MeCtx = {
  clerkUserId: string;
  email: string;
  nombre: string | null;
  usuarioId: string | null;
};

/**
 * Resuelve el usuario autenticado por Clerk + sincroniza la fila en la
 * tabla `usuarios`. Retorna null si no está autenticado (las rutas deciden
 * qué hacer entonces).
 */
export async function resolveMe(): Promise<MeCtx | null> {
  if (!FLAGS.auth) return null;
  const u = await currentUser();
  if (!u) return null;
  const primary =
    u.emailAddresses?.find((e) => e.id === u.primaryEmailAddressId) ||
    u.emailAddresses?.[0];
  const email = primary?.emailAddress ?? "";
  const nombre =
    [u.firstName, u.lastName].filter(Boolean).join(" ") || null;
  try {
    await db.upsertUser({
      clerk_user_id: u.id,
      email,
      nombre,
    });
  } catch {
    // No blocker: si DB está caída seguimos con stub.
  }
  const row = await db.getUserByClerkId(u.id);
  return {
    clerkUserId: u.id,
    email,
    nombre,
    usuarioId: (row?.id as string | undefined) ?? null,
  };
}

/**
 * Exige usuario autenticado. Retorna la request handler response (401) si
 * no lo está, o el contexto si sí. Usar así:
 *
 *   const me = await requireAuth(req);
 *   if (me instanceof NextResponse) return me;
 */
export async function requireAuth(
  req: Request
): Promise<MeCtx | NextResponse<ApiErr>> {
  const me = await resolveMe();
  if (!me) {
    return jsonErr(req, "unauthenticated", "Necesitas iniciar sesión.", {
      status: 401,
    });
  }
  return me;
}

/* -------------------------- Rate limit -------------------------- */

export async function enforceRateLimit(
  req: Request,
  key: string,
  opts: { limit: number; windowSec: number }
): Promise<NextResponse<ApiErr> | null> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";
  const fullKey = `rl:${key}:${ip}`;
  const res = await checkRateLimit(fullKey, opts);
  if (!res.ok) {
    return jsonErr(
      req,
      "rate_limited",
      "Demasiadas solicitudes. Espera un momento antes de reintentar.",
      { status: 429 }
    );
  }
  return null;
}

/* ------------------------- Parsing JSON ------------------------- */

export async function parseJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function badJson(req: Request): NextResponse<ApiErr> {
  return jsonErr(
    req,
    "bad_json",
    "El cuerpo de la solicitud no es JSON válido.",
    { status: 400 }
  );
}
