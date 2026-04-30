# 🚀 Launch Checklist — VuelveaCasa

**Status:** WEB EN PRODUCCIÓN ✅ — solo quedan submits mobile (ASC + Play).
**Last code refresh:** 2026-04-29
**Smoke test 2026-04-29:** 17/17 verde (DB, Stripe live, Push, Email, Auth, Donar checkout, todas las páginas y SEO).

Esta es la lista accionable para tachar conforme avanzas. El detalle largo
está en `PRODUCTION_LAUNCH.md`. Las decisiones copy-paste están en
`docs/STORE_SUBMISSION.md`.

---

## ✅ Hecho automáticamente (código + assets generados)

Los archivos ya están en el repo. No tienes que tocarlos.

- [x] **Seed SQL 12 casos demo** — `db/seed/demo_casos.sql`
- [x] **VAPID keys generadas** — guardadas en este checklist (§Web envs)
- [x] **Smoke test script** — `scripts/smoke-prod.sh`
- [x] **Sentry instrumentation** — `instrumentation.ts`, `instrumentation-client.ts`,
      `sentry.server.config.ts`, `sentry.edge.config.ts`,
      `src/app/global-error.tsx`, `next.config.ts` wrapped
- [x] **Vercel Analytics** — ya en `src/app/layout.tsx`
- [x] **GA4** — ya en `src/components/Analytics.tsx`, gateado por `NEXT_PUBLIC_GA_ID`
- [x] **Auto-responder HTML** — `docs/auto-responder.html`
- [x] **Review Notes inglés** — `docs/STORE_SUBMISSION.md` §5.2
- [x] **Privacy nutrition labels chuleta** — `docs/STORE_SUBMISSION.md` §3.2
- [x] **Description / keywords / promo iOS+Android** — `docs/STORE_SUBMISSION.md` §4 y §7
- [x] **`/api/health`** — endpoint completo con info de servicios
- [x] **Cuenta review-apple** — credenciales en `db/seed/review_account.sql`
      y `docs/STORE_SUBMISSION.md`
- [x] **Bundle iOS verificado** — sin strings prohibidos
      (`subscription`, `premium tier`, `$X/mes`, `WebBrowser` en flow donar)
- [x] **Backup script** — `scripts/backup-db.sh`

---

## 📋 Para que TÚ ejecutes — paso a paso

### Web (Vercel) — §2 de PRODUCTION_LAUNCH.md

#### Env vars (CRÍTICO antes del primer deploy en live)

Vercel → Settings → Environment Variables (Production):

```bash
# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...           # ← obtener en §B5

# DB
DATABASE_URL=postgres://postgres.xxx:[pwd]@aws-...:6543/postgres   # POOLER (6543)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...          # ← obtener en §B4
NEXT_PUBLIC_SITE_URL=https://www.vuelvecasa.com

# Email
RESEND_API_KEY=re_...
CONTACT_INBOX=canaya917@gmail.com

# Push (VAPID — los valores activos viven en .env.local; ya están desplegados)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<copia desde .env.local>
VAPID_PRIVATE_KEY=<copia desde .env.local>
VAPID_PUBLIC_KEY=<copia desde .env.local>
VAPID_SUBJECT=mailto:hola@vuelvecasa.com

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk....

# Moderación
OPENAI_API_KEY=sk-proj-...

# Feature flags
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_DB_ENABLED=true

# Sentry (opcional — si activas Sentry post-launch)
NEXT_PUBLIC_SENTRY_DSN=https://...@...ingest.sentry.io/...
SENTRY_DSN=https://...@...ingest.sentry.io/...
SENTRY_ORG=tu-org
SENTRY_PROJECT=vuelvecasa-web
SENTRY_AUTH_TOKEN=sntrys_...             # solo en build env, NO publicar
```

⚠️ **Las VAPID keys ya están generadas arriba — cópialas directo a Vercel.**

- [ ] Pegar todas las env vars en Vercel.
- [ ] Trigger redeploy: `git commit --allow-empty -m "trigger: env live" && git push`.

#### DNS

- [ ] **MX records** para `hola@vuelvecasa.com` — Cloudflare Email Routing
      (gratis) → forward a `canaya917@gmail.com`.

#### Resend (email)

- [ ] Resend Dashboard → Domains → Add `vuelvecasa.com`.
- [ ] Pegar 4 records DNS (TXT, CNAME DKIM, TXT SPF, TXT DMARC).
- [ ] Verificar — debe aparecer todo verde.

