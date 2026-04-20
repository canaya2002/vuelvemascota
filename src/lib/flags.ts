/**
 * Feature flags — el sitio debe seguir funcionando con cualquier combinación
 * de servicios activados o no. Esto permite desplegar parcialmente y activar
 * funcionalidad conforme se configuren las env vars.
 */

export const FLAGS = {
  auth: !!process.env.CLERK_SECRET_KEY && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  db: !!process.env.DATABASE_URL,
  stripe: !!process.env.STRIPE_SECRET_KEY,
  email: !!process.env.RESEND_API_KEY,
  analytics: !!process.env.NEXT_PUBLIC_GA_ID,
};

export type FeatureFlag = keyof typeof FLAGS;
