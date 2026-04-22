import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Proxy (Next.js 16 name for the global middleware):
 * - CORS preflight (OPTIONS) para /api/v1/* — usado por la app móvil y
 *   otros clientes fuera del mismo origin.
 * - Rate-limit (Upstash Redis si hay envs; memoria si no) en rutas sensibles.
 * - Clerk sólo si está configurado. Si no, el panel redirige al home.
 */

const PROD_ORIGINS = [
  "https://vuelvecasa.com",
  "https://www.vuelvecasa.com",
  "https://vuelveacasa.mx",
  "https://www.vuelveacasa.mx",
];

function allowOrigin(origin: string): string {
  if (PROD_ORIGINS.includes(origin)) return origin;
  if (origin.startsWith("http://localhost:")) return origin;
  if (origin.startsWith("http://127.0.0.1:")) return origin;
  if (origin.startsWith("http://192.168.")) return origin;
  if (origin.startsWith("exp://")) return origin;
  return PROD_ORIGINS[0];
}

function handleCorsPreflight(req: NextRequest): NextResponse | null {
  if (
    req.method !== "OPTIONS" ||
    !req.nextUrl.pathname.startsWith("/api/v1/")
  ) {
    return null;
  }
  const origin = req.headers.get("origin") ?? "";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowOrigin(origin),
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Clerk-Auth, X-Client-Version, X-Client-Platform",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}

const RATE_LIMITED_PATHS = [
  "/api/waitlist",
  "/api/contacto",
  "/api/aliados",
  "/api/donar/checkout",
];

async function runBase(req: NextRequest): Promise<NextResponse> {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  const { pathname } = req.nextUrl;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  if (
    req.method === "POST" &&
    RATE_LIMITED_PATHS.some((p) => pathname.startsWith(p))
  ) {
    const r = await checkRateLimit(`rl:${ip}:${pathname}`, {
      limit: 10,
      windowSec: 60,
    });
    if (!r.ok) {
      return new NextResponse(
        JSON.stringify({
          error: "Demasiadas solicitudes. Intenta de nuevo en un minuto.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((r.resetAtMs - Date.now()) / 1000).toString(),
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

const AUTH_ENABLED =
  !!process.env.CLERK_SECRET_KEY &&
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const isProtectedRoute = createRouteMatcher([
  "/panel(.*)",
  "/api/casos(.*)",
  "/api/admin(.*)",
]);

export default AUTH_ENABLED
  ? clerkMiddleware(async (auth, req) => {
      const baseRes = await runBase(req);
      if (baseRes.status === 429 || baseRes.status === 204) return baseRes;
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
      return baseRes;
    })
  : async (req: NextRequest) => {
      if (req.nextUrl.pathname.startsWith("/panel")) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        url.searchParams.set("panel", "pronto");
        return NextResponse.redirect(url);
      }
      return runBase(req);
    };

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png|android-chrome-.*|site.webmanifest|generales|videos|robots.txt|sitemap.xml|sw.js).*)",
  ],
};
