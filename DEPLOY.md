# DEPLOY · Vuelvecasa

Esta es **la guía mínima para pasar de "git push" a "sitio funcional con APIs reales"**. Todo el código está feature-flagged: lo que no tenga su env var se comporta como stub (loggea) y el resto del sitio sigue funcionando. Conforme llenes variables, el producto se enciende por capas.

Idioma default: **español de México** (`es-MX`) — ya está en `<html lang>`, metadata, OG, manifest y service worker.

---

## 0. Antes del primer deploy

```bash
npm install
cp .env.example .env.local    # dejar vacío inicialmente si quieres
npm run dev                   # http://localhost:3000
```

Con cero envs, ya tienes:
- Sitio público completo (50+ rutas).
- Formularios que **validan** y loggean (waitlist, contacto, aliados).
- Panel redirige a "/" con `?panel=pronto`.
- Donar muestra "estamos activando".

---

## 1. Conectar Vercel

1. `npm i -g vercel && vercel login`.
2. `vercel --prod` (o conecta el repo desde dashboard.vercel.com).
3. **Settings → Domains** → agrega `vuelvecasa.com` y `www.vuelvecasa.com` (apex primary).
4. **Settings → Environment Variables** → agrega las que vayas activando (siguientes secciones).
5. **Settings → Git** → activa "Automatically expose System Environment Variables" si quieres IPs reales.

Cada `git push origin main` → redeploy automático. Vercel corre `npm run build`.

---

## 2. Orden recomendado de activación

