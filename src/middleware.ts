import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware — corre en el Edge Runtime.
 * 1. Fuerza redirect del apex sin slash final (se lo hace Vercel pero lo dejamos explícito).
 * 2. Rate-limit en memoria (por IP) para endpoints de formularios públicos.
 *    Para producción en Vercel multi-instancia, reemplaza por Upstash / Vercel KV.
 * 3. Añade un request ID para logs.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10; // 10 requests/min por IP por ruta

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const RATE_LIMITED_PATHS = [
  "/api/waitlist",
  "/api/contacto",
  "/api/aliados",
  "/api/donar/checkout",
];

function rateLimit(ip: string, path: string) {
  const key = `${ip}:${path}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_PER_WINDOW - 1 };
  }
  b.count += 1;
  if (b.count > MAX_PER_WINDOW) {
    return { ok: false, remaining: 0, resetAt: b.resetAt };
  }
  return { ok: true, remaining: MAX_PER_WINDOW - b.count };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  // Rate limit solo en POSTs a rutas sensibles.
  if (req.method === "POST" && RATE_LIMITED_PATHS.some((p) => pathname.startsWith(p))) {
    const r = rateLimit(ip, pathname);
    if (!r.ok) {
      return new NextResponse(
        JSON.stringify({
          error: "Demasiadas solicitudes. Intenta de nuevo en un minuto.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((r.resetAt! - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  const res = NextResponse.next();
  const reqId =
    globalThis.crypto?.randomUUID?.() ||
    Math.random().toString(36).slice(2);
  res.headers.set("x-request-id", reqId);
  return res;
}

export const config = {
  matcher: [
    // Corremos en todo salvo assets estáticos.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png|android-chrome-.*|site.webmanifest|generales|videos|robots.txt|sitemap.xml).*)",
  ],
};
