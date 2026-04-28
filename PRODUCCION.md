# Producción · Estado actual y lo que falta por tu lado

**Fecha de última auditoría:** 24 abr 2026.
**Build status:** ✅ `npm run build` limpio, sin errores ni warnings.
**Typecheck web:** ✅ `tsc --noEmit` limpio.
**Typecheck mobile:** ✅ `tsc --noEmit` limpio.
**Deploy vivo:** ✅ `GET /api/health` devuelve todos los flags en `true` y las 13 tablas conectadas.

```json
{
  "flags": {
    "auth": true, "db": true, "stripe": true, "stripe_live": true,
    "email": true, "analytics": true, "storage": true,
    "rate_limit_upstash": true, "push": true
  },
  "db": { "connected": true, "tables": 13 }
}
```

---

## 1. Fixes aplicados en esta auditoría

1. **`stripe` npm package añadido como dependencia real** (`^22.1.0`).
2. **`apiVersion` de Stripe removido del constructor** — ahora usa la default del SDK.
3. **`src/lib/chat.ts` · paginación real con cursor `before`**.
4. **`apps/mobile/app/donar.tsx` completado** — error state + back inteligente + cookies compartidas.
5. **Limpieza de imports/void casts huérfanos**.
6. **`apps/mobile/.env` completado** — añadido `MAPBOX_DOWNLOAD_TOKEN` y `EAS_PROJECT_ID`.
7. **`apps/mobile/eas.json` configurado** — perfiles `preview` y `production` inyectan `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...` en builds productivos.
8. **`apps/mobile/app.config.ts` blindado para EAS CLI**:
   - `__dirname` reemplazado por `process.cwd()` — corrige `exports is not defined` del loader CJS de Expo.
   - `owner: "carlosanaya"` agregado (requisito de EAS init).
   - Bloque `updates: { url: "https://u.expo.dev/<projectId>" }` + `runtimeVersion: { policy: "appVersion" }` para OTA.
   - Migrado de `@rnmapbox/maps` plugin option (deprecated) al env var `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` (aliased desde `MAPBOX_DOWNLOAD_TOKEN`).
9. **`src/components/Navbar.tsx` refactor móvil** — drawer fuera del `<header sticky>`, z-index corregido, backdrop clickeable, `type="button"`, `touchAction: manipulation`, `Escape` cierra, cierra al navegar. Arregla el bug de "tap al hamburger no abre" en iOS Safari.

---

## 2. Lo que ya está conectado y funcionando

### Web (Next.js 16 + Clerk + Stripe + Supabase)
- **Páginas públicas:** home, casos, donar, donar/gracias, casos/[slug], contacto, registro, privacidad, términos, FAQ, 10 hubs SEO, ciudades dinámicas, rescatistas, veterinarias, hogar-temporal.
- **Panel (/panel):** casos + nuevo + [slug], alertas, avistamientos, donaciones, perfil, cuenta, admin, admin/usuarios.
- **API v1 completa:** 21 endpoints.
- **Pagos Stripe LIVE** con webhook idempotente.
- **Alertas de zona** con email (Resend) + push (Expo).
- **Matching automático** perdida ↔ encontrada.
- **Moderación**: texto (OpenAI) + imágenes (Azure).

### Mobile (Expo 53 + Clerk Expo)
- Auth Clerk + SecureStore, Onboarding, Tabs, detalle de caso, chat, foros, reportar, donar WebView robusto, push notifications.

---

## 3. Checklist de producción

### ✅ 3.1 · Base de datos (Supabase) — **LISTO**
Las 13 tablas aparecen en `/api/health`.

### ✅ 3.2 · Storage (Supabase Storage) — **LISTO / pendiente smoke test**
Bucket `casos` creado. Validar con una foto real al publicar un caso.

### ✅ 3.3 · Stripe — **LISTO** (webhook + keys live)
SPEI queda para después. Productos recurrentes: **no los necesitas** (el código usa precios ad-hoc inline).

### ✅ 3.4 · Clerk — **LISTO**
- ✅ URLs `<SignIn />` y `<SignUp />` apuntan a `https://vuelvecasa.com/entrar` y `/crear-cuenta` (application domain).
- ✅ Webhook registrado en `https://vuelvecasa.com/api/clerk/webhook`.
- ✅ Rol admin asignado a tu cuenta vía Dashboard → Users → Metadata → Public → `{"rol":"admin"}`.

### ✅ 3.5 · Dominios + Vercel — **LISTO**

### ✅ 3.6 · Email (Resend) — **LISTO**
Dominio verificado, SPF/DKIM activos.

### 3.7 · App móvil (Expo + App Store + Play Store)

**✅ Archivos locales configurados por mí:**

- ✅ `apps/mobile/.env` — creado con:
  - `EXPO_PUBLIC_API_URL=https://vuelvecasa.com`
  - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...` (dev key para Expo Go)
  - `EXPO_PUBLIC_MAPBOX_TOKEN=pk....` (tu token público)
  - `MAPBOX_DOWNLOAD_TOKEN=sk....` (secret, solo para `@rnmapbox/maps` en build)
  - `EAS_PROJECT_ID=817a12b4-ce4e-451b-8a03-f272e9149fc0`
- ✅ `apps/mobile/eas.json` — perfiles `preview` y `production` inyectan `pk_live_Y2xlcmsudnVlbHZlY2FzYS5jb20k` y fijan `https://vuelvecasa.com` como API URL.

> **Por qué dev vs prod key:** Clerk `pk_live_` está restringida al dominio `vuelvecasa.com`. Desde Expo Go (scheme `exp://`) rebota. Con `.env` en `pk_test_` el dev funciona; al hacer `eas build -p production`, `eas.json` override con `pk_live_`. Así un solo repo sirve ambos mundos sin tocar código.