| Etapa | Env vars | Qué se enciende |
|-------|----------|-----------------|
| Publicar dominio | `NEXT_PUBLIC_SITE_URL` | OG/canonical correctos, sitemap válido |
| Emails | `RESEND_API_KEY`, `EMAIL_FROM` | Bienvenida waitlist, notificaciones admin |
| DB | `DATABASE_URL` | Persiste formularios, casos, donaciones, alertas |
| Auth | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Login + panel + creación de casos |
| Clerk webhook | `CLERK_WEBHOOK_SECRET` | Sincroniza users a DB |
| Storage | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE` | Fotos reales de casos |
| Pagos | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Donaciones reales |
| Rate limit | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Serverless-safe rate limit |
| Push | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT` | Notificaciones al navegador |
| Analytics | `NEXT_PUBLIC_GA_ID` | GA4 |
| Verificación SEO | `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`, `META_DOMAIN_VERIFICATION` | Meta tags en head |
| Pixels ads | `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | Solo en `/campanas/*` |

Cada sección detallada vive en `docs/` (01 a 12).

---

## 3. Schema de base de datos (una vez)

Tras configurar `DATABASE_URL`:

1. Abre el SQL editor de Supabase (o psql con la connection string).
2. Pega el contenido de `db/schema.sql`.
3. **Run**. Es idempotente (`create table if not exists`) — se puede correr múltiples veces sin romper.
4. Verifica con `GET /api/health` — debería listar las 13 tablas en `db.tables`.

---

## 4. Generar keys VAPID (Web Push)

Una sola vez:

```bash
npx web-push generate-vapid-keys
```

Obtienes:
- `Public Key: ...` → pégala en **ambas** `NEXT_PUBLIC_VAPID_PUBLIC_KEY` y `VAPID_PUBLIC_KEY`.
- `Private Key: ...` → pégala en `VAPID_PRIVATE_KEY`.
- `VAPID_SUBJECT=mailto:hola@vuelvecasa.com`.

El toggle de push aparece en `/panel/alertas` — cuando el usuario acepta, se guarda en `push_subscriptions`. El envío real de notificaciones queda marcado como TODO en `src/lib/push.ts` (listo para conectar al motor de alertas o vía cron).

---

## 5. Webhooks que hay que configurar en prod

Una vez que el dominio esté vivo:

| Webhook | Proveedor | URL | Eventos |
|---------|-----------|-----|---------|
| Clerk → usuarios | Clerk Dashboard → Webhooks | `https://vuelvecasa.com/api/clerk/webhook` | `user.created`, `user.updated`, `user.deleted` |
| Stripe → donaciones | Stripe Dashboard → Webhooks | `https://vuelvecasa.com/api/donar/webhook` | `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated` |

Cada uno te da un `whsec_...` que pegas en la env var correspondiente.

---

## 6. Verificar que todo está en orden

Tras deploy:

1. `GET https://vuelvecasa.com/api/health` — flags verdes en los servicios activados.
2. `/sitemap.xml` — lista rutas.
3. `/robots.txt` — bloquea /api y /panel.
4. Crear una cuenta en `/crear-cuenta` → aparece en `usuarios` en DB.
5. Publicar un caso de prueba con foto desde `/panel/casos/nuevo` → aparece en `/casos`.
6. Crear alerta → publicar un caso complementario → llega email (y push si activado).
7. Donar con tarjeta de prueba Stripe (`4242 4242 4242 4242`) → aparece en `donaciones` y en `/panel/admin → Exportar CSV`.

---

## 7. Darle rol admin a tu cuenta

Después de crear tu cuenta:

**Opción A · desde Clerk dashboard:**
1. Users → selecciona tu cuenta → **Metadata** → Public metadata.
2. Pega:
   ```json
   { "rol": "admin" }
   ```
3. Save. En el siguiente request ya aparece "Admin" en el panel.

**Opción B · desde SQL (si prefieres):**
```sql
update usuarios set rol = 'admin' where email = 'tu@email.com';
```
Luego ve a `/panel/admin/usuarios` con tu sesión activa y desde ahí puedes cambiar otros.

---

## 8. Rollback express

Si un deploy rompe algo:

1. Vercel → Deployments → selecciona uno previo → **Promote to Production**.
2. Revisar `/api/health` de nuevo.

Todas las operaciones son idempotentes; el schema tolera re-ejecución.

---

## 9. Monitoreo mínimo

- **Vercel Analytics** activado en Project → Analytics (free tier).
- **Logs** → Vercel → Deployments → ver logs en vivo.
- **Stripe Dashboard** → Payments, Events, Webhooks.
- **Supabase** → Reports → Queries (latencia de SQL).
- **Search Console** → URLs indexadas cada semana.

---

## 10. Checklist final (antes de anunciar)

- [ ] `/api/health` muestra todos los flags esperados activos.
- [ ] 3 casos de prueba publicados con fotos.
- [ ] 1 alianza verificada en `/aliados`.
- [ ] Primer email real enviado (waitlist) — revisa SPF/DKIM en Gmail.
- [ ] 1 donación test completada y aparece en `/donar#transparencia` con número real.
- [ ] Push notifications activadas desde un dispositivo móvil real.
- [ ] `SITE.legal.razonSocial` y textos de `/privacidad` + `/terminos` ajustados.
- [ ] Handles sociales actualizados en `src/lib/site.ts`.
- [ ] GA4 recibe pageviews en Realtime.
- [ ] Search Console → sitemap enviado y status "Success".

---

## 11. Qué pasa si **no** agregas algo

| Falta | Qué ocurre |
|-------|-----------|
| `DATABASE_URL` | Forms loggean en consola; `/casos` y `/panel` vacíos (sin datos persistidos) |
| `CLERK_*` | `/panel` redirige al home con `?panel=pronto`; `/entrar` y `/crear-cuenta` muestran placeholder |
| `STRIPE_*` | Widget donar muestra "estamos activando"; redirect a `/contacto` |
| `RESEND_API_KEY` | Emails se loggean pero no se envían; UX sigue igual |
| `SUPABASE_URL`/`SERVICE_ROLE` | `/panel/casos/nuevo` guarda caso pero no sube fotos |
| `UPSTASH_*` | Rate limit en memoria (suficiente hasta ~10k req/día por instancia) |
| `VAPID_*` | Toggle push dice "listo para activarse" |
| `NEXT_PUBLIC_GA_ID` | Sin GA4 |
| pixels | Sin tracking en landings paid |

Todo esto es por diseño. Prioriza las primeras 4 filas de la tabla en §2 para tener la experiencia mínima viable.
