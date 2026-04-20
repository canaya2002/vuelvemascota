# 03 · Resend + DNS — Correos que sí llegan

**Tiempo estimado:** 30 min (envío) + 10 min–24 h de propagación DNS.
**Costo:** free tier de Resend incluye **3,000 emails/mes** y **100/día**, más que suficiente para fase 1. Plan pagado arranca en USD 20/mes cuando escales.
**Qué queda funcionando:** bienvenida a waitlist, notificaciones de contacto y aliados al equipo, preparado para cualquier email transaccional futuro.

El wrapper ya vive en `src/lib/email.ts`. Sin `RESEND_API_KEY` los emails se loggean pero la acción sigue ok — no rompe la UX.

---

## 3.1 · Alta en Resend

1. <https://resend.com/signup> con tu correo personal o con `hola@vuelveacasa.mx` (si ya configuraste buzones, paso 06).
2. Verifica el correo (llega un magic link).
3. Dashboard → **Domains** → **Add Domain** → escribe `vuelveacasa.mx` → **Add**.

---

## 3.2 · DNS — registros a publicar

Resend te mostrará 3 (o 4) registros. Los valores **exactos** salen ahí; los tipos y propósitos son siempre:

| Tipo  | Host / Name                         | Valor (ejemplo)                                                                                          | Propósito |
|-------|--------------------------------------|----------------------------------------------------------------------------------------------------------|-----------|
| MX    | `send` (= `send.vuelveacasa.mx`)     | `feedback-smtp.us-east-1.amazonses.com` con prioridad `10`                                              | Bounces y feedback loop |
| TXT   | `send` (= `send.vuelveacasa.mx`)     | `v=spf1 include:amazonses.com ~all`                                                                     | SPF |
| TXT   | `resend._domainkey`                  | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ...` (clave pública DKIM larga)                                | DKIM |
| TXT   | `_dmarc` *(recomendado no obligatorio)* | `v=DMARC1; p=none; rua=mailto:hola@vuelveacasa.mx`                                                       | DMARC (reportes) |

### 3.2.1 Cómo ingresar registros en los registradores más comunes

**Cloudflare** (recomendado si tienes flexibilidad): DNS → Records → Add record. Usa los valores tal cual, **desactiva el cloud (orange cloud) en el MX** para que Cloudflare no proxy-ee mail.

**Namecheap**: Domain List → Manage → Advanced DNS → Add new record.

**Google Domains / Squarespace Domains**: DNS → Custom records.

**GoDaddy**: DNS Management → Add record.

Notas:

- En "Host/Name" muchos registradores esperan solo el **subdominio** (`send` o `resend._domainkey`), no el dominio completo. Si te pide el FQDN, entonces sí usa `send.vuelveacasa.mx`.
- Si el registrador autocompleta el dominio base (te muestra `send` y abajo dice `.vuelveacasa.mx`), **no lo duplicites**.
- En el valor DKIM pega **la cadena completa sin saltos de línea ni comillas**.
- TTL: deja el default (normalmente 1h o 3600s).

### 3.2.2 Verificar

1. Ve de regreso a Resend → Domains → clic en el dominio → **Verify DNS Records**.
2. Propagación: **2–10 min** en Cloudflare/Namecheap; hasta 24 h en registradores lentos.
3. Cuando los tres estén verdes, el dominio queda "Verified".

---

## 3.3 · API Key

1. Resend → **API Keys** → **Create API Key**.
2. Nombre: `vuelveacasa-prod`.
3. Permission: **Sending access** (no hace falta full access).
4. Domain: selecciona `vuelveacasa.mx` (recomendado, limita el blast radius si se filtra).
5. Copia el token que empieza con `re_...`.

En `.env.local` y Vercel (reemplaza con tu valor real, conserva el prefijo `re_`):
```env
RESEND_API_KEY=<TU_API_KEY_DE_RESEND>
EMAIL_FROM=VuelveaCasa <hola@vuelveacasa.mx>
```

El `EMAIL_FROM` **debe usar el dominio verificado**. Si intentas mandar desde `@gmail.com` u otro dominio no verificado, Resend rechaza.

---

## 3.4 · Prueba

```bash
# Local, con el key en .env.local
npm run dev
# En otra terminal, envía una waitlist:
curl -X POST http://localhost:3000/api/waitlist \
  -F "nombre=Prueba" \
  -F "email=<TU_EMAIL_REAL>" \
  -F "ciudad=Ciudad de México" \
  -F "rol=dueño" \
  -F "acepta=on"
```

Deberías recibir en tu bandeja el mail "Estás dentro, Prueba.". Revisa:

- Se ve bien en móvil.
- El remitente muestra `VuelveaCasa <hola@vuelveacasa.mx>`.
- En Gmail: clic en "mostrar original" → verifica `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`.

---

## 3.5 · Reputación y entregabilidad

Para que no caigas en spam:

1. **Primer mes**: envía volúmenes bajos (< 500/día). Resend lo recomienda para "warm up" natural.
2. **Evita contenido spammy**: mayúsculas, signos excesivos, "$$$", acortadores extraños.
3. **Gestiona rebotes**: si un email rebota duro, no le vuelvas a mandar (Resend lo marca automático como suppressed).
4. **Incluye link de baja**: para emails masivos (newsletters), obligatorio. Para transaccionales (bienvenida, reset) no hace falta legalmente pero es buena práctica.
5. **Monitorea**: Resend → Logs → estado de cada envío; Emails → métricas agregadas.

---

## 3.6 · Bandeja compartida del equipo

Notificaciones de contacto y postulaciones llegan a `SITE.contact.email` (`hola@vuelveacasa.mx`). Si quieres separarlas por tema:

- `src/lib/actions.ts::submitContact` → cambia `SITE.contact.email` por una lógica tipo:
  ```ts
  const recipient = {
    rescate: SITE.contact.ayuda,
    prensa: SITE.contact.prensa,
    aliados: SITE.contact.email,
  }[result.data.tema] ?? SITE.contact.email;
  ```
- Luego en Gmail / el provider, crea reglas para cada alias (`ayuda+rescate@`, etc.).

---

## 3.7 · Alternativas si decides no usar Resend

El wrapper `src/lib/email.ts::sendEmail` es una llamada `fetch` aislada. Reemplazar por:

- **Postmark**: POST a `https://api.postmarkapp.com/email` con header `X-Postmark-Server-Token`.
- **Amazon SES**: más barato en volumen pero requiere SDK.
- **SendGrid / Mailgun**: similar.

En todos los casos, cambia solo esa función, el resto del código no se entera.

---

## 3.8 · Checklist Resend

- [ ] Cuenta Resend creada.
- [ ] Dominio `vuelveacasa.mx` añadido.
- [ ] Registros MX, SPF, DKIM publicados y verificados (verdes).
- [ ] DMARC añadido (opcional pero recomendado).
- [ ] API Key creada con acceso limitado al dominio.
- [ ] `RESEND_API_KEY` y `EMAIL_FROM` en `.env.local` y Vercel.
- [ ] Prueba de waitlist recibida en bandeja real.
- [ ] Headers SPF/DKIM/DMARC con `PASS`.