**Pendiente tú (requieren tu sesión/cuentas):**

```bash
# 1) Login y vinculación de proyecto
cd apps/mobile
npx expo login           # tu cuenta de Expo
npx eas-cli@latest init --id 817a12b4-ce4e-451b-8a03-f272e9149fc0

# 2) (Opcional) subir el download token de Mapbox como secret en EAS en vez
#    de quedarse en .env. Solo si querés máxima higiene de secretos:
npx eas-cli secret:create --scope project `
  --name MAPBOX_DOWNLOAD_TOKEN `
  --value "<MAPBOX_DOWNLOAD_TOKEN_FROM_ENV>"
# El valor se lee del archivo apps/mobile/.env (variable MAPBOX_DOWNLOAD_TOKEN).
# NUNCA pegues el token literal en docs versionadas — git history queda público.

# 3) Assets (logos + splash)
#    Genera: apps/mobile/assets/images/{icon.png, icon-foreground.png,
#                                       splash.png, notification-icon.png,
#                                       favicon.png}
#    Si faltan, el build corre con defaults de Expo — no rompe.

# 4) Builds productivos (requieren Apple Dev 99 USD/año + Google Play 25 USD)
npx eas-cli build -p ios --profile production
npx eas-cli build -p android --profile production

# 5) Submit a las stores
npx eas-cli submit -p ios
npx eas-cli submit -p android

# O descarga el .ipa / .aab y súbelos manualmente en ASC / Play Console.
```

**Metadata para App Store / Play Store:**
- Screenshots: home, casos, reportar, chat, foros, donar.
- Política de privacidad URL: `https://vuelvecasa.com/privacidad`.
- **Apple review notes (obligatorio):** "El usuario puede borrar su cuenta en Ajustes → Borrar cuenta. Endpoint `DELETE /api/v1/me` ya implementado (requisito 5.1.1(v))."

### 3.8 · Variables opcionales
- ✅ **GA4** activo (`G-Y9H7Y4P0EW`).
- ⏸ **Search Console:** pega código en `GOOGLE_SITE_VERIFICATION` y re-deploy.
- ⏸ **Bing Webmaster:** `BING_SITE_VERIFICATION`.
- ✅ **TikTok Pixel** configurado.
- ⏸ **Meta Pixel:** rellena `NEXT_PUBLIC_META_PIXEL_ID` solo si corres FB/IG ads.

### 3.9 · DNS + Legal
- ⏸ Textos legales: revisa `SITE.legal.razonSocial` en `src/lib/site.ts`.
- ⏸ Aviso LFPDPPP + datos de contacto ARCO — completa nombres.

---

## 4. Verificación post-deploy (smoke test)

1. ✅ `curl https://vuelvecasa.com/api/health` — confirmado el 24 abr 2026.
2. ⏸ `/sitemap.xml` y `/robots.txt` visibles.
3. ⏸ Crear cuenta real en `/crear-cuenta` → aparece en Supabase → `usuarios`.
4. ⏸ `/panel/casos/nuevo` → crear caso con foto → verifica `casos` + `caso_fotos`.
5. ⏸ `/donar` → donar $20 con tarjeta test `4242 4242 4242 4242` → webhook → fila en `donaciones`.
6. ⏸ Abrir app móvil (Expo Go o development build) → sign-in → ver el caso → crear alerta.
7. ⏸ Publicar caso que matchee → email + push al dispositivo.

---

## 5. Qué degrada si falta algo

| Falta | Comportamiento |
|-------|----------------|
| Bucket `casos` en Supabase Storage | Publicar caso funciona, pero `POST /casos/[slug]/fotos` tira 503 |
| Assets móviles (`icon.png` etc.) | Build corre con defaults de Expo |
| `STRIPE_PRICE_MONTHLY_*` | **Sin efecto.** Nunca se leen |
| Cuenta Apple Developer | No puedes publicar en App Store. Funciona en TestFlight con dev build |
| Cuenta Google Play | No puedes publicar en Play Store. Funciona con `.aab` interno |

---

## 6. Si algo se rompe

1. `GET /api/health` → flag rojo.
2. Vercel → Deployments → logs en vivo.
3. Stripe Dashboard → Webhooks → Events.
4. Supabase → Reports → Query Performance.
5. Rollback: Vercel → Deployments → previa → "Promote to Production".

---

## 7. Resumen ejecutivo

**Ya está listo:**
- ✅ Código web + mobile (typecheck + build limpios).
- ✅ Supabase DB con 13 tablas + bucket `casos`.
- ✅ Stripe keys live + webhook.
- ✅ Clerk con URLs application domain + webhook + rol admin.
- ✅ Email Resend dominio verificado.
- ✅ Vercel con dominios + env vars + `NEXT_PUBLIC_SITE_URL` correcto.
- ✅ `/api/health` verde.
- ✅ `apps/mobile/.env` y `eas.json` configurados para dev y prod.

**Queda de tu lado (solo mobile app + verificaciones):**
1. `cd apps/mobile && npx expo login` → `npx eas-cli@latest init`.
2. Generar assets en `apps/mobile/assets/images/`.
3. Cuentas Apple Developer (99 USD/año) y Google Play (25 USD).
4. `eas build` + `eas submit`.
5. Smoke test rápido en web: crear cuenta, publicar caso, donar test.
6. (Opcional) completar `SITE.legal.razonSocial` y datos ARCO.
7. (Opcional) Search Console + Bing verificación.

**NO necesitas:**
- ❌ Crear catálogo de productos en Stripe.
- ❌ Rellenar `STRIPE_PRICE_MONTHLY_*`.
- ❌ Configurar Account Portal de Clerk.
