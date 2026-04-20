# 09 · TikTok Pixel (y Meta Pixel) — Tracking de ads

**Tiempo estimado:** 40 min.
**Costo:** $0 (el pixel es gratis; lo que cuesta son los ads).
**Qué queda funcionando:** cada visita a `/campanas/tiktok` reporta al pixel; cada registro exitoso marca una conversión; optimizas creativos por conversión real en vez de por views.

Los componentes `TikTokPixel` y `MetaPixel` ya están implementados en `src/components/` y se cargan **solo en `/campanas/tiktok`** (no queremos rastrear a los usuarios orgánicos del resto del sitio).

---

## 9.1 · Crear el pixel de TikTok

1. <https://ads.tiktok.com> → crea Business Center si aún no lo tienes.
2. Ads Manager → sidebar **Assets → Events → Web Events** → **Create Pixel**.
3. Nombre: `VuelveaCasa Web Pixel`.
4. Installation method: **TikTok Pixel** (no Events API por ahora).
5. Install manually → copia el `pixel_code` (es un ID tipo `C1ABCD2E3F4G5H6I7JK8L9M0`).
6. En Vercel → Env vars:
   ```env
   NEXT_PUBLIC_TIKTOK_PIXEL_ID=C1ABCD2E3F4G5H6I7JK8L9M0
   ```
7. Redeploy. El componente `TikTokPixel.tsx` lo detecta y monta el script en `/campanas/tiktok`.

### 9.1.1 Verificar con TikTok Pixel Helper

1. Instala la extensión Chrome **TikTok Pixel Helper**.
2. Abre `https://vuelveacasa.mx/campanas/tiktok`.
3. La extensión debe mostrar el pixel `C1ABCD...` con evento `Pageview` disparado.
4. Si no, abre DevTools → Network → filtra `analytics.tiktok.com` → debe haber requests.

---

## 9.2 · Eventos de conversión en TikTok

El pixel captura `Pageview` automático. Para optimizar ads, necesitas marcar **eventos de conversión** clave:

- `SubmitForm` → cuando waitlist se envía exitoso.
- `CompletePayment` → cuando donación se completa.

### 9.2.1 Implementación del evento `SubmitForm`

En `src/components/forms/WaitlistForm.tsx`:

```tsx
"use client";
import { useEffect } from "react";
// ...
// Al inicio del componente si state.ok:
useEffect(() => {
  if (state.ok && typeof window !== "undefined") {
    // @ts-expect-error ttq global del pixel
    window.ttq?.track("SubmitForm", {
      content_type: "waitlist",
    });
    // Meta Pixel equivalente
    // @ts-expect-error fbq global
    window.fbq?.("track", "Lead", { content_name: "waitlist" });
    // GA4
    // @ts-expect-error gtag global
    window.gtag?.("event", "sign_up", { method: "waitlist" });
  }
}, [state.ok]);
```

### 9.2.2 `CompletePayment`

En `src/app/donar/gracias/page.tsx` convierte a client component y añade:

```tsx
"use client";
import { useEffect } from "react";

useEffect(() => {
  const sessionId = new URLSearchParams(window.location.search).get("session_id");
  // @ts-expect-error ttq global
  window.ttq?.track("CompletePayment", {
    content_type: "donation",
    value: 0, // idealmente el monto real, lo pasamos en query string desde checkout
    currency: "MXN",
  });
  // @ts-expect-error
  window.fbq?.("track", "Purchase", { currency: "MXN", value: 0 });
  // @ts-expect-error
  window.gtag?.("event", "purchase", { transaction_id: sessionId, currency: "MXN", value: 0 });
}, []);
```

Para pasar el monto real al success page, en `src/lib/stripe.ts::successUrl` añade `&amount=${amount}`:

```ts
const successUrl = `${STRIPE_CONFIG.publicSiteUrl}/donar/gracias?session_id={CHECKOUT_SESSION_ID}&amount=${amount}`;
```

