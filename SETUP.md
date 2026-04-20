# SETUP · Todo lo que te toca a ti

Este documento es la **checklist operativa** para poner VuelveaCasa en el aire. El código ya está listo; esto es solo cuentas, credenciales, DNS y un par de copys.

Lo que te toca se agrupa en 10 bloques. Avanza en orden; cada bloque indica qué env vars rellenar en `.env.local` (dev) y en Vercel (prod).

---

## 0) Pre-requisitos locales

```bash
# Node 20+
node -v

npm install
cp .env.example .env.local
npm run dev   # http://localhost:3000
```

El sitio funciona sin ninguna env var: formularios loggean en consola, donaciones muestran "estamos activando". Conforme llenes servicios, todo se activa automáticamente.

---

## 1) Dominio

**Qué hacer**

1. Compra `vuelveacasa.mx` (o el que uses) en Namecheap / Cloudflare / Google Domains.
2. Decide el canonical: recomendado **sin `www`** (`https://vuelveacasa.mx`), con redirect 301 de `www` al apex.

**Dónde se configura después**

- `NEXT_PUBLIC_SITE_URL=https://vuelveacasa.mx`
- Vercel: Settings → Domains → añade `vuelveacasa.mx` y `www.vuelveacasa.mx`, marca el apex como primary.

---

## 2) Hosting · Vercel

**Qué hacer**

1. Crea cuenta gratis en https://vercel.com.
2. Importa este repo.
3. En **Settings → Environment Variables** copia las de `.env.example` (las que ya tengas).
4. Conecta el dominio (paso 1).
5. Habilita **Deployment Protection = off** para producción.
6. Habilita **Web Analytics** (gratis) si quieres métricas de tráfico core web vitals. Opcional.

**Resultado**: cada push a `main` despliega a prod; cada PR genera preview URL.

---

## 3) Pagos · Stripe

Sin Stripe configurado el widget muestra un mensaje suave ("estamos activando"). Con Stripe quedan donaciones reales.

**Qué hacer**

1. Crea cuenta en https://dashboard.stripe.com/register (modo prueba primero).
2. Activa cuenta con datos fiscales mexicanos (RFC, cuenta bancaria MXN).
3. Obtén:
   - **Secret key** → `STRIPE_SECRET_KEY` (empieza con `sk_live_...` o `sk_test_...`)
4. Instala el SDK una sola vez en el proyecto:
   ```bash
   npm i stripe
   ```
5. Crea el **webhook**:
   - Dashboard → Developers → Webhooks → *Add endpoint*
   - URL: `https://vuelveacasa.mx/api/donar/webhook`
   - Eventos: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
   - Copia el **Signing secret** → `STRIPE_WEBHOOK_SECRET` (`whsec_...`)
6. *(Opcional)* Si quieres tiers mensuales fijos, crea Products/Prices en Stripe con `recurring=monthly` y copia sus IDs:
   - `STRIPE_PRICE_MONTHLY_FONDO`
   - `STRIPE_PRICE_MONTHLY_EMERGENCIA`
   - `STRIPE_PRICE_MONTHLY_RESCATE`
   Si los dejas vacíos, el widget crea un price recurring ad-hoc con el monto elegido.

**Validar**

- Modo test: usa la tarjeta `4242 4242 4242 4242`, fecha futura, CVC `123`.
- Checa que `/donar/gracias` carga al volver.
- Checa en Stripe que llegó el evento al webhook (status `200`).

---

## 4) Email transaccional · Resend

Sin Resend los emails se loggean. Con Resend llegan de verdad.

**Qué hacer**

1. Crea cuenta en https://resend.com.
2. Domains → **Add domain** → `vuelveacasa.mx`.
3. Resend te dará registros DNS (SPF, DKIM, opcionalmente DMARC). Añádelos en tu registrador de dominio.
4. Espera verificación (minutos).
5. API Keys → **Create API Key** → copia `re_...` → `RESEND_API_KEY`.
6. Configura el `from`:
   - `EMAIL_FROM=VuelveaCasa <hola@vuelveacasa.mx>`

**Alternativas si no quieres Resend**: el wrapper `src/lib/email.ts` es una llamada `fetch` única; lo cambias a Postmark, SES o SendGrid modificando esa función.

---

## 5) Base de datos (cuando haya tráfico real)

