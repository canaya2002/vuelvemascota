/**
 * Loader del SDK de Stripe.
 *
 * Antes usábamos `createRequire` + module id dinámico para que el bundler no
 * intentara resolver el paquete estáticamente — útil cuando Stripe era
 * opcional. Pero con Turbopack en Next.js 16 ese truco rompe en runtime con
 * `"Cannot find module as expression is too dynamic"` y deja `/api/donar/checkout`
 * tirando 500 en producción.
 *
 * Ahora `stripe` es una dependencia real (package.json), así que importamos
 * estático. El gate de "Stripe no configurado" se hace por `stripeEnabled()`
 * en `./stripe.ts` ANTES de llamar a `getStripe()`.
 *
 * Nota sobre apiVersion: NO lo fijamos. Stripe usa el default de la cuenta
 * Dashboard → Developers, así el SDK se actualiza sin requerir cambio en
 * código cuando hacemos bump.
 */

import Stripe from "stripe";

let cached: Stripe | null = null;

export async function getStripe(): Promise<Stripe> {
  if (cached) return cached;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe no está configurado");
  }
  cached = new Stripe(process.env.STRIPE_SECRET_KEY, {
    typescript: true,
    appInfo: {
      name: "vuelvecasa-web",
      version: "1.0.0",
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://vuelvecasa.com",
    },
  });
  return cached;
}
