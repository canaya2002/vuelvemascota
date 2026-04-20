# 06 · Correos de dominio — `@vuelveacasa.mx`

**Tiempo estimado:** 45 min + propagación DNS (10 min – 2 h).
**Costos (a elegir):**

| Opción | Precio | Límite | Pros | Contras |
|---|---|---|---|---|
| **Zoho Mail Free** | $0 | 5 usuarios, 5 GB/c/u, interfaz web | Gratis real, DNS fácil | Sin IMAP en free, web-only |
| **Zoho Mail Mail Lite** | USD 1/usuario/mes | 10 GB, IMAP/POP | Muy barato, soporte MX | UX menos pulido que Google |
| **Google Workspace Business Starter** | ~USD 7/usuario/mes (~$130 MXN) | 30 GB, Meet/Docs/Drive | El estándar | Precio por usuario |
| **Fastmail** | USD 3/usuario/mes | 30 GB | Buen DX, enfoque privacidad | En inglés |
| **Cloudflare Email Routing** | $0 | Solo *reenvío* (no bandeja) | Gratis, cero fricción | No envías, solo rediriges |

**Recomendación fase 1:**

- Si ya usas Gmail personal y quieres separación física → **Google Workspace** (único buzón `hola@vuelveacasa.mx` por $130/mes).
- Si quieres gratis total → **Cloudflare Email Routing** apuntando todo a tu Gmail personal + SMTP via Resend para enviar (ver 6.4).
- Si quieres una bandeja "real" sin costo → **Zoho Free**.

---

## 6.1 · Alias a crear (en cualquier opción)

Todos apuntando al mismo humano para arrancar:

- `hola@vuelveacasa.mx` — principal / general (ya está en `SITE.contact.email`).
- `ayuda@vuelveacasa.mx` — soporte (`SITE.contact.ayuda`).
- `prensa@vuelveacasa.mx` — medios (`SITE.contact.prensa`).
- `no-reply@vuelveacasa.mx` — from de transaccionales (Resend, ver 03).
- `aliados@vuelveacasa.mx` — postulaciones (opcional, agregar a `site.ts` si lo usas).
- `donaciones@vuelveacasa.mx` — notificaciones fiscales (fase 2 con donataria).

---

## 6.2 · Opción A: Zoho Mail Free

1. <https://www.zoho.com/mail/zohomail-pricing.html> → Forever Free plan → **Sign up**.
2. "Sign up with a domain you already own" → `vuelveacasa.mx`.
3. Crea el **admin user**: `hola@vuelveacasa.mx`. Password fuerte.
4. Zoho te muestra 3 (o 4) registros DNS:

   | Tipo | Host                     | Valor                                  | Prioridad |
   |------|--------------------------|----------------------------------------|-----------|
   | MX   | `@`                      | `mx.zoho.com`                          | 10        |
   | MX   | `@`                      | `mx2.zoho.com`                         | 20        |
   | MX   | `@`                      | `mx3.zoho.com`                         | 50        |
   | TXT  | `@`                      | `v=spf1 include:zoho.com ~all`         | —         |
   | TXT  | `zmail._domainkey` (aprox) | DKIM que te genera Zoho                | —         |

5. Añade los registros en tu DNS (mismos pasos que el doc 03 Resend).
6. **Importante**: si ya usaste Resend en el subdominio `send.vuelveacasa.mx`, **no hay conflicto**: Resend usa `send.*` y Zoho usa el apex `@`. Los MX de Resend en `send` y los MX de Zoho en `@` conviven.
7. Verifica en Zoho → **Proceed**.
8. Crea alias `ayuda@`, `prensa@`, `no-reply@` → User Details → Aliases → Add.
9. Descarga la app Zoho Mail en móvil o usa <https://mail.zoho.com>.

Limitación plan free: sin IMAP/POP (no puedes conectar a Gmail/Apple Mail). Sube a Lite ($1/mes) si te incomoda.

---

## 6.3 · Opción B: Google Workspace

1. <https://workspace.google.com/business/signup/welcome/> → empieza con **Business Starter**.
2. Domain: `vuelveacasa.mx`.
3. Crea tu usuario admin `hola@vuelveacasa.mx`.
4. Verifica dominio con TXT.
5. Publica MX de Google:

   | Prioridad | Host | Valor |
   |-----------|------|-------|
   | 1 | `@`  | `SMTP.GOOGLE.COM.` |

   (Workspace ahora usa un único MX consolidado.)

6. Activa 2FA en el admin (forzoso si manejas datos de usuarios).
7. En Admin Console → Directory → Groups → crea `ayuda@`, `prensa@`, `no-reply@` como grupos / aliases apuntando al mismo admin.

**SPF combinado con Resend:**
Google provee su propio SPF. Combínalo con el de Resend si envías desde ambos:
```
v=spf1 include:_spf.google.com include:amazonses.com ~all
```
Solo **un** registro SPF al apex. Si publicas dos TXT con `v=spf1`, los mailers fallan.

---

## 6.4 · Opción C: Cloudflare Email Routing (solo recibir)

Si no quieres pagar nada y no te importa enviar desde `@vuelveacasa.mx` en tu cliente de correo:

1. Dominio en Cloudflare → sidebar **Email** → **Email Routing**.
2. **Enable**. Cloudflare publica los MX + TXT automáticamente. Acepta.
3. **Custom addresses**:
   - `hola@vuelveacasa.mx` → `tunombre@gmail.com`
   - `ayuda@` → mismo
   - `prensa@` → mismo
4. Verifica el destino (Gmail) y listo.

**Envío** (cómo respondes "desde" `hola@vuelveacasa.mx`):

- Usamos Resend como SMTP. Resend → Settings → SMTP → credenciales.
- En Gmail → Settings → Accounts → **Send mail as** → Add another email address:
  - Name: `VuelveaCasa`
  - Email: `hola@vuelveacasa.mx`
  - SMTP server: `smtp.resend.com`, Port `465` (SSL), Username `resend`, Password: tu `RESEND_API_KEY`.
- Gmail te envía verificación → completas → ya puedes responder desde ese alias.

Con esto tienes **correo corporativo funcional a $0**. Limitación: no tienes "buzón propio" de `vuelveacasa.mx`, todo vive en tu Gmail.

---

## 6.5 · Firma corporativa

Crea una firma uniforme en Gmail/Zoho:

```
Carlos · VuelveaCasa
Red comunitaria de mascotas en México
vuelveacasa.mx · hola@vuelveacasa.mx
```

Sin imágenes pesadas. Firmas con imagen caen mucho en spam.

---

## 6.6 · Alias internos por tema (opcional)

Si quieres routing más fino, en Gmail / Zoho configura reglas:

- Mensajes con `+donaciones@` → carpeta "Donaciones".
- Mensajes de Stripe (`@stripe.com`) → carpeta "Stripe · eventos".
- Mensajes de `no-reply@vuelveacasa.mx` (los tuyos propios) → carpeta "Transaccionales enviados".

---

## 6.7 · Checklist correos

- [ ] Elegiste provider (Zoho / Workspace / Cloudflare Routing).
- [ ] Registros MX + SPF + DKIM del provider publicados y verificados.
- [ ] SPF combinado si usas Resend **y** el provider (un solo TXT con ambos `include:`).
- [ ] Los 4 alias (`hola@`, `ayuda@`, `prensa@`, `no-reply@`) reciben.
- [ ] Puedes **enviar** desde `hola@` (probado).
- [ ] 2FA activado en la cuenta admin.
- [ ] Envío de prueba entre `hola@` y tu correo personal funciona en ambos sentidos.
