# 08 · Analytics — GA4 y/o Vercel Analytics

**Tiempo estimado:** 20 min.
**Costo:** $0 (free tiers generosos).
**Qué queda funcionando:** tracking de pageviews, fuente de tráfico, conversiones (waitlist enviado, donación completada) y Core Web Vitals reales.

Recomendación simple:

- **Tráfico + comportamiento + fuentes + funnels**: Google Analytics 4.
- **Core Web Vitals reales de usuarios**: Vercel Speed Insights.
- Si quieres **ambos**, se complementan.

---

## 8.1 · Google Analytics 4 (GA4)

### 8.1.1 Crear property

1. <https://analytics.google.com> con la cuenta Google (idealmente `hola@vuelveacasa.mx`).
2. Admin (engrane) → **Create** → **Account** → nombre: `VuelveaCasa`.
3. **Create Property**:
   - Property name: `VuelveaCasa Web`
   - Timezone: `(GMT-06:00) Mexico City`
   - Currency: `MXN`
4. Industry: Non-profit. Business size: small.
5. **Data stream** → Web → URL `https://vuelveacasa.mx`, stream name `Web`.
6. Copia el **Measurement ID**, formato `G-XXXXXXXXXX`.

### 8.1.2 Pegar el ID

`.env.local` y Vercel (Production + Preview):
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Redeploy. El componente `src/components/Analytics.tsx` lo detecta y carga `gtag` solo si existe la env. Ya está montado en `layout.tsx`.

### 8.1.3 Verificar

1. Abre `https://vuelveacasa.mx` en modo incógnito.
2. GA4 → **Reports** → **Realtime**. En 30–60 segundos deberías verte como "1 usuario activo".
3. Si no, revisa:
   - Que `G-...` sea el correcto en las env de producción.
   - Que no tengas bloqueadores (uBlock, Privacy Badger) activos al probar.
   - DevTools → Network → filtra `googletagmanager` → debe hacer request `200`.

### 8.1.4 Eventos importantes a trackear

GA4 por default captura `page_view`, `scroll`, `click` (outbound), `file_download`, `video_start`. Lo que **sí** conviene marcar manualmente:

#### Waitlist completada

En `src/components/forms/WaitlistForm.tsx`, cuando `state.ok === true`, dispara:

```tsx
// Dentro del branch `if (state.ok) { ... }` ANTES del return:
useEffect(() => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "sign_up", {
      method: "waitlist",
    });
  }
}, []);
```

#### Donación iniciada / completada

- **Iniciada**: en `DonationWidget.tsx::submit`, antes del `fetch`:
  ```ts
  (window as any).gtag?.("event", "begin_checkout", { currency: "MXN", value: Number(effective) });
  ```
- **Completada**: en `src/app/donar/gracias/page.tsx`:
  ```tsx
  "use client";
  import { useEffect } from "react";
  useEffect(() => {
    (window as any).gtag?.("event", "purchase", {
      currency: "MXN",
      transaction_id: new URLSearchParams(window.location.search).get("session_id"),
    });
  }, []);
  ```
  *(Requiere convertir la página en componente cliente; la versión actual es server. Te lo dejo listo si lo activas.)*

### 8.1.5 Marcar conversiones en GA4

1. GA4 → Admin → **Events** → espera 24h a que aparezcan tus eventos.
2. Junto a cada evento clave (`sign_up`, `purchase`), activa el toggle **Mark as conversion**.

### 8.1.6 Google Ads (fase 2)

Si haces Google Ads, linkea GA4 → Google Ads desde Admin → **Product links**. Las conversiones marcadas se pueden importar a Ads.

### 8.1.7 Consent Mode v2 (privacidad MX/UE)

Para cumplir LFPDPPP / GDPR si lo quieres riguroso:

1. Añade un banner de consentimiento (Klaro, CookieYes, TermsFeed). El más simple: <https://github.com/klaro-org/klaro-js>.
2. GA4 en `Analytics.tsx` ya respeta consent si inicializas así:
   ```ts
   gtag('consent', 'default', {
     ad_storage: 'denied',
     analytics_storage: 'denied',
   });
   ```
3. Cuando el usuario acepta, llamas `gtag('consent', 'update', { analytics_storage: 'granted' })`.

Para arrancar, **analytics_storage solo con IP anonimizada** (`anonymize_ip: true` ya activo) suele ser aceptable en MX. Implementa banner completo cuando hagas ads con retargeting.

---

## 8.2 · Vercel Analytics

Dos productos distintos:

- **Web Analytics**: pageviews anónimos, referrers, top pages. Alternativa ligera a GA4.
- **Speed Insights**: Core Web Vitals reales (LCP, INP, CLS) medidos desde los navegadores de tus usuarios.

### 8.2.1 Activar

1. Vercel → tu proyecto → **Analytics** tab → **Enable Web Analytics**.
2. Ídem → **Speed Insights** tab → **Enable**.
3. Instala los paquetes:
   ```bash
   npm i @vercel/analytics @vercel/speed-insights
   ```
4. Añade al `layout.tsx`:

```tsx
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// dentro del <body>, al final:
<VercelAnalytics />
<SpeedInsights />
```

5. Deploy. En 24 h empiezas a ver datos en los tabs del dashboard.

### 8.2.2 ¿GA4 o Vercel?

- **Solo Vercel**: si te gusta la simplicidad y no necesitas funnels complejos.
- **Solo GA4**: si vas a hacer Google Ads o análisis profundo.
- **Ambos**: normal. Vercel para Core Web Vitals y health; GA4 para marketing y funnels.

---

## 8.3 · Plausible / Umami (alternativa sin cookies)

Si quieres zero-cookies, sin banner:

- **Plausible** (hosted, USD 9/mes) o self-hosted gratis.
- **Umami** (self-hosted gratis, también hosted).

Ambos solo requieren pegar un `<script>` al `<head>`. Lo puedes añadir al `Analytics.tsx` como opción adicional.

---

## 8.4 · Dashboards que querrás revisar semanal

**GA4**
- Reports → Acquisition → Traffic acquisition: de dónde vienen.
- Reports → Engagement → Pages and screens: qué páginas jalan.
- Reports → Engagement → Events: conversiones (sign_up, purchase).

**Vercel**
- Analytics → Overview: pageviews y top pages.
- Speed Insights → LCP/INP/CLS trend.

**Search Console** (doc 07)
- Performance → queries de búsqueda.

Junta los 3 en un **Looker Studio** gratis cuando el volumen lo amerite.

---

## 8.5 · Checklist Analytics

- [ ] GA4 property creada con MXN y TZ CDMX.
- [ ] `NEXT_PUBLIC_GA_ID` en Vercel (Production + Preview).
- [ ] Realtime muestra tu visita de prueba.
- [ ] Eventos `sign_up` (waitlist) y `purchase` (donación) implementados.
- [ ] Conversiones marcadas en GA4.
- [ ] Vercel Web Analytics + Speed Insights activados.
- [ ] Consent banner opcional implementado si vas a hacer ads de retargeting.