#### Stripe

- [ ] Toggle Test → **Live** en Stripe Dashboard.
- [ ] **Activar cuenta** (RFC, CURP, CLABE) — toma 1-3 días.
- [ ] **API keys** → copiar `sk_live_...` a Vercel.
- [ ] **Webhooks** → endpoint `https://www.vuelvecasa.com/api/donar/webhook`
      con eventos: `checkout.session.completed`, `invoice.paid`,
      `customer.subscription.deleted`, `charge.refunded`,
      `payment_intent.payment_failed`.
- [ ] Copiar `whsec_...` a Vercel.
- [ ] Branding: logo + color `#b8264a`.
- [ ] Customer emails → Successful payments ON.
- [ ] Payment methods: Card, Apple Pay, Google Pay, **OXXO**.

#### Clerk

- [ ] Webhook endpoint `https://www.vuelvecasa.com/api/clerk/webhook`
      con events `user.created`, `user.updated`, `user.deleted`.
- [ ] Copiar signing secret a Vercel.

---

### DB (Supabase) — §3

- [ ] Ejecutar `db/seed/demo_casos.sql` en SQL Editor de Supabase.
      Verifica con `select count(*) from casos;` → 12.
- [ ] **Crear cuenta de prueba** en Clerk Dashboard:
      - Email: `review-apple@vuelvecasa.com`
      - Password: `fWRafvc62$Uh6&sx`
- [ ] Verificar que el webhook user.created creó el row en `usuarios`
      (o correr `db/seed/review_account.sql` reemplazando `clerk_user_id`).
- [ ] Backup pre-launch:
      ```bash
      export DATABASE_URL="postgres://postgres.xxx:pwd@host:5432/postgres"
      ./scripts/backup-db.sh
      ```

---

### Push notifications — §4

#### iOS APNs

```bash
cd apps/mobile
npx eas-cli credentials
# → iOS → production → Push Notifications → Generate APNs key (acepta)
```

- [ ] APNs key generada y guardada en EAS.

#### Android FCM

- [ ] Firebase Console → New project → Add Android app
      `com.vuelvecasa.app`.
- [ ] Descargar `google-services.json` → `apps/mobile/google-services.json`.
- [ ] Subir a EAS:
      ```bash
      cd apps/mobile
      npx eas-cli credentials
      # → Android → production → Google Service Account → wizard
      ```

---

### iOS — App Store Connect (§5 + `docs/STORE_SUBMISSION.md`)

**Pre-requisito:** seed cargado, cuenta review creada, push wired, build EAS reciente.

- [ ] **ASC API Key**: ASC → Users → Integrations → Team Keys → +
      → Admin → descargar `.p8` UNA vez → anotar Key ID + Issuer ID.
- [ ] **Crear app record**: nombre `VuelveaCasa`, bundle `com.vuelvecasa.app`,
      SKU `vuelveacasa-ios-001`, primary language Spanish (Mexico).
- [ ] **App Information** → §1 de STORE_SUBMISSION.
- [ ] **Pricing & Availability** → Free, México only.
- [ ] **Privacy** → §3 (privacy URL + nutrition labels exactos).
- [ ] **Versión 1.0** → §4 (description, keywords, promo, support URL).
- [ ] **Screenshots 6.9"** (mín 3, recomendado 6) — sin pantalla "Donar".
- [ ] **App Review Information** → §5 (cuenta + notes inglés).
- [ ] **Build production** (si el del 23-abr no es reciente):
      ```bash
      cd apps/mobile
      npx eas-cli build -p ios --profile production
      ```
- [ ] **Submit**:
      ```bash
      cd apps/mobile
      npx eas-cli submit -p ios --latest
      ```
- [ ] En ASC → seleccionar el build → "Submit for Review".

---

### Android — Google Play Console (§6 + STORE_SUBMISSION §7-8)

- [ ] **Pagar $25 USD** (one-time) en `play.google.com/console/signup`.
- [ ] **Build AAB**:
      ```bash
      cd apps/mobile
      npx eas-cli build -p android --profile production
      ```
- [ ] **Crear app** en Play Console — name, language, free.
- [ ] **App access** → §7.7 (cuenta de prueba + notes).
- [ ] **Content rating** → §7.9.
- [ ] **Target audience** → 18+.
- [ ] **Data safety** → §7.13.
- [ ] **Store listing** → §7.2-7.3 (descriptions, screenshots).
- [ ] **Feature graphic 1024×500** — diseñar/encargar.
- [ ] **Submit Internal testing**:
      ```bash
      cd apps/mobile
      npx eas-cli submit -p android --latest
      ```
