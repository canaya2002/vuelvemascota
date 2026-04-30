/**
 * Next.js 16 server instrumentation (root file).
 *
 * Loaded ONCE per server lifetime, before any request is handled.
 * We use it to wire Sentry into the Node and Edge runtimes.
 *
 * If SENTRY_DSN is not set (e.g. local dev sin Sentry account), the
 * config files no-op gracefully — no errors, no network calls.
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