En fase 1 no hace falta. Cuando quieras persistir waitlist, contactos, aliados y donaciones:

**Opción recomendada · Supabase (Postgres gestionado, free tier)**

1. Crea proyecto en https://supabase.com.
2. SQL editor → pega el esquema de `src/lib/db.ts` (arriba de `export const db = ...`).
3. Settings → Database → copia **Connection string (URI)** → `DATABASE_URL`.
4. Instala el cliente:
   ```bash
   npm i postgres
   ```
5. Reemplaza la implementación stub de `src/lib/db.ts` por consultas reales. Los tipos ya están validados por `src/lib/validations.ts`.

**Alternativas**: Neon (similar, sin sleep), Vercel Postgres (integrado).

---

## 6) Cuentas sociales y marca

Reserva los handles **hoy** aunque no publiques todavía:

| Red | Handle sugerido |
|---|---|
| Instagram | `@vuelveacasa.mx` |
| TikTok | `@vuelveacasa.mx` |
| Facebook Page | `vuelveacasa.mx` |
| X / Twitter | `@vuelveacasa_mx` |
| YouTube | `@vuelveacasa` |
| LinkedIn | company page `vuelveacasa` |

Los links ya están en `src/lib/site.ts` (`SITE.social`). Si algún handle queda diferente, **solo cambia esa constante** y se actualiza en footer, JSON-LD y metadata.

---

## 7) Correos de dominio

Ten al menos estos buzones activos (puedes apuntarlos a uno solo):

- `hola@vuelveacasa.mx` — contacto general (ya está en `SITE.contact.email`)
- `ayuda@vuelveacasa.mx` — soporte
- `prensa@vuelveacasa.mx`
- `no-reply@vuelveacasa.mx` — from de Resend

**Opciones baratas**: Google Workspace (MXN ~130/mes), Zoho Mail Free (5 usuarios, sí gratis, con tu propio dominio), Fastmail.

---

## 8) SEO · Search Console + Bing + indexación

**Google Search Console**

1. https://search.google.com/search-console → Add property → `https://vuelveacasa.mx`.
2. Verifica por DNS TXT (recomendado) o meta tag.
   - Si usas meta tag: añade el valor a `GOOGLE_SITE_VERIFICATION` y yo ya puse el hook — ver paso 8.1.
3. Sitemap → submit → `https://vuelveacasa.mx/sitemap.xml`.
4. URL Inspection → solicita indexar `/`, `/como-funciona`, `/donar`, `/mascota-perdida`, `/mascota-encontrada`.

**Bing Webmaster Tools**

1. https://www.bing.com/webmasters → Import from Google Search Console (1 clic).
2. Submit sitemap igual.

**8.1 Activar meta tags de verificación (si las usas)**

Si prefieres verificación por meta tag en lugar de DNS, añádelas al `metadata` del `layout.tsx`:

```tsx
// src/app/layout.tsx (dentro de export const metadata)
verification: {
  google: process.env.GOOGLE_SITE_VERIFICATION,
  other: {
    "facebook-domain-verification": process.env.META_DOMAIN_VERIFICATION,
  },
},
```

(Solo si las variables existen en `.env`, si no no hace nada.)

---

## 9) Analytics · GA4 (opcional)

Sin `NEXT_PUBLIC_GA_ID` el componente no carga nada. Para activar:

