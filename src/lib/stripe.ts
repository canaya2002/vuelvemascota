/**
 * Stripe configuration for donations.
 *
 * Fase 1: keep Stripe optional. The donation widget calls /api/donar/checkout,
 * which returns a safe "preview" response if STRIPE_SECRET_KEY is missing.
 *
 * To activate real payments:
 *   1. `npm i stripe`
 *   2. Set in .env:
 *        STRIPE_SECRET_KEY=sk_live_...
 *        STRIPE_WEBHOOK_SECRET=whsec_...
 *        NEXT_PUBLIC_SITE_URL=https://vuelveacasa.mx
 *   3. Optionally pre-create Stripe Products/Prices and set IDs below.
 *
 * The route handlers already follow Stripe's canonical Checkout redirect flow
 * (Payment Intent for one-off, Subscription for recurrente). No PCI data
 * touches our server.
 */

export const STRIPE_CONFIG = {
  currency: "mxn",
  minAmount: 20, // MXN
  // Optional pre-created Price IDs for recurrente fixed tiers.
  // If empty, checkout creates an ad-hoc recurring price.
  monthlyPriceIds: {
    fondo: process.env.STRIPE_PRICE_MONTHLY_FONDO || "",
    emergencia: process.env.STRIPE_PRICE_MONTHLY_EMERGENCIA || "",
    rescate: process.env.STRIPE_PRICE_MONTHLY_RESCATE || "",
  } as Record<string, string>,
  productName: (causa: string) =>
    ({
      fondo: "Donación · Fondo comunitario VuelveaCasa",
      emergencia: "Donación · Emergencias veterinarias",
      rescate: "Donación · Rescatistas aliados",
    }[causa] || "Donación VuelveaCasa"),
  publicSiteUrl:
    process.env.NEXT_PUBLIC_SITE_URL || "https://vuelveacasa.mx",
};

export function stripeEnabled() {
  return !!process.env.STRIPE_SECRET_KEY;
}
