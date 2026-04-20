# 07 · SEO — Google Search Console + Bing + sitemap

**Tiempo estimado:** 30 min.
**Costo:** $0.
**Qué queda funcionando:** Google empieza a crawlear, tu sitemap queda indexado, Bing lo recoge también, y obtienes métricas de búsqueda (clicks, impresiones, queries, CTR).

El sitio ya expone `/sitemap.xml` y `/robots.txt` generados dinámicamente desde `src/app/sitemap.ts` y `src/app/robots.ts`.

---

## 7.1 · Google Search Console (GSC)

### 7.1.1 Alta de propiedad

1. <https://search.google.com/search-console> con tu cuenta Google (idealmente `hola@vuelveacasa.mx` del Workspace, o personal si vas por Cloudflare Routing).
2. **Add property** → tipo **Domain** (no URL-prefix; `Domain` cubre HTTP/HTTPS/www/sin www de un solo tiro).
3. Escribe `vuelveacasa.mx` → **Continue**.

### 7.1.2 Verificación por DNS (recomendado, una sola vez)

1. GSC te da un registro TXT tipo:
   ```
   Tipo: TXT
   Host: @  (o vuelveacasa.mx)
   Valor: google-site-verification=a1b2c3d4e5f6...
   ```
2. Añádelo en tu DNS.
3. Espera 1–10 min (Cloudflare es casi inmediato).
4. **Verify**. Listo.

### 7.1.3 Alternativa: verificación por meta tag (si no puedes tocar DNS)

1. En GSC elige property tipo **URL prefix** (no Domain). URL: `https://vuelveacasa.mx/`.
2. Método HTML tag → copia el value (no toda la etiqueta, solo el content="...").
3. En Vercel → Env vars → `GOOGLE_SITE_VERIFICATION=<ese-valor>`.
4. Redeploy. El `layout.tsx` ya lo inyecta (`metadata.verification.google`).
5. GSC → Verify.

### 7.1.4 Enviar sitemap

1. GSC → **Sitemaps** (menú izquierdo).
2. Add new sitemap → `sitemap.xml` (solo la ruta, Google usa el dominio).
3. **Submit**. Debería quedar en "Success" en minutos. Si marca "Couldn't fetch", espera 24h (el sitemap se genera a demanda; en plan free de Vercel la primera petición de Google debe calentar la ruta).

### 7.1.5 Solicitar indexado de URLs críticas

Las primeras 24–48 h post-launch, para acelerar:

1. GSC → **URL Inspection** → pega una URL (ej. `https://vuelveacasa.mx/`).
2. Si marca "URL is not on Google" → **Request indexing**.
3. Haz esto para las 10 URLs más importantes:
   - `/`
   - `/como-funciona`
   - `/donar`
   - `/mascota-perdida`
   - `/mascota-encontrada`
   - `/perro-perdido`
   - `/gato-perdido`
   - `/ciudades/cdmx`
   - `/ciudades/guadalajara`
   - `/ciudades/monterrey`

No abuses: Google limita a ~10 request/día.

---

## 7.2 · Bing Webmaster Tools

1. <https://www.bing.com/webmasters/> con cuenta Microsoft.
2. **Import from Google Search Console** → autoriza → selecciona el dominio → Import. Bing trae todo (verificación, sitemaps, propiedades) en 1 clic.
3. Alternativa manual:
   - Add site → `https://vuelveacasa.mx`
   - Verifica por DNS TXT (`msvalidate.01=...`) → pégalo en `BING_SITE_VERIFICATION` env var.
   - Sitemaps → Submit `sitemap.xml`.

Bing manda ~5–10% del tráfico orgánico en MX (ChatGPT Search también usa Bing, relevante).

---

## 7.3 · Verificar que Google pueda leer todo

### 7.3.1 Desde GSC (Mobile Usability + Core Web Vitals)

- **Experience → Core Web Vitals**: a los 3–7 días verás LCP/CLS/INP. El sitio está optimizado para pasar todo en verde.
- **Experience → HTTPS**: todas las URLs deberían aparecer HTTPS.

### 7.3.2 Desde PageSpeed Insights

<https://pagespeed.web.dev/> → pega `https://vuelveacasa.mx/`. Objetivo: >90 móvil y desktop. Si el hero video pesa mucho (vuelveacasalanding.mp4), considera:

