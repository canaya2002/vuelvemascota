# 11 · Auth con Clerk (Fase 2)

**Tiempo estimado:** 30 min.
**Costo:** free hasta **10,000 MAU**. Plan Pro USD 25/mes + USD 0.02 por MAU extra.
**Qué queda funcionando:** cuentas reales, login con email magic link + Google + Apple + más, perfil editable, middleware protegiendo `/panel/*`, webhook sincronizando a la tabla `usuarios`.

Sin `CLERK_SECRET_KEY`, el sitio corre en Fase 1 puro — `/panel` redirige al home, `/entrar` y `/crear-cuenta` muestran placeholder "próximamente".

---

## 11.1 · Crear cuenta y aplicación

1. <https://dashboard.clerk.com> → **Sign up** (idealmente con `hola@vuelveacasa.mx`).
2. **Create application**:
   - Name: `VuelveaCasa`
   - Sign-in options: marca **Email** y **Google**. Opcional: Apple, GitHub, Microsoft.
   - Finish.
3. Dashboard → **API Keys** → copia:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (empieza con `pk_test_` / `pk_live_`)
   - `CLERK_SECRET_KEY` (empieza con `sk_test_` / `sk_live_`)

En `.env.local` y Vercel:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<TU_PUBLISHABLE_KEY>
CLERK_SECRET_KEY=<TU_SECRET_KEY>
```

---

## 11.2 · Branding en Clerk

Clerk UI ya se ve bien por default, pero puedes:

1. Dashboard → **Customization** → **Branding**:
   - Primary color: `#FF5A36`
   - Logo: sube `public/icon.png` (o una versión 512×512 con márgenes).
2. **Paths**: ya configurado en código:
   - Sign-in: `/entrar`
   - Sign-up: `/crear-cuenta`
   - After sign-in: `/panel`
   - After sign-up: `/panel`
3. **Localization** → **Español** → Set as default.

---

## 11.3 · Dominios permitidos

En producción:

1. Dashboard → **Domains** → **Add domain** → `vuelveacasa.mx`.
2. Pega los registros DNS que Clerk te da (CNAME `accounts.vuelveacasa.mx`).
3. Espera verificación (minutos).
4. Esto permite que Clerk arme sesiones en tu dominio sin redirect a `*.clerk.accounts.dev`.

---

## 11.4 · Webhook Clerk → DB

Para mantener la tabla `usuarios` sincronizada (necesario para enlazar casos con dueños):

1. Dashboard → **Webhooks** → **Add endpoint**.
2. Endpoint URL: `https://vuelveacasa.mx/api/clerk/webhook`.
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`.
4. Click "Create" → copia el **Signing Secret** (empieza con `whsec_`).
5. En Vercel env:
   ```env
   CLERK_WEBHOOK_SECRET=<TU_WHSEC>
   ```
6. Redeploy.
7. Crea una cuenta de prueba en `/crear-cuenta` y verifica que en Supabase → `usuarios` aparezca la fila.

---

## 11.5 · Roles y metadatos

Cada usuario de Clerk tiene `public_metadata` editable. Lo usamos para el rol en la app:

```
{
  "ciudad": "Ciudad de México",
  "rol": "rescatista"
}
```

Opciones de `rol`: `dueño`, `voluntario`, `rescatista`, `veterinaria`, `admin`.

Puedes editarlos manualmente desde Clerk Dashboard → Users → seleccionar → **Metadata**. El webhook los sincroniza a `usuarios.rol`.

Para tu propia cuenta (admin), ponte `"rol": "admin"` desde el dashboard.

---

## 11.6 · Rutas protegidas

`src/middleware.ts` protege:
- `/panel/**` — requiere sesión
- `/api/casos/**` — requiere sesión (Sprint 2.1)

Para proteger más rutas, edita el `createRouteMatcher`:

```ts
const isProtectedRoute = createRouteMatcher([
  "/panel(.*)",
  "/api/casos(.*)",
  "/api/panel(.*)", // ejemplo
]);
```

---

## 11.7 · Leer el usuario en server components

```tsx
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export default async function Page() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null; // el middleware ya redirigió
  const dbUser = await db.getUserByClerkId(clerkUser.id);
  return <div>Hola {dbUser?.nombre}</div>;
}
```

## 11.8 · Leer el usuario en client components

```tsx
"use client";
import { useUser } from "@clerk/nextjs";

export function Hello() {
  const { user, isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return null;
  if (!isSignedIn) return <a href="/entrar">Entrar</a>;
  return <span>Hola {user.firstName}</span>;
}
```

## 11.9 · Llamar APIs propias autenticadas

```tsx
import { auth } from "@clerk/nextjs/server";

// Desde un route handler
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  // userId es el clerk_user_id → buscar/asociar en usuarios
}
```

---

## 11.10 · Producción: de test a live

Cuando quieras pasar a producción:

1. Dashboard → toggle **Production** arriba (crea environment "production" si no existe).
2. Copia **nuevas** keys (ahora `pk_live_` y `sk_live_`).
3. En Vercel → Production env vars → actualiza ambas keys.
4. Crea el webhook en el environment Production también.
5. Redeploy.

Las cuentas creadas en Development **no migran** automáticamente a Production. Si ya tienes usuarios reales en dev, cuéntales que tendrán que crear cuenta de nuevo.

---

## 11.11 · Checklist Clerk

- [ ] Aplicación creada en Clerk con Email + Google habilitados.
- [ ] Publishable key + Secret key en `.env.local` y Vercel.
- [ ] Localización español activada.
- [ ] Paths configurados (`/entrar`, `/crear-cuenta`, `/panel`).
- [ ] Dominio `vuelveacasa.mx` agregado y verificado.
- [ ] Webhook `/api/clerk/webhook` creado con secret en env.
- [ ] Prueba: creaste cuenta → apareció en tabla `usuarios`.
- [ ] Tu cuenta propia tiene `rol: admin` en public_metadata.
- [ ] `/panel` carga para usuarios autenticados.
- [ ] `/panel` redirige a home (con query `?panel=pronto`) para no autenticados.

Con esto, Fase 2 tiene cuentas reales y base lista para Sprint 2.1 (casos con fotos y mapa).
