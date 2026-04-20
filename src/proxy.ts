import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Middleware híbrido:
 * - Rate-limit (Upstash Redis si hay envs; memoria si no) en rutas sensibles.
 * - Clerk sólo si está configurado. Si no, el panel redirige al home.
 */

const RATE_LIMITED_PATHS = [
  "/api/waitlist",
  "/api/contacto",
  "/api/aliados",
  "/api/donar/checkout",
];

async function runBase(req: NextRequest): Promise<NextResponse> {
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
      if (baseRes.status === 429) return baseRes;
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