1. https://analytics.google.com → crea cuenta + property (GA4).
2. Admin → Data Streams → Web → copia **Measurement ID** (`G-XXXXXXXXXX`).
3. Env: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`.
4. Redeploy Vercel.

**Alternativa**: si ya activaste Vercel Web Analytics (paso 2.6) no necesitas GA.

---

## 10) Meta / TikTok Ads (para tráfico pagado)

Para que las landings `/campanas/tiktok` (y futuras de Meta) reporten conversiones:

1. **TikTok Pixel**
   - TikTok Ads Manager → Assets → Events → Web → crea pixel.
   - Copia el script del pixel → añádelo en `src/app/campanas/tiktok/page.tsx` dentro de un `<Script strategy="afterInteractive">` (así solo carga en esa landing, no en todo el site).
2. **Meta Pixel** (cuando quieras Facebook/Instagram Ads)
   - Events Manager → Data sources → Web → crea pixel.
   - Añade al layout o a una landing específica.
3. **Verificación de dominio Meta**
   - Business Settings → Brand Safety → Domains → verifica con DNS TXT o con `META_DOMAIN_VERIFICATION` vía meta tag (ver 8.1).

---

## 11) Legal · ajustes finales de copy

Abre estos archivos y ajusta lo que no aplique:

- `src/lib/site.ts` → `SITE.legal.razonSocial`, teléfonos, redes.
- `src/app/privacidad/page.tsx` → nombre de responsable, domicilio, canal para derechos ARCO.
- `src/app/terminos/page.tsx` → razón social y jurisdicción.

Cuando tengas constitución legal (AC, SAS, etc.) y, si aplica, autorización como **donataria autorizada SAT** para emitir recibos deducibles, añade:

- Nombre fiscal
- RFC
- Leyenda fiscal en `/donar`
- Nota: "Las donaciones son deducibles conforme al artículo 31 LISR" (solo si eres donataria autorizada).

---

## 12) Variables de entorno — tabla maestra

| Var | Dónde | Requerido | Qué se rompe si falta |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | App + metadata | **Sí** en prod | URLs OG/canonical usan default `https://vuelveacasa.mx` |
| `STRIPE_SECRET_KEY` | Stripe | No | Widget muestra "estamos activando" (UX intacta) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | No | Webhook ignora eventos (responde 200) |
| `STRIPE_PRICE_MONTHLY_*` | Stripe | No | Se crea price ad-hoc |
| `RESEND_API_KEY` | Email | No | Emails se loggean pero no salen |
| `EMAIL_FROM` | Email | No | Usa `no-reply@<host>` autogenerado |
| `DATABASE_URL` | DB | No | Inserts se loggean (console) |
| `NEXT_PUBLIC_GA_ID` | Analytics | No | No se carga GA |
| `GOOGLE_SITE_VERIFICATION` | SEO | No | Verifica por DNS |
| `META_DOMAIN_VERIFICATION` | SEO | No | Verifica por DNS |

---

## 13) Checklist antes del go-live

- [ ] Dominio comprado y conectado a Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` con dominio real
- [ ] Cuentas sociales reservadas y actualizadas en `SITE.social`
- [ ] Emails de dominio creados (al menos `hola@`)
- [ ] Resend configurado, DNS verificado, `RESEND_API_KEY` en Vercel
- [ ] Stripe live keys + webhook creado, probado con tarjeta test
- [ ] Google Search Console verificado + sitemap enviado
- [ ] GA4 o Vercel Analytics activo
- [ ] Pixel de TikTok insertado en `/campanas/tiktok`
- [ ] `privacidad` y `terminos` revisados por alguien con criterio legal
- [ ] `npm run build` corre sin errores (`npm run lint` sin errores)
- [ ] Revisa desde móvil: hero, donaciones, formularios
- [ ] Prueba end-to-end: reporte dummy, waitlist, contacto, donación test

---

## 14) Post-lanzamiento · primeros 30 días

**Semana 1**
- Revisa Search Console a diario los primeros días por errores de crawl.
- Monitorea tasas de conversión de waitlist y fricción móvil.
- Haz pruebas reales con 3-5 personas de cada audiencia (dueño, rescatista, vet).

**Semana 2-4**
- Publica 2-3 piezas de contenido ancladas a los hubs SEO (blog es opcional aquí, pero si quieres lo añado).
- Empieza con campañas en TikTok/Meta hacia `/campanas/tiktok`.
- Empieza a firmar los primeros 5 aliados (rescatistas) y 3 veterinarias para tener un directorio "real" antes de escalar ads.

---

## 15) Evolución a app operativa (fase 2)

Cuando haya demanda validada:

- **Auth** → `clerk` o `next-auth` (google + whatsapp OTP).
- **Casos** → nuevo segmento `/casos/[id]` con ISR.
- **Panel operativo** → `/panel/*` detrás de auth.
- **Subida de fotos** → Vercel Blob o UploadThing.
- **Alertas push** → email via Resend + WhatsApp via Twilio.
- **Maps** → Mapbox o Google Maps JS API para radios por zona.

Nada de esto obliga a rehacer este marketing site.

---

¿Dudas específicas? Escríbelas en `hola@vuelveacasa.mx` (o pega en este repo como issue).
