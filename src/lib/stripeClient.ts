/**
 * Runtime loader for the optional Stripe SDK.
 *
 * The package `stripe` is intentionally *not* declared as a dependency during
 * fase 1. We resolve it only at runtime via `createRequire`, through a module
 * id that is not a string literal — so the bundler does not try to bundle it.
 *
 * To activate real payments in production: `npm i stripe` and set
 * STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET.
 */

type StripeCtor = new (
  key: string,
  opts: { apiVersion: string }
) => StripeLike;

type StripeLike = {
  checkout: {
    sessions: {
      create: (args: Record<string, unknown>) => Promise<{ url: string | null }>;
    };
  };
  webhooks: {
    constructEvent: (
      payload: string,
      header: string,
      secret: string
    ) => { type: string };
  };
};

export async function getStripe(): Promise<StripeLike> {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe no está configurado");
  }
  const { createRequire } = await import("node:module");
  const req = createRequire(import.meta.url);
  // Non-literal module id prevents bundler static analysis / pre-resolution.
  const pkgName: string = process.env.STRIPE_MODULE_NAME || ["strip", "e"].join("");
  const mod = req(pkgName) as { default: StripeCtor } | StripeCtor;
  const Ctor = (typeof mod === "function" ? mod : mod.default) as StripeCtor;
  return new Ctor(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-11-20.acacia",
  });
}
