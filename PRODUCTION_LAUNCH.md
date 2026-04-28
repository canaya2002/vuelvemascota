# VuelveaCasa — Checklist integral de lanzamiento a producción

**Última actualización**: 2026-04-28
**Para**: ti, dueño del proyecto.
**Cubre**: Web (Vercel), iOS (App Store), Android (Play Store), DB, email, push, pagos, monitoreo, legal y soporte.
**Asunción**: NO buscarás certificación non-profit. Las donaciones se procesan PERMANENTEMENTE en la web, nunca en el app móvil.

---

## TL;DR — qué te falta hacer en orden

1. **Web**: configurar env vars en Vercel, verificar Stripe live, deployar.
2. **DB**: aplicar migración, sembrar 10 casos demo, validar backup.
3. **Email**: verificar dominio en Resend.
4. **iOS**: ASC setup + screenshots + descripción + review notes + submit.
5. **Android**: Play Console setup + Data Safety + screenshots + submit.
6. **Monitoreo**: prender Vercel Analytics + Sentry.
7. **Soft launch** con cierre amigos por 1 semana antes de marketing público.

Detalle abajo.

---

## 1. Estrategia permanente de pagos (sin non-profit)

Lee esto **antes que nada** porque define muchas decisiones del resto del documento.

**Hecho**: VuelveaCasa NO es donataria autorizada SAT y NO buscará certificación Apple Nonprofit. Eso significa:

| Surface | Cobro permitido | Modo |
|---|---|---|
| **Web** (`vuelvecasa.com/donar`) | ✅ Stripe Checkout completo | El donador navega al sitio y paga con tarjeta. Funciona normal. |
| **App iOS / Android** | ❌ NUNCA cobro in-app | Pantalla `/donar` solo informativa + botón que abre Safari/Chrome del sistema con `Linking.openURL`. |

**Las consecuencias legales / fiscales** que ya están reflejadas en la copy:

- Donaciones **NO** son deducibles de impuestos (el donante NO recibe CFDI).
- Tú (persona física o empresa) recibes el dinero como **ingreso ordinario** y lo declaras en tu ISR personal/de empresa al SAT. Stripe genera reportes mensuales que sirven de respaldo.
- En la web aparece el disclaimer "no es deducible" en `/donar` FAQ.
- En la app aparece "VuelveaCasa no es donataria autorizada por SAT" en la pantalla de donar y en términos.

**Las consecuencias para Apple/Google** que ya están reflejadas en el código:

- App iOS: `Linking.openURL("https://www.vuelvecasa.com/donar")` — Safari del sistema. Apple lo trata como navegación externa, fuera del scope del app, NO requiere IAP.
- Copy del app no menciona "membresía", "suscripción", "premium", "desbloquear", "$X al mes".
- Donaciones explícitamente: "No desbloquea ni amplía funciones de la app".

**Lo que NO debes hacer NUNCA**:
- ❌ Reactivar el flow nativo de cobro en mobile (no lo intentes ni con A/B testing).
- ❌ Cambiar `Linking.openURL` por `WebBrowser.openBrowserAsync` (SFSafariViewController). Apple lo puede interpretar como cobro in-app.
- ❌ Decir en cualquier copy del app: "membresía", "suscripción", "plan premium", "desbloquear features", "$X al mes/año".
- ❌ Bloquear features del app si no donas. Ni siquiera A/B test parcial.

---

## 2. Web (Vercel)

### 2.1 Env vars en Vercel — checklist

Settings → Environment Variables. Aplica para **Production** (los `Preview` y `Development` solo si quieres deploys de PR).

**Auth (Clerk)**:
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_…`
- [ ] `CLERK_SECRET_KEY` = `sk_live_…`
- [ ] `CLERK_WEBHOOK_SECRET` = `whsec_…` (de Clerk Dashboard → Webhooks)

**Database (Supabase)**:
- [ ] `DATABASE_URL` = la pooler connection string (no la directa). Copia desde Supabase → Settings → Database → Connection Pooling → "Transaction" mode. Suele empezar con `postgres://postgres.xxxxx:[password]@aws-...:6543/postgres`. **Importante**: el código usa `prepare: false` y `max: 1` por compat con pgbouncer.
- [ ] `SUPABASE_URL` = `https://xxxxx.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE` = el `service_role` JWT key (Supabase → Settings → API).

**Stripe (live mode)**:
- [ ] `STRIPE_SECRET_KEY` = `sk_live_…`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_…` (configurado abajo en §2.5).
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://www.vuelvecasa.com`
- [ ] (opcional) `STRIPE_PRICE_MONTHLY_FONDO`, `STRIPE_PRICE_MONTHLY_EMERGENCIA`, `STRIPE_PRICE_MONTHLY_RESCATE` si pre-creaste prices recurrentes en Stripe Dashboard. Si los dejas vacíos, el código crea precios ad-hoc (también funciona).

