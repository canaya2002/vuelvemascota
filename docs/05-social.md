# 05 · Redes sociales — Reservar handles y Business accounts

**Tiempo estimado:** 2 horas.
**Costo:** $0.
**Importancia:** alta. Los handles se agotan rápido y si un día alguien registra `@vuelveacasa.mx` antes que tú, te cambia la estrategia de marca y el SEO.

---

## 5.1 · Handles a reservar (en este orden de prioridad)

Mantén consistencia: siempre preferir `vuelveacasa.mx`. Si no está disponible, bajar a `vuelveacasa` o `vuelveacasa_mx`.

| Plataforma      | Handle objetivo          | Fallback 1       | Fallback 2          | Verificación |
|-----------------|--------------------------|-------------------|---------------------|--------------|
| Instagram       | `@vuelveacasa.mx`        | `@vuelveacasa`    | `@vuelvea.casa`     | Meta Verified (USD 14.99/mes, opcional) |
| TikTok          | `@vuelveacasa.mx`        | `@vuelveacasa`    | `@vuelveacasamx`    | Verificación gratuita solicitando |
| Facebook (page) | `/vuelveacasamx`         | `/vuelveacasa.mx` | `/VuelveaCasaMX`    | Meta Verified |
| X (Twitter)     | `@vuelveacasa_mx`        | `@vuelveacasamx`  | `@vuelveacasa`      | X Premium (opcional) |
| YouTube         | `@vuelveacasa`           | `@vuelveacasamx`  |                     | Aplica con 100+ subs |
| LinkedIn page   | `/company/vuelveacasa`   |                   |                     | Automática con dominio verificado |
| GitHub org      | `vuelveacasa`            | `vuelveacasa-mx`  |                     | — |
| Threads         | Se hereda de Instagram   | —                 |                     | — |
| WhatsApp Business | Número con prefijo MX | —                 |                     | Manual |

**Importante:** si ya corriste paso 04 (correos) y el dominio está verificado, en varios de estos (Instagram, Facebook, LinkedIn) puedes **reclamar el handle oficial** aunque alguien más lo tenga, siempre que no esté activo. Es vía "trademark / brand rights".

---

## 5.2 · Paso a paso por red

### Instagram / Facebook (Meta Business)

1. <https://business.facebook.com> → **Create Account**.
2. **Brand → Create** → marca "VuelveaCasa México".
3. Dentro crea:
   - **Instagram account** (`@vuelveacasa.mx`). Si el handle está tomado por alguien inactivo, Meta tiene formulario: <https://help.instagram.com/contact/636276399721841>.
   - **Facebook Page** ("Página" tipo Organización sin fines de lucro → Cuidado animal).
4. **Linka IG + FB** para que compartan inbox y ads: Business Settings → Accounts → Instagram accounts → Connect to Page.
5. **Verifica dominio** (importante para ads después): Business Settings → Brand Safety → Domains → `vuelveacasa.mx` → método **Meta tag**. Copia el valor y pégalo en `.env` como `META_DOMAIN_VERIFICATION`. Ya tenemos el hook en `layout.tsx`; solo redeploy.

### TikTok

1. <https://www.tiktok.com/signup> con `hola@vuelveacasa.mx`.
2. Username: `vuelveacasa.mx` (se puede cambiar solo 1 vez cada 30 días — elige bien).
3. Cambia a **Business account**: Profile → Settings → Manage account → Switch to Business Account → Category "Nonprofit" o "Community".
4. **TikTok Ads Manager**: <https://ads.tiktok.com> (es otra alta). Usamos esa para el Pixel (ver doc 09).

### X (Twitter)

1. <https://twitter.com/i/flow/signup>.
2. Handle: `@vuelveacasa_mx`.
3. Bio y link al sitio.
4. Si algún día haces ads en X, también pide verificación de dominio (Settings → Ads).

### LinkedIn

