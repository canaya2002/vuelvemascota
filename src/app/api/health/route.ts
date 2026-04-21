import { NextResponse } from "next/server";
import { FLAGS } from "@/lib/flags";
import { db } from "@/lib/db";
import { storageEnabled } from "@/lib/storage";
import { stripeEnabled } from "@/lib/stripe";
import { rateLimitEnabled } from "@/lib/rateLimit";
import { pushEnabled } from "@/lib/push";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Diagnóstico rápido: qué servicios están activos según envs.
 * Útil para confirmar en producción tras cada deploy.
 * No revela keys; solo flags booleanos y versión de schema.
 */
export async function GET() {
  let dbReady = false;
  let dbTables: string[] = [];
  let dbError: string | null = null;
  if (db.raw) {
    try {
      const rows = (await db.raw`
        select tablename from pg_tables
        where schemaname = 'public'
          and tablename in (
            'waitlist','contacto','aliados','donaciones','usuarios',
            'casos','caso_fotos','caso_avistamientos','caso_updates',
            'alertas','alerta_envios','caso_matches','push_subscriptions'
          )
        order by tablename
      `) as unknown as Array<{ tablename: string }>;
      dbReady = true;
      dbTables = rows.map((r) => r.tablename);
    } catch (err) {
      dbReady = false;
      dbError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    node: process.versions?.node ?? "unknown",
    flags: {
      auth: FLAGS.auth,
      db: FLAGS.db,
      stripe: FLAGS.stripe,
      email: FLAGS.email,
      analytics: FLAGS.analytics,
      storage: storageEnabled(),
      stripe_live: stripeEnabled(),
      rate_limit_upstash: rateLimitEnabled(),
      push: pushEnabled(),
      push_public_key: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    },
    db: {
      connected: dbReady,
      tables: dbTables,
      error: dbError,
    },
    site: {
      url: process.env.NEXT_PUBLIC_SITE_URL || null,
    },
  });
}