**Email (Resend)**:
- [ ] `RESEND_API_KEY` = `re_…`
- [ ] `CONTACT_INBOX` = `canaya917@gmail.com` (recordatorio de tu memoria — el dominio vuelvecasa.com no tiene MX; sin esto los contactos rebotan).

**Push (Web Push VAPID)**:
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = la pública (genérala con `npx web-push generate-vapid-keys`).
- [ ] `VAPID_PRIVATE_KEY` = la privada del mismo par.
- [ ] `VAPID_SUBJECT` = `mailto:hola@vuelvecasa.com`

**Mapbox**:
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` = `pk.…` (mismo que en mobile).

**Moderación**:
- [ ] `OPENAI_API_KEY` = `sk-proj-…` (modera texto en chat/foros vía omni-moderation-latest, que es gratis en Mod API).
- [ ] (opcional, modo strict) `AZURE_CONTENT_SAFETY_KEY` + `AZURE_CONTENT_SAFETY_ENDPOINT` para imágenes.

**Feature flags**:
- [ ] `NEXT_PUBLIC_AUTH_ENABLED=true`
- [ ] `NEXT_PUBLIC_DB_ENABLED=true`
- [ ] (opcional) `MODERATION_MODE=auto` (default) o `strict` para foros sensibles.

**SEO/verificación** (opcionales):
- [ ] `NEXT_PUBLIC_GOOGLE_VERIFICATION` (de Google Search Console).
- [ ] `NEXT_PUBLIC_BING_VERIFICATION` (de Bing Webmaster).
- [ ] `NEXT_PUBLIC_META_VERIFICATION` (Facebook Business Manager).

### 2.2 DNS

Tu dominio: `vuelvecasa.com`.

**Configuración recomendada** (que ya está parcialmente):
- [ ] `vuelvecasa.com` (apex) → 307 redirect a `www.vuelvecasa.com` (ya configurado en Vercel).
- [ ] `www.vuelvecasa.com` → CNAME a `cname.vercel-dns.com` (ya configurado).
- [ ] **MX records**: ⚠️ tu dominio NO tiene MX, por eso los emails de contacto rebotan. Si quieres recibir email a `hola@vuelvecasa.com`:
  - Opción A (gratis, fácil): apuntar MX a un proveedor como Resend (forward) o Cloudflare Email Routing → reenvía a tu Gmail personal.
  - Opción B (formal): contratar Google Workspace ($6/mes/usuario).
  - **Hasta que arregles esto**, deja `CONTACT_INBOX=canaya917@gmail.com` para que los formularios lleguen a tu personal.

### 2.3 Resend (email)

Resend Dashboard → Domains → Add Domain → `vuelvecasa.com`.

Te pedirá agregar 4 registros DNS:
- [ ] `_resend` TXT (verifica el dominio).
- [ ] DKIM CNAME (firma criptográfica de envío).
- [ ] SPF TXT (autoriza a Resend a enviar en tu nombre).
- [ ] DMARC TXT en `_dmarc.vuelvecasa.com` con `v=DMARC1; p=none; rua=mailto:hola@vuelvecasa.com` (políticas de bounce).

Sin verificación DKIM, Gmail/Outlook van a meter tus emails al spam o rechazarlos.

**Sender identity** que el código usa (en `src/lib/email.ts`):
- `from: 'VuelveaCasa <hola@vuelvecasa.com>'` — esto requiere DKIM verificado. Hasta entonces usa `from: 'VuelveaCasa <onboarding@resend.dev>'` (default Resend).

### 2.4 Stripe (live mode)

Stripe Dashboard:
- [ ] Cambia a **Live mode** (toggle arriba a la izquierda).
- [ ] **API keys** → copia `sk_live_…` a Vercel env (§2.1).
- [ ] **Webhooks** → Add endpoint:
  - URL: `https://www.vuelvecasa.com/api/donar/webhook`
  - Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`, `charge.refunded`, `payment_intent.payment_failed` (los 5 los maneja el código).
  - Copia el **Signing secret** (`whsec_…`) y ponlo en `STRIPE_WEBHOOK_SECRET` en Vercel.
- [ ] **Branding** (Stripe Dashboard → Settings → Branding): sube logo de VuelveaCasa, color brand `#b8264a`. Aparece en el Checkout y en los recibos.
- [ ] **Receipts**: Settings → Customer emails → activa "Successful payments" → Stripe le manda recibo automático al donador. Esto es lo que sustituye al CFDI deducible.
- [ ] **Payment methods** → habilita: Card, Apple Pay, Google Pay, OXXO (México). OXXO es importante: 30% de mexicanos sin tarjeta lo usan.

### 2.5 Webhook Clerk

Clerk Dashboard → Webhooks → Add endpoint:
- URL: `https://www.vuelvecasa.com/api/clerk/webhook`
- Events: `user.created`, `user.updated`, `user.deleted`
- Copia el signing secret a `CLERK_WEBHOOK_SECRET` en Vercel.