1. Crea **Company Page** desde tu perfil personal: <https://www.linkedin.com/company/setup/new/>.
2. Tipo: "Nonprofit" o "Small business".
3. URL: `linkedin.com/company/vuelveacasa`.
4. Verifica tu sitio web desde la página (requiere subir un archivo HTML o meta tag).

### YouTube

1. Con la misma cuenta Google de `hola@vuelveacasa.mx` → <https://youtube.com/create_channel> → crea canal de marca (no personal).
2. Custom handle `@vuelveacasa` se desbloquea a los 100 subs. Mientras tanto, pon el nombre "VuelveaCasa".

### WhatsApp Business (para fase 2)

- Cuenta WhatsApp Business app (gratuita) con un número MX dedicado. Sirve para responder familias de mascotas perdidas.
- Para automatizar alertas masivas necesitas **WhatsApp Cloud API** (Meta): <https://business.facebook.com/wa/manage/home>. Requiere número verificado y un proveedor (Twilio/Meta). Lo dejamos para fase 2.

---

## 5.3 · Bio templates

**Instagram / TikTok:**

```
Red comunitaria 🇲🇽
Mascotas perdidas, encontradas y rescates.
Reporta · Encuentra · Ayuda.
↓ Registro gratis
```

**Facebook (about):**

```
VuelveaCasa es una red comunitaria mexicana para reportar mascotas perdidas y encontradas, activar alertas por zona, ofrecer hogar temporal y apoyar rescates verificados. Transparencia, acción local y humanidad.
```

**X / Twitter:**

```
Red comunitaria MX 🇲🇽 de mascotas perdidas y rescates. Reporta, encuentra, ayuda. Sumate gratis ↓
```

**LinkedIn:**

```
Tecnología y comunidad al servicio de mascotas en riesgo en México. Plataforma para reportes, alertas por zona, hogares temporales y apoyo a rescates verificados.
```

---

## 5.4 · Link-in-bio

En todas las redes el "link" es el mismo para no fragmentar:
`https://vuelveacasa.mx/registro?utm_source=<red>&utm_medium=bio`

Ejemplos:

- Instagram: `https://vuelveacasa.mx/registro?utm_source=instagram&utm_medium=bio`
- TikTok: `https://vuelveacasa.mx/campanas/tiktok?utm_source=tiktok&utm_medium=bio`

Usa los UTMs para medir en GA4 / Vercel Analytics de dónde viene cada registro.

---

## 5.5 · Assets de marca

Los necesitas al crear los perfiles:

- **Avatar** 400×400 PNG con la pata coral sobre fondo navy (puede ser el `icon.png` del repo + marco).
- **Portada FB / LinkedIn** 1200×630. Puedes usar `/opengraph-image` (el sitio lo genera).
- **Link-in-bio "hero"** 1080×1080 para posts.

Tip: si no tienes diseñador, arma estos en Figma/Canva en 1 hora y ya. Luego que tengas brand refinada, reemplazas.

---

## 5.6 · Actualiza `src/lib/site.ts`

Una vez que tengas los handles **reales**, cambia:

```ts
// src/lib/site.ts
social: {
  instagram: "https://instagram.com/vuelveacasa.mx",
  tiktok: "https://tiktok.com/@vuelveacasa.mx",
  facebook: "https://facebook.com/vuelveacasamx",
  x: "https://x.com/vuelveacasa_mx",
},
```

Se reflejan en footer, JSON-LD, OG metadata y sameAs de la Organization schema.

---

## 5.7 · Checklist redes

- [ ] Meta Business + IG + FB page creados y linkados.
- [ ] TikTok handle, bio, business account.
- [ ] X handle, bio, link.
- [ ] LinkedIn company page.
- [ ] YouTube canal.
- [ ] GitHub org (opcional, útil si el repo del proyecto deja de ser personal).
- [ ] `src/lib/site.ts::SITE.social` actualizado con URLs reales.
- [ ] Verificación de dominio Meta lista (si planeas ads).
- [ ] Avatares y portadas consistentes en las 5 redes.
