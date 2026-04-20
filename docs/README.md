# Guías operativas — VuelveaCasa

Este directorio contiene **las guías paso a paso** de todo lo externo al código que necesitas hacer para poner VuelveaCasa en producción. El código ya está hecho; esto es cuentas, credenciales, DNS y ajustes de copy.

Lo que sigue está ordenado por prioridad real. Puedes omitir los marcados como **opcional** en fase 1.

---

## Orden recomendado

| # | Documento | Tiempo | Requerido en fase 1 | Bloquea |
|---|---|---|---|---|
| 01 | `../SETUP.md` — overview + dominio + Vercel | 30 min | **Sí** | Todo lo demás |
| 02 | `02-stripe.md` — cuenta Stripe + webhook | 1–2 h + 1–5 días revisión | **Sí** para cobrar | Donaciones reales |
| 03 | `03-resend.md` — email transaccional | 30 min + DNS | **Sí** | Confirmaciones de waitlist y contacto |
| 04 | `04-supabase.md` — base de datos | 45 min | Opcional (stub loggea) | Persistencia real |
| 05 | `05-social.md` — handles IG/TikTok/FB/X | 2 h | **Sí** (reserva) | Estrategia de marca y ads |
| 06 | `06-correos.md` — buzones `@vuelveacasa.mx` | 45 min + DNS | **Sí** | Operación del equipo |
| 07 | `07-seo.md` — Search Console + Bing | 30 min | **Sí** | Indexación y tráfico orgánico |
| 08 | `08-analytics.md` — GA4 / Vercel Analytics | 20 min | **Sí** | Métricas de lanzamiento |
| 09 | `09-tiktok.md` — TikTok y Meta Pixels | 40 min | Opcional (solo si corres ads) | Optimización de campañas |
| 10 | `10-legal.md` — privacidad, términos, razón social | 1–2 h + revisión externa | **Sí** parcial | Cobros y cumplimiento |
| 11 | `11-auth.md` — Clerk (Fase 2) | 30 min | Solo Fase 2 | Cuentas reales y panel |
| 12 | `12-casos.md` — Casos con fotos, mapa y avistamientos (Sprint 2.1) | 30 min | Solo Fase 2 | Producto operativo |

---

## Ruta rápida de 1 día (mínimo viable para lanzar)

Si puedes dedicar **~8 horas**, este es el camino más corto para ir al aire con todo lo esencial:

1. **Mañana** (4 h)
   - SETUP → dominio + Vercel deploy + dominio conectado.
   - Doc 06 → Cloudflare Email Routing (lo más rápido para recibir).
   - Doc 03 → Resend DNS (esperas mientras avanzas).
   - Doc 05 → reservar los 4 handles sociales.
2. **Tarde** (4 h)
   - Doc 02 → Stripe en modo test (activación bancaria sigue en paralelo, puede tardar días).
   - Doc 10 → ajustar 3 textos legales (nombre, domicilio, fecha).
   - Doc 07 → GSC + sitemap.
   - Doc 08 → GA4 property + pegar `G-`.

Con esto el sitio está **público, indexable, con emails reales llegando y donaciones en test**. El cobro real se habilita solo con flipeo de keys cuando Stripe apruebe.

---

## Tabla maestra de env vars

Todas viven en `.env.local` (dev) y en Vercel → Settings → Environment Variables (Production + Preview).

| Variable | Doc | Sin ella, ¿qué pasa? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | SETUP | OG/canonical usan default |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | 11 | Fase 1 puro, `/panel` redirige |
| `CLERK_SECRET_KEY` | 11 | Fase 1 puro |
| `CLERK_WEBHOOK_SECRET` | 11 | Usuarios no se sincronizan a DB |
| `SUPABASE_URL` | 12 | Upload de fotos deshabilitado |
| `SUPABASE_SERVICE_ROLE` | 12 | Upload de fotos deshabilitado |
| `STRIPE_SECRET_KEY` | 02 | Donaciones muestran "estamos activando" |
| `STRIPE_WEBHOOK_SECRET` | 02 | Webhook ignora eventos (200 OK) |
| `STRIPE_PRICE_MONTHLY_*` | 02 | Crea price ad-hoc |
| `RESEND_API_KEY` | 03 | Emails se loggean pero no salen |
| `EMAIL_FROM` | 03 | Usa `no-reply@<host>` autogenerado |
| `DATABASE_URL` | 04 | Inserts se loggean (console) |
| `NEXT_PUBLIC_GA_ID` | 08 | No carga GA |
| `GOOGLE_SITE_VERIFICATION` | 07 | Verifica por DNS en su lugar |
| `BING_SITE_VERIFICATION` | 07 | Verifica por DNS |
| `META_DOMAIN_VERIFICATION` | 09 | Verifica por DNS |
| `TIKTOK_DEVELOPERS_VERIFICATION` | 09 | — |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | 09 | Pixel TikTok no carga en `/campanas/*` |
| `NEXT_PUBLIC_META_PIXEL_ID` | 09 | Pixel Meta no carga en `/campanas/*` |

---

## Archivos del código que seguramente tocarás

- `src/lib/site.ts` — marca, ciudades, contactos, **razón social**, redes sociales.
- `src/lib/db.ts` — reemplazar stub por queries reales a Supabase (ver doc 04).
- `src/app/privacidad/page.tsx` — ver doc 10.
- `src/app/terminos/page.tsx` — ver doc 10.
- `src/app/donar/page.tsx` — disclaimer "no deducible" (ver doc 10.5).

---

## Preguntas frecuentes

**¿Puedo lanzar sin DB (Supabase)?**
Sí. Los submissions se loggean y emails se envían (con Resend configurado). Supabase lo conectas cuando veas flujo real que valga la pena persistir.

**¿Puedo correr ads sin Stripe activado?**
Sí, apuntando a `/registro` o `/campanas/tiktok` para waitlist. Es recomendable para validar conversión antes de pedir donación.

**¿Cuánto cuesta mantener todo corriendo?**
Con el mix recomendado (Vercel free + Cloudflare Email Routing + Resend free + Supabase free + GA4 free + dominio ~$250/año) → **~$20–50 MXN/mes** en año 1. El único gasto fijo real: el dominio.

**¿Qué es lo más fácil de romper?**
DNS. Siempre revisa después de cada cambio:
- Mail: <https://www.mail-tester.com/> (te da score de SPF/DKIM).
- SEO: GSC → URL Inspection.
- Site: simplemente carga `vuelveacasa.mx` en incógnito.

---

## Soporte

Cuando tengas dudas específicas, pega el error o screenshot en un nuevo issue del repo (o mándame mensaje). Los puntos donde históricamente la gente se atora:

1. DNS TXT con comillas o saltos de línea (borra espacios y pega plano).
2. SPF múltiple (un solo TXT con todos los `include:`).
3. Vercel env vars solo en Production, olvidadas en Preview → preview no funciona.
4. Stripe Live key en `.env.local` accidentalmente → commitearla al repo. **Nunca**.
5. Webhook de Stripe sin el `NEXT_PUBLIC_SITE_URL` → URLs rotas en success/cancel.