Esto sincroniza usuarios de Clerk con tu tabla `usuarios` automáticamente cuando alguien crea cuenta o actualiza su perfil.

### 2.6 Deploy

Cualquier `git push origin main` triggea auto-deploy. Si quieres forzar:

```bash
git commit --allow-empty -m "trigger: prod redeploy"
git push
```

Después del deploy, valida con `curl`:

```bash
# Health
curl https://www.vuelvecasa.com/api/health

# Donar (preview si Stripe no está, real si sí está)
curl -X POST https://www.vuelvecasa.com/api/donar/checkout \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"causa":"fondo","currency":"mxn"}'

# Vistas (debe ser 401 unauthenticated)
curl https://www.vuelvecasa.com/api/v1/vistas

# Casos públicos
curl "https://www.vuelvecasa.com/api/v1/casos?limit=5"
```

Lo que esperas:
- `/api/health` → `{ ok: true, ... }`
- `/api/donar/checkout` con Stripe configurado → `{ ok: true, url: "https://checkout.stripe.com/..." }`
- `/api/v1/vistas` → `{ ok: false, error: { code: "unauthenticated", ... } }`
- `/api/v1/casos` → `{ ok: true, data: [...] }`

### 2.7 Monitoreo (recomendado, no blocker)

- **Vercel Analytics** (gratis): Project → Analytics → enable. Te da page views + Core Web Vitals.
- **Sentry** (5K events/mes gratis): para crash reporting. Setup: `npx @sentry/wizard@latest -i nextjs`. Set `SENTRY_DSN` y `NEXT_PUBLIC_SENTRY_DSN` en Vercel.
- **Uptime monitoring**: [UptimeRobot](https://uptimerobot.com) (gratis, ping cada 5 min) — agrega `https://www.vuelvecasa.com/api/health`.

---

## 3. Database (Supabase)

### 3.1 Migrations aplicadas

- [x] `db/schema.sql` (schema base) — ya corrió.
- [x] `db/migrations/2026-04-27_chat_redesign.sql` — confirmaste que ya corrió.

Cualquier futura migración: agrégala a `db/migrations/AAAA-MM-DD_descripcion.sql` y córrela en SQL Editor.

### 3.2 RLS (Row Level Security)

El schema activa RLS en todas las tablas pero el backend conecta como `service_role` que bypaseaa RLS. Si en el futuro expones Supabase client al browser, define policies. Por ahora **no es blocker** — el server tiene el control.

### 3.3 Backups

Supabase free tier: backup automático diario, 7 días de retención. Suficiente para fase inicial.

Si pasas a tier Pro ($25/mes): point-in-time recovery + 30 días retención.

**Backup manual antes de cualquier operación riesgosa**:
```bash
pg_dump $DATABASE_URL > backup_$(date +%F).sql
```

### 3.4 Seed data (CRÍTICO)

⚠️ **Apple y Google rechazan apps "vacías"** ("Minimal Functionality" — Guideline 4.2). Si el reviewer abre tu app y el feed de casos está vacío, te tumba.

**Antes de submit**, mete 8-15 casos demo realistas:

```sql
-- Ejemplo, copia y multiplica con variaciones por ciudad
insert into casos (slug, tipo, especie, nombre, raza, color, tamano, descripcion, fecha_evento, ciudad, municipio, colonia, lat, lng, contacto_nombre, estado)
values
  ('firulais-coyoacan-demo1', 'perdida', 'perro', 'Firulais', 'Mestizo', 'café claro', 'mediano',
   'Se perdió el sábado en Coyoacán cerca del Jardín Hidalgo. Tiene collar rojo y es muy cariñoso.',
   current_date - 2, 'Ciudad de México', 'Coyoacán', 'Centro de Coyoacán',
   19.3500, -99.1620, 'Laura R.', 'activo'),
  ('luna-polanco-demo2', 'encontrada', 'gato', 'Luna (provisional)', 'Doméstico', 'gris atigrado', 'chico',
   'Apareció en mi terraza, está sana y dócil. La tengo en hogar temporal hasta encontrar dueño.',
   current_date - 5, 'Ciudad de México', 'Miguel Hidalgo', 'Polanco',
   19.4330, -99.1900, 'Andrés M.', 'activo')
  -- ... 6-13 más
;
```

Cada caso necesita `casos.id` referenciable. Sube al menos 1 foto por caso (URL pública o sube a `casos` bucket en Supabase Storage).

**Tip de scraping rápido**: usa fotos genéricas de Unsplash (URLs `https://images.unsplash.com/photo-…`) — no son tuyas pero para el reviewer sirven y luego las reemplazas con casos reales.

---

## 4. Push notifications (Expo + APNs + FCM)

### 4.1 iOS (APNs)

EAS Dashboard → Project → Credentials → iOS → Push Notifications:
- [ ] EAS te pide acceso a tu App Store Connect, genera el APNs key automáticamente. Acepta.
- [ ] Verifica que el key aparezca en EAS credentials.

### 4.2 Android (FCM)

Firebase Console → crear proyecto → agregar app Android (`com.vuelvecasa.app`):
- [ ] Descarga `google-services.json` y ponlo en `apps/mobile/google-services.json`.
- [ ] EAS Dashboard → Credentials → Android → Push → sube el `google-services.json`.

### 4.3 Test E2E

Después del primer build de producción:

```bash
# Desde una pantalla del app, copia el push token a un Expo.dev tester
# Settings → Notifications → tap en "test push" (si lo tienes)
# O usa: https://expo.dev/notifications

# Manda un push de prueba con cuerpo:
curl -H "Content-Type: application/json" -X POST https://exp.host/--/api/v2/push/send -d '{
  "to": "ExponentPushToken[XXXXXXX]",
  "title": "Mascota cerca",
  "body": "Se reportó un perro perdido a 1.2 km",
  "data": { "casoSlug": "firulais-coyoacan-demo1" }
}'
```

---

## 5. iOS — App Store Connect

### 5.1 Crear app en ASC (si no existe)

App Store Connect → My Apps → "+" → New App:
- Platform: iOS
- Name: `VuelveaCasa`
- Bundle ID: `com.vuelvecasa.app` (debe coincidir con `app.config.ts`).
- SKU: `vuelveacasa-ios-001`
- Primary Language: Spanish (Mexico)

### 5.2 Información básica

App Information:
- **Subtitle** (30 chars): `Reúne mascotas perdidas en MX`
- **Category**: Primary `Lifestyle`, Secondary `Social Networking`.
- **Content rights**: marca "Does not contain, show, or access third-party content" (es tu app).

### 5.3 Pricing & Availability

- **Price**: Free.
- **Availability**: Available in México (todos los demás países off por ahora).

### 5.4 Privacy

- **Privacy Policy URL**: `https://www.vuelvecasa.com/privacidad`

### 5.5 App Privacy ("nutrition labels") — copia exacto

App Privacy → Edit → "+ Add Data Type":

| Categoría | Tipo | Linked to user | Tracking | Purpose |
|---|---|---|---|---|
| Contact Info | Email Address | Yes | No | App Functionality, Account Management |
| Contact Info | Name | Yes | No | App Functionality |
| Identifiers | User ID | Yes | No | App Functionality |
| Identifiers | Device ID | Yes | No | App Functionality (push tokens) |
| Location | Coarse Location | Yes | No | App Functionality (alertas por zona) |
| Location | Precise Location | Yes | No | App Functionality (mapa de casos) |
| User Content | Photos or Videos | Yes | No | App Functionality |
| User Content | Other User Content | Yes | No | App Functionality (descripciones, chat) |
| Diagnostics | Crash Data | No | No | Analytics |

**Tracking**: marca "No, we do not collect data from this app for tracking purposes" (porque NO haces cross-app tracking ni vendes datos).

**Financial Info**: NO declarar nada. **Esto es importante**: si declaras Financial Info, Apple infiere que procesas pagos en la app y te exige IAP. No declares nada en esa sección.

### 5.6 Versión 1.0 — App Information

#### Promotional Text (170 chars, editable sin nuevo build)
```
Red comunitaria mexicana para reportar, encontrar y rescatar mascotas
perdidas. Alertas en tu zona, hilos por caso y red de aliados verificados.
```

#### Description (4000 chars)
```
VuelveaCasa es la red comunitaria de México para reportar mascotas perdidas
o encontradas y reunirlas con sus familias. Vecinos, rescatistas y
veterinarias trabajando juntos en una sola plataforma.

QUÉ PUEDES HACER:
• Reportar mascotas perdidas o encontradas con foto, ubicación y señas.
• Recibir alertas push cuando se reporte una mascota cerca de ti.
• Reportar avistamientos de mascotas que viste en la calle.
• Crear vistas con filtros guardados para ver solo lo que te importa.
• Hablar directamente sobre cada caso (hilos por caso, sin spam).
• Conversar en la comunidad global con cuentas verificadas.
• Acceso al directorio de veterinarias y rescatistas aliados.

CONSTRUIDA PARA MÉXICO:
• Datos de ciudades, estados y colonias mexicanas.
• Idioma 100% español neutro.
• Operada desde la CDMX por gente que rescata todos los días.

PRIVACIDAD ANTES QUE NADA:
• No vendemos tus datos. Punto.
• Tu ubicación se usa solo para mostrarte casos cerca y, opcionalmente,
  para alertarte. Puedes apagarla en cualquier momento.
• Tu cuenta se puede borrar permanentemente desde Ajustes.
• Moderación automática para evitar abuso, fraude y datos personales en
  publicaciones.

SOBRE LAS DONACIONES:
La app es 100% gratuita. Si quieres apoyar el proyecto, hay un enlace al
sitio web oficial donde se procesan donaciones voluntarias. Las donaciones
NO desbloquean ni amplían ninguna función del app. Todas las funciones
están disponibles para todos los usuarios, sin excepción. VuelveaCasa no es
donataria autorizada por SAT — las donaciones no son deducibles de
impuestos.

¿DUDAS? Escríbenos a hola@vuelvecasa.com
```

#### Keywords (100 chars con coma como separador)
```
mascota,perdida,perro,gato,rescate,veterinaria,adopción,México,CDMX,encontrar
```

#### Support URL
```
https://www.vuelvecasa.com/contacto
```

#### Marketing URL
```
https://www.vuelvecasa.com
```

### 5.7 Screenshots

Mínimo **3** screenshots en estos tamaños:
- **iPhone 6.9"** (15 Pro Max / 16 Pro Max) — 1290 × 2796 px
- **iPhone 6.5"** (14 Plus, 13 Pro Max) — 1242 × 2688 px o 1284 × 2778 px
- **iPad 12.9"** (si vas a soportar iPad — `supportsTablet: true` en app.config.ts) — 2048 × 2732 px

Pantallas a capturar (en este orden):
1. **Hero del feed** (Inicio) — tu pantalla más vendedora.
2. **Mapa con pines de casos cercanos** (si lo tienes activo).
3. **Detalle de un caso** con foto + datos.
4. **Crear reporte** (Reportar tab).
5. **Alertas configuradas**.
6. (opcional) **Comunidad / Vistas** o **Perfil**.

⚠️ **NO** captures la pantalla de Donar. Si Apple ve un screenshot promoviendo donación, levanta la lupa y te complica el review.

Cómo capturar:
```bash
# Abre Simulator iPhone 16 Pro Max
xcrun simctl boot "iPhone 16 Pro Max"
open -a Simulator

# Corre tu app en EAS dev build o producción
# Toma screenshot: ⌘ + S (lo guarda en Desktop)
```

### 5.8 App Review Information

Esta es la sección que más subestima la gente y la que más rechazos genera.

#### Sign-in info (CRÍTICO)
Crea una cuenta de prueba en producción:
```
Email: review-apple@vuelvecasa.com
Password: [genera una de 16 chars]
```
Ponla en ASC → App Review Information → Sign-in info.

Sin esto el reviewer no puede entrar y rechaza por "Information Needed".

#### Notes (copia este texto en inglés)
```
VuelveaCasa is a free Mexican community platform for reporting lost and
found pets. The app does NOT process any payments in-app and does NOT
unlock features through donations.

DONATIONS:
The app shows an informational screen ("Donar") that explains how the
project operates. There is a single button labeled "Apoyar en el sitio
web" that uses Linking.openURL to open Safari with the URL
https://www.vuelvecasa.com/donar — the entire payment flow happens on the
external website outside the app. No in-app purchase, no
SafariViewController, no WebView. Donations are 100% voluntary and do NOT
unlock or expand any feature of the app — all features are free for all
users.

VuelveaCasa is NOT a tax-verified non-profit organization in Mexico. We do
not issue tax-deductible receipts. We are not seeking Apple Nonprofit
verification because we operate as a regular community platform, not a
charity. All donations processed externally are reported as ordinary
income for the operator and follow Mexican tax law (LISR).

This architecture is by design and permanent. The app will never process
in-app payments for donations.

TEST ACCOUNT (above) — Sign in to see the full app. The "Donar" screen is
visible from the Home tab and Profile tab; verify the link opens Safari
(system browser), not an in-app web view.

Thank you for reviewing!
```

#### Demo video (opcional pero ayuda)
Screen recording de 60-90s mostrando: login → feed → reportar → alertas → comunidad. Súbelo a "App Review Attachment".

### 5.9 Build & Submit

```bash
cd apps/mobile

# 1. Build production (si no tienes uno reciente)
eas build -p ios --profile production

# 2. Espera ~20-30 min. EAS te manda email cuando termina.

# 3. Sube a App Store Connect
eas submit -p ios --latest

# 4. Espera ~10 min. ASC procesa el binario.

# 5. En ASC: ve a Apps → VuelveaCasa → la version 1.0 → "Add Build" → selecciona el que acabas de subir.

# 6. Review todos los campos completados (privacy, screenshots, description, review notes).

# 7. "Submit for Review".
```

### 5.10 Si te rechazan

Códigos típicos en tu situación:

- **3.1.1 (In-App Purchase)** — el reviewer interpretó algo como cobro in-app. Respuesta:
  > "We do not process any in-app payments. Tapping 'Apoyar en el sitio web' uses Linking.openURL which opens Safari (the system browser). The payment flow happens entirely on the external website https://www.vuelvecasa.com/donar. Please verify by tapping the button — Safari opens, not an in-app browser. Donations are 100% voluntary and do NOT unlock any feature. VuelveaCasa is not a tax-verified non-profit; donations are received as ordinary income."
  
  Adjunta un screen recording de: tap → Safari abre → URL barra visible → es vuelvecasa.com.

- **2.1 (Information Needed)** — piden info. Generalmente piden la cuenta de test o el demo. Réspondeles con lo que pidan en tono cordial.

- **5.1.1 (Privacy)** — nutrition labels no coinciden. Revisa §5.5.

- **4.2 (Minimal Functionality)** — la app está vacía. Mete los seed casos del §3.4 antes de resubmit.

- **2.3.10 (Accuracy)** — algo en la descripción no es preciso. Revisa que no menciones features que no tengas.

Resubmit es gratis y suele tardar 24h.

---

## 6. Android — Google Play Console

Google Play **NO** tiene la restricción de non-profit para donaciones externas. Su política (Google Play Payment Policy) permite pagos externos para "physical goods, services, or charitable donations" sin pagar 30%. Más laxo que Apple.

### 6.1 Crear app en Play Console

Play Console → All apps → Create app:
- Name: `VuelveaCasa`
- Default language: Spanish (Mexico)
- App or game: App
- Free or paid: Free
- Acepta declaraciones (developer program policies, US export laws).

### 6.2 Setup inicial

#### Privacy Policy
```
https://www.vuelvecasa.com/privacidad
```

#### Ads
- "Does this app contain ads?" → **No**.

#### App access
- "Login required" → Yes → da credenciales de cuenta de prueba.

#### Content rating questionnaire
Llénalo honestamente. La app debería sacar **PEGI 3 / Teen** (sin contenido violento, sin gambling). Hay user-generated content (chat, descripciones), declara "Users interact" → "Live audio/video communication" = No, "Text chat" = Yes con moderación.

#### Target audience
Edad: **18+** (en realidad la app sirve para todas las edades pero declarar 18+ evita complicaciones de COPPA / consentimiento parental).

#### News app
No.

#### COVID-19 contact tracing
No.

#### Data safety form (equivalente a privacy nutrition labels de Apple)

Mismas categorías que Apple (§5.5). Específicamente:

**Datos recolectados**:
- Personal info → Email address (Required, Account management)
- Personal info → Name (Optional, App functionality)
- Personal info → User IDs (Required, App functionality)
- Location → Approximate location (Optional, App functionality)
- Location → Precise location (Optional, App functionality)
- Photos and videos → Photos (Optional, App functionality)
- App activity → Other user-generated content (Optional, App functionality)
- App info and performance → Crash logs (Optional, Analytics)

**Datos compartidos con terceros**: No.

**Encryption in transit**: Yes (HTTPS).

**User can request deletion**: Yes (in-app from Settings).

### 6.3 Store listing

#### Short description (80 chars)
```
Red comunitaria mexicana para reportar, encontrar y rescatar mascotas perdidas
```

#### Full description (4000 chars)
**Misma que iOS §5.6** — copia y pega.

#### Screenshots
- **Phone**: mínimo 2, ideal 4-8. Tamaño 1080 × 1920 px (vertical) o 1920 × 1080 (horizontal).
- **7" tablet**: opcional.
- **10" tablet**: opcional.

Mismas pantallas que iOS. Puedes reutilizar (re-encuadrar) tomando screenshots del Android emulator:
```bash
adb exec-out screencap -p > screenshot.png
```

#### App icon
512 × 512 PNG con transparency disabled.

#### Feature graphic (banner del store)
1024 × 500 PNG. Diseña uno con el logo + tagline.

### 6.4 Build & Submit

```bash
cd apps/mobile

# 1. Build AAB de producción
eas build -p android --profile production

# 2. Sube al Play Console
eas submit -p android --latest
```

Primer submit: necesitarás "service account credentials" de Google Play Console — sigue las instrucciones del CLI.

### 6.5 Tracks de testing

**Internal testing** primero (audience cerrada, hasta 100 testers):
- Play Console → Testing → Internal testing → Create release.
- Sube el AAB.
- Agrega correos de testers (puede ser tu Gmail personal + 5 amigos).
- Te da link "https://play.google.com/apps/internaltest/...".

Una vez confirmado que funciona en internal:
- **Closed testing** o **Open testing** (beta pública) — opcional.
- **Production** — submit final.

Google review tarda 1-7 días (más rápido que Apple).

### 6.6 Si te rechazan

Razones comunes en Android:
- **Target API level**: debes target API 34+ (Android 14). Verifica en `app.config.ts`. Expo SDK 53 ya lo cumple.
- **Permissions**: `ACCESS_FINE_LOCATION` debe tener justificación clara en la descripción y en Data Safety. Ya está.
- **Data Safety mismatch**: declaras un dato que el código no recolecta (o viceversa). Revisa §6.2.
- **Trademark/IP**: si usas iconos/imágenes de terceros sin licencia. Mapbox y Stripe tienen licencias incluidas en sus SDKs, no problem.

---

## 7. Legal (México)

### 7.1 LFPDPPP — Aviso de privacidad

Tu `/privacidad` ya cumple las 6 secciones obligatorias por LFPDPPP:
1. Identidad del responsable.
2. Datos personales recolectados.
3. Finalidades del tratamiento.
4. Mecanismos para limitar uso.
5. Procedimiento ARCO (Acceso, Rectificación, Cancelación, Oposición).
6. Cambios al aviso.

**Confirma una vez antes de submit**: lee `https://www.vuelvecasa.com/privacidad` y verifica que todo coincide con la realidad operativa.

### 7.2 Cookies banner

LFPDPPP **no** exige cookie banner como GDPR. Pero si tienes usuarios de UE (poco probable, México-first), considera agregarlo. Por ahora **NO blocker**.

### 7.3 ARCO

Tu privacy policy dice "Puedes ejercerlos desde el correo registrado a hola@vuelvecasa.com — respondemos en máximo 20 días hábiles." Eso es suficiente.

**Asegúrate** de tener un proceso interno: cuando llegue un email ARCO, responde en máximo 20 días y aplica la acción (borrar, rectificar, etc).

### 7.4 Términos & Condiciones

`/terminos` ya lo tiene cubierto. Revisado y limpiado el lenguaje "pre-donataria" → "no es donataria autorizada".

### 7.5 Donaciones — implicaciones fiscales

⚠️ **Tú eres responsable** ante SAT, no yo ni Stripe.

- Si recibes donaciones como **persona física**: declara como "Otros ingresos" en tu declaración anual. ISR aplica con la tarifa progresiva.
- Si las recibes como **persona moral** (S.A. de C.V., S.A.S., A.C. sin autorización SAT): igual, ingreso ordinario sujeto a ISR del 30%.
- Si quieres que las donaciones sean deducibles para los donantes algún día, tendrías que constituirte como **A.C. donataria autorizada** (proceso de 1-3 años con SAT). Decidiste no.
- Stripe te genera reportes mensuales en formato CSV — descárgalos y guárdalos como respaldo de tus declaraciones.

**Recomendación**: contrata 1 hora con un contador para que te confirme cómo declarar las donaciones según tu régimen fiscal actual. ~$500-1000 MXN bien invertidos.

---

## 8. Customer support

### 8.1 hola@vuelvecasa.com

Asegura que `hola@vuelvecasa.com` recibe correo (§2.2 DNS).

**Mientras tanto**: la variable `CONTACT_INBOX=canaya917@gmail.com` ya está. Los formularios de `/contacto` y reportes ARCO llegan a tu Gmail personal.

### 8.2 Auto-responder

En Resend o tu proveedor de inbox, configura auto-responder:
```
Asunto: Recibimos tu mensaje · VuelveaCasa

Hola,

Gracias por escribirnos. Recibimos tu mensaje y respondemos
en máximo 48 horas hábiles.

Si es urgente sobre una mascota perdida o encontrada, también
puedes publicar el caso directamente en la app o en
https://www.vuelvecasa.com.

— Equipo VuelveaCasa
```

### 8.3 App Store reviews

Configura **App Store Connect** → **Notifications** para que te llegue email de cada review nuevo. Responde en español, sé amable, agradece el feedback. Las reviews positivas cuentan para el ranking; las malas, si las contestas bien, mejoran retención.

### 8.4 Bug reports

En tu mailbox marca filtros para "[bug]" o "[problema]" en subject y atiéndelos primero.

---

## 9. Analytics & growth

### 9.1 Google Analytics 4 (gratis, recomendado)

```bash
# Install
npm i @next/third-parties
```

```tsx
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

// dentro del <body>
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

GA4 te da: usuarios, sesiones, conversiones (donar como conversion event). Free tier es suficiente.

### 9.2 Vercel Analytics

Ya mencionado en §2.7. Activa con un click.

### 9.3 Meta Pixel (si vas a hacer Facebook Ads)

Ya tienes el componente `MetaPixel.tsx`. Pon `NEXT_PUBLIC_META_PIXEL_ID` en Vercel env si decides correr ads.

---

## 10. Soft launch — los primeros 7 días

### 10.1 Pre-launch (día -1)

- [ ] Casos seed cargados (8-15) (§3.4).
- [ ] Cuenta de prueba `review-apple@vuelvecasa.com` creada.
- [ ] Smoke test en producción:
  - [ ] Crear cuenta nueva (web) → llega email de verificación → entrar.
  - [ ] Reportar un caso con foto.
  - [ ] Activar alerta.
  - [ ] Donar (web) — usar tarjeta de test Stripe `4242 4242 4242 4242`.
  - [ ] Recibir push notification.
  - [ ] Borrar cuenta.
- [ ] Backup manual de la DB (`pg_dump`).

### 10.2 Lanzamiento

- [ ] Submit a App Store (puede tardar 1-7 días en pasar review).
- [ ] Submit a Play Store (puede tardar 1-7 días).
- [ ] Web ya está en producción desde antes — ya está live.
- [ ] **No hagas marketing público todavía**. Espera a que iOS y Android estén aprobados.

### 10.3 Closed beta (días 1-7)

Con la app aprobada en TestFlight (iOS) e Internal Testing (Android):
- Invita 20-50 amigos/conocidos a probar.
- Pídeles que: (1) creen cuenta, (2) reporten un caso ficticio, (3) reporten cualquier bug.
- Monitorea Sentry y los logs de Vercel.
- Itera bugs durante esa semana.

### 10.4 Public launch

Cuando estés conforme:
- Promueve en redes (Instagram, TikTok, WhatsApp).
- Aliados (rescatistas locales, veterinarias) — pídeles que compartan.
- Considera pequeño budget de Meta Ads geo-targeted CDMX/GDL/MTY ($500-1000 MXN/semana inicialmente).

### 10.5 Monitoreo post-launch (primeras 48h)

- [ ] Sentry — revisa cada hora los primeros 4 ciclos.
- [ ] Vercel logs — busca errores 5xx.
- [ ] Stripe Dashboard — verifica que cada donación llegó a la DB.
- [ ] App Store reviews — responde el mismo día.
- [ ] Push notifications — manda 1 broadcast suave de bienvenida (opcional pero ayuda retention).

---

## 11. Checklist final consolidado

### Web
- [ ] Env vars en Vercel completas (§2.1).
- [ ] DNS apuntando bien (§2.2).
- [ ] Dominio en Resend verificado (§2.3).
- [ ] Stripe live mode + webhook (§2.4).
- [ ] Clerk webhook (§2.5).
- [ ] Smoke test endpoints OK (§2.6).
- [ ] Sentry/Vercel Analytics ON (§2.7).

### DB
- [ ] Migrations aplicadas (§3.1).
- [ ] Seed data cargado (§3.4).
- [ ] Backup manual antes de launch (§10.1).

### Push
- [ ] iOS APNs key en EAS (§4.1).
- [ ] Android FCM en EAS (§4.2).
- [ ] Test push enviado y recibido (§4.3).

### iOS
- [ ] App creada en ASC (§5.1).
- [ ] Privacy nutrition labels llenados (§5.5).
- [ ] Description + keywords (§5.6).
- [ ] Screenshots subidos (§5.7).
- [ ] Test account + Review Notes (§5.8).
- [ ] Build production y submit (§5.9).

### Android
- [ ] App creada en Play Console (§6.1).
- [ ] Data safety form llenado (§6.2).
- [ ] Store listing + screenshots (§6.3).
- [ ] Build AAB y submit (§6.4).
- [ ] Internal testing aprobado (§6.5).

### Legal
- [ ] Privacy y Terms revisados que reflejen la realidad (§7.1, §7.4).
- [ ] Plan fiscal con contador (§7.5) — opcional pero recomendado.

### Soporte
- [ ] hola@vuelvecasa.com recibe (o `CONTACT_INBOX` puesto) (§8.1).
- [ ] Auto-responder configurado (§8.2).

### Soft launch
- [ ] Pre-launch checklist (§10.1).
- [ ] Closed beta con 20-50 testers (§10.3).
- [ ] Public launch coordinado (§10.4).
- [ ] Monitoreo post-launch primeras 48h (§10.5).

---

## 12. Cosas que NO controlamos pero pueden quemarte

Honestidad post-launch:

1. **Apple review subjetivo**: pueden rechazar por cualquier cosa. La nota de §5.8 minimiza el riesgo del payment angle, pero pueden caer por otra cosa. Resubmit es gratis.

2. **Comportamiento de moderación OpenAI**: la API a veces falla con `429 rate limited`. El código degrada a reglas locales, pero si OpenAI tira el día del review, la moderación pierde calidad y un mensaje feo puede pasar. Considera tener un par de "buenos" mensajes seed en el chat para que el reviewer no caiga en uno raro.

3. **Stripe live mode rechazos**: las primeras 50 donaciones pueden ser rechazadas por fraud rules de Stripe (especialmente OXXO). Habilita Radar en Stripe Dashboard si pasa.

4. **Colapso de DB Supabase free tier**: 500 MB de DB y 2 GB de bandwidth. Con 1000 usuarios + 200 casos + chat te dura. Con 10K+ → upgrade a Pro ($25/mes).

5. **Tu carga personal de soporte**: las primeras 2 semanas vas a recibir 5-20 mensajes/día de usuarios. Reserva tiempo. Si te abruma: pide a 1 amigo que te ayude a triar el inbox.

---

## 13. Después del launch — roadmap mental

No es parte del checklist, pero útil:

- **Mes 1**: monitoreo + iteración rápida de bugs.
- **Mes 2**: primeras features de comunidad (gamification de casos cerrados, badges).
- **Mes 3**: ¿pasar a A.C. o S.A.S. con RFC dedicado?
- **Mes 6**: si el proyecto crece, decidir si vale la pena tramitar donataria autorizada SAT (1-3 años de proceso, te da deducibilidad pero cambia tu régimen fiscal).

---

**Fin del checklist.**

Si algo no te queda claro o algún paso te traba, abre el repo y márcame el archivo/línea exacta — refinamos el doc.
