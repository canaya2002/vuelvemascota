/**
 * Middleware global:
 *  - Maneja preflight OPTIONS para /api/v1/* con CORS permisivo para clientes
 *    legítimos (web producción, localhost dev, Expo dev/prod).
 *  - No intercepta requests normales — los route handlers ya ponen sus
 *    propias cabeceras CORS vía `jsonOk/jsonErr`.
 *  - Este middleware NO envuelve Clerk (Clerk se inicializa en el
 *    `ClerkProvider` de app/layout.tsx y `currentUser()` funciona vía
 *    cookies en route handlers sin necesidad de wrapper aquí).
 */
import { NextResponse, type NextRequest } from "next/server";

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/api/v1/")) return NextResponse.next();

  // Preflight
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin") ?? "";
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin(origin),
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods":
          "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Clerk-Auth, X-Client-Version, X-Client-Platform",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
