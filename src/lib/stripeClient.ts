/**
 * Runtime loader del SDK de Stripe.
 *
 * Cargamos via `createRequire` con un module id armado en runtime para que el
 * bundler no intente resolver el paquete estáticamente. Así el sitio arranca
 * aun si Stripe no está instalado (ej. preview sin cobros).
 *
 * Cuando `STRIPE_SECRET_KEY` está presente y `stripe` ya es dependencia (lo
 * es a partir de producción), este módulo retorna una instancia autenticada.
 *
 * Nota sobre apiVersion: NO lo fijamos. Stripe usa el default de la cuenta
 * Dashboard → Developers, así el SDK se actualiza sin requerir cambio en
 * código cuando hacemos bump. Igualmente cada evento de webhook contiene su
 * propio api_version; si algún día necesitamos reproducir eventos viejos,
 * eso sigue funcionando.
 */

type StripeCtor = new (
  key: string,
  opts?: Record<string, unknown>
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
    // Deja que el SDK use su apiVersion built-in — siempre la última soportada.
    // Ver https://stripe.com/docs/api/versioning
    typescript: true,
    appInfo: {
      name: "vuelvecasa-web",
      version: "1.0.0",
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://vuelvecasa.com",
    },
  });
}