- [ ] Internal testing OK → promote a Production.

---

### Monitoreo (no blocker)

- [ ] **Vercel Analytics** — Project → Analytics → Enable (1 click).
- [ ] **Sentry** — crear proyecto en `sentry.io` → copiar DSN → setear
      `NEXT_PUBLIC_SENTRY_DSN` y `SENTRY_DSN` en Vercel
      (el código YA está integrado y se activa al detectar el DSN).
- [ ] **UptimeRobot** — `https://uptimerobot.com` → Add Monitor → ping
      `https://www.vuelvecasa.com/api/health` cada 5 min.

---

### Soft launch (§10)

#### Pre-launch (T-1 día)

- [ ] Smoke test:
      ```bash
      ./scripts/smoke-prod.sh https://www.vuelvecasa.com
      ```
      Debe pasar todos los checks (PASS, sin FAIL).
- [ ] Manual sanity:
  - [ ] Web: signup → verificar email → entrar.
  - [ ] Web: reportar caso con foto → aparece en feed.
  - [ ] Web: donar con tarjeta `4242 4242 4242 4242` (test mode) →
        webhook llega → row en `donaciones`.
  - [ ] Mobile: login → reportar → recibir push.
  - [ ] Web/mobile: borrar cuenta → confirmar `DELETE /api/v1/me`.
- [ ] Backup pre-launch ejecutado.
- [ ] Auto-responder configurado en Cloudflare/Resend (`docs/auto-responder.html`).

#### Launch

- [ ] iOS submit a App Store Review.
- [ ] Android submit a Play Console Internal → producción cuando esté green.
- [ ] **NO marketing público** hasta tener iOS+Android approved.

#### Closed beta (días 1-7)

- [ ] 20-50 testers (TestFlight + Play Internal).
- [ ] Monitorear Sentry diario.
- [ ] Iterar bugs.

#### Public launch

- [ ] Post Instagram/TikTok/WhatsApp.
- [ ] Email a aliados (rescatistas, veterinarias) en tu lista.
- [ ] Considera $500-1000 MXN/semana de Meta Ads geo-targeted CDMX.

#### Monitoreo 48h post-launch

- [ ] Sentry cada hora primeras 4h.
- [ ] Stripe Dashboard — verificar cada donación llegó.
- [ ] App Store reviews — responder mismo día.

---

### Legal/fiscal

- [ ] 1h con contador para confirmar régimen de declaración de donaciones
      (~$500-1000 MXN). No es blocker pero recomendado antes del primer
      mes-cierre fiscal.

---

## 🔥 Camino más corto a tener app en stores

Si tienes 1 día completo, este es el orden óptimo:

1. **Mañana (2h)**: Vercel envs + DNS + Resend + seed Supabase.
2. **Mediodía (1h)**: Stripe live + webhook + Clerk webhook + smoke test.
3. **Tarde (3h)**: ASC API Key + app record + privacy + screenshots
   (en device físico) + submit iOS.
4. **Noche (1h)**: Play Console + AAB build + submit internal Android.

Resultado: ambos en review esa misma noche. Apple tarda 1-7 días,
Google 1-3. En la espera, completa monitoreo + soft launch.

---

## 📁 Archivos generados en este pre-flight (referencia)

| Archivo | Para qué |
|---|---|
| `db/seed/demo_casos.sql` | 12 casos demo idempotentes |
| `db/seed/review_account.sql` | SQL de respaldo para usuarios row |
| `scripts/smoke-prod.sh` | Smoke test post-deploy |
| `scripts/backup-db.sh` | Backup `pg_dump` parametrizado |
| `docs/auto-responder.html` | Reply automático para `hola@vuelvecasa.com` |
| `docs/STORE_SUBMISSION.md` | Copy-paste para ASC y Play Console |
| `instrumentation.ts` | Sentry server hook |
| `instrumentation-client.ts` | Sentry browser hook |
| `sentry.server.config.ts` | Sentry init Node runtime |
| `sentry.edge.config.ts` | Sentry init Edge runtime |
| `src/app/global-error.tsx` | Root error boundary con Sentry capture |
| `next.config.ts` | Wrapped `withSentryConfig` |
| `LAUNCH_CHECKLIST.md` | (este archivo) |