- Comprimir el MP4 (`ffmpeg -i in.mp4 -vcodec libx264 -crf 28 -preset slow out.mp4`).
- Servirlo como WebM en paralelo.

### 7.3.3 Rich Results Test

<https://search.google.com/test/rich-results> → pega la home → debe detectar `Organization` y `WebSite`. En `/faq` debe detectar `FAQPage`. En los hubs SEO, `HowTo`. En ciudades, `Place`.

---

## 7.4 · Estrategia de contenido los primeros 90 días

El sitio ya trae 9 hubs SEO + 10 páginas de ciudad. Para acelerar el ranking:

### 7.4.1 Internal links
Ya están cableados footer + CTAs. Si ves que una página específica tarda en indexar, añade 1–2 links contextuales desde la home o desde `/faq`.

### 7.4.2 Backlinks iniciales

Los primeros 10 backlinks hacen el 80% del trabajo. Dónde conseguirlos:

1. **Directorios locales** de protección animal (AMMVEPE, AMA, grupos FB "Perros perdidos CDMX"): pide mención en sus recursos.
2. **Colectivos aliados**: cuando sume un rescatista, que linkee a VuelveaCasa desde su IG/sitio.
3. **Prensa / medios**: mandar nota a Animal Político, Chilango, Milenio (sección ciudades) con la historia. Ellos suelen linkear sin marcar nofollow.
4. **Tus propios perfiles**: LinkedIn, Medium, Substack — escribe 1 artículo largo ("Cómo funciona VuelveaCasa y por qué la construimos") con link al sitio.
5. **Wikipedia**: cuando tengas cobertura de medios reconocidos, una entrada en Wikipedia MX sobre "Plataformas de ayuda animal en México" con VuelveaCasa listada.

### 7.4.3 Contenido adicional (si quieres)

Los hubs actuales cubren los 8 términos más buscados. Para escalar:

- Añade un **blog** en `/blog/[slug]` con guías largas (opcional, te lo implemento cuando tengas ganas de escribir).
- Añade más ciudades en `src/lib/site.ts::CITIES` → se generan automáticamente.
- Expande con sub-hubs por colonia en CDMX (`/ciudades/cdmx/coyoacan`) cuando tengas datos reales.

---

## 7.5 · Monitoreo mensual

Agenda un calendario mensual:

1. GSC → **Performance** → exporta CSV: queries, páginas, CTR, posición.
2. Identifica las **5 queries donde posicionas 6–15** → ahí hay oportunidad fácil de subir a top-5 (ajustas title/H1 de esa página).
3. Revisa **Coverage** por errores de crawl (404s, soft 404s).

---

## 7.6 · Redirects y dominio canónico

Importante: Google elige **uno** de (con www / sin www). Fuerza:

- En Vercel → Domains → marca `vuelveacasa.mx` como **Primary**.
- `www.vuelveacasa.mx` se redirige con 308 al apex automáticamente (Vercel).
- Todas las URLs canónicas en `metadata.alternates.canonical` ya usan `SITE.url` sin www.

Redirects 301 ya configurados en `next.config.ts::redirects()`:

- `/home`, `/inicio` → `/`
- `/donate` → `/donar`
- `/register`, `/waitlist` → `/registro`
- `/privacy` → `/privacidad`
- `/terms` → `/terminos`
- `/perdido` → `/mascota-perdida`
- `/encontrado` → `/mascota-encontrada`
- `/faqs` → `/faq`
- `/home` → `/`

Si un día migras de dominio, añades redirects en `next.config.ts` y un 301 de dominio en Vercel → `Redirects`.

---

## 7.7 · Checklist SEO

- [ ] GSC propiedad Domain creada y verificada por DNS.
- [ ] Sitemap `sitemap.xml` enviado en GSC con status Success.
- [ ] Las 10 URLs críticas solicitadas para indexar.
- [ ] Bing importado desde GSC.
- [ ] Bing sitemap visible.
- [ ] Rich Results Test pasa Organization + WebSite + FAQPage + HowTo.
- [ ] PageSpeed Insights > 90 móvil.
- [ ] Dominio primary marcado en Vercel.
- [ ] Monitoreo mensual agendado.