Y en el useEffect:

```tsx
const amount = Number(new URLSearchParams(window.location.search).get("amount")) || 0;
window.ttq?.track("CompletePayment", { value: amount, currency: "MXN" });
```

### 9.2.3 Marcar eventos como optimización en TikTok Ads

1. Ads Manager → Events → tu pixel → **Web events**.
2. Verás tus eventos enviados (`Pageview`, `SubmitForm`, `CompletePayment`).
3. Al crear una campaña tipo **Conversions**, eliges `SubmitForm` como optimization event → TikTok optimiza hacia gente que se suscribe, no solo clics.

---

## 9.3 · Crear el pixel de Meta (Facebook/Instagram)

1. <https://business.facebook.com> → Events Manager → **Connect Data Sources** → Web → **Meta Pixel**.
2. Nombre: `VuelveaCasa Web`.
3. Install code manually → copia el **Pixel ID** (solo números, 15–16 dígitos).
4. Vercel env:
   ```env
   NEXT_PUBLIC_META_PIXEL_ID=123456789012345
   ```
5. Redeploy. `MetaPixel.tsx` ya monta en `/campanas/tiktok`.
6. Verifica con extensión **Meta Pixel Helper** (Chrome).

### 9.3.1 Verificación de dominio Meta

Para usar el pixel en ads sin límites de aggregated event measurement:

1. Business Settings → Brand Safety → **Domains** → Add → `vuelveacasa.mx`.
2. Elige **Meta-tag verification** → copia el valor.
3. Vercel env:
   ```env
   META_DOMAIN_VERIFICATION=abcdef1234567890
   ```
4. Redeploy. El `layout.tsx` inyecta la meta tag.
5. Vuelve a Meta → Verify.

---

## 9.4 · Usar pixels en otras landings

Si creas más landings (`/campanas/google`, `/campanas/instagram`, etc.):

1. Crea carpeta nueva en `src/app/campanas/...`.
2. Importa:
   ```tsx
   import { TikTokPixel } from "@/components/TikTokPixel";
   import { MetaPixel } from "@/components/MetaPixel";
   ```
3. Monta arriba del return.

Si quieres tracking **en todo el sitio** (no solo campañas), mueve los componentes a `layout.tsx` — pero considera el impacto de privacidad y consent.

---

## 9.5 · UTMs para cruzar con GA4

Los links desde TikTok deberían llevar UTMs:

```
https://vuelveacasa.mx/campanas/tiktok?utm_source=tiktok&utm_medium=paid&utm_campaign=launch_q2&utm_content=video01
```

Esto te permite en GA4:
- Acquisition → Traffic acquisition → ver `tiktok / paid` por separado.
- Cruzar conversiones con creativos.

TikTok Ads Manager ya las puede añadir automáticamente con la opción **URL parameters** al crear un ad.

---

## 9.6 · Privacidad y fatiga

- Los pixels cargan **solo** en `/campanas/*`. El resto del sitio queda limpio.
- Añade en el footer de `/campanas/tiktok` un disclaimer mini:
  > "Esta página usa píxeles de medición para evaluar la efectividad de nuestras campañas."
- Si haces retargeting intensivo con audiencias, implementa un consent banner (ver doc 08).

---

## 9.7 · Checklist pixels

- [ ] TikTok pixel creado.
- [ ] `NEXT_PUBLIC_TIKTOK_PIXEL_ID` en Vercel (Production).
- [ ] Pixel Helper muestra `Pageview` al cargar `/campanas/tiktok`.
- [ ] Evento `SubmitForm` disparado al completar waitlist.
- [ ] Meta Pixel creado + `NEXT_PUBLIC_META_PIXEL_ID` en Vercel.
- [ ] Verificación dominio Meta pasada.
- [ ] Evento `Lead` de Meta confirmado en Events Manager.
- [ ] Primer test ad campaign creado en TikTok Ads Manager apuntando a `/campanas/tiktok` con UTMs.
