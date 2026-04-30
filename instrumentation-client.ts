/**
 * Next.js 16 client instrumentation (root file).
 *
 * Runs in the browser before React hydration. Initializes Sentry only if
 * NEXT_PUBLIC_SENTRY_DSN is set; otherwise no-op (no requests, no overhead).
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "production",
    // Performance: 10% en prod, 0% en dev. Ajusta si quieres más coverage.
    tracesSampleRate: 0.1,
    // Session replay: muy útil en prod para reproducir bugs visuales.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    ignoreErrors: [
      // Ruido típico del browser que no es accionable.
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
      // Navegaciones canceladas por el usuario.
      "AbortError",
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
    ],
    denyUrls: [
      // Extensiones de browser que generan ruido.
      /chrome-extension:\/\//,
      /moz-extension:\/\//,
    ],
  });
}

// Next.js 16: hook para tracking de navegación SPA (cliente).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
