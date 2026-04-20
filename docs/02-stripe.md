# 02 · Stripe MX — Activar donaciones reales

**Tiempo estimado:** 1–2 horas (+ 1–5 días de revisión bancaria de Stripe MX).
**Costo:** sin costo de alta. Stripe cobra **3.6% + $3 MXN** por cargo exitoso (tarjeta mexicana). Cargos internacionales y OXXO tienen su propia tarifa. No hay mensualidades.
**Qué queda funcionando:** el widget `/donar` crea sesiones de Stripe Checkout (pago único y suscripción mensual), Stripe procesa el cobro y nuestro webhook reconcilia con la DB.

---

## 2.1 · Crear la cuenta Stripe (modo test)

1. Ve a <https://dashboard.stripe.com/register>.
2. Correo: usa **`hola@vuelveacasa.mx`** (ya cuando tengas el buzón del paso 06) o tu correo personal temporal — lo puedes cambiar luego.
3. País: **México**. Esto NO es reversible; si marcas otro país hay que crear otra cuenta.
4. Al entrar, el dashboard arranca en **modo Test** (banner arriba). Todas las pruebas se hacen aquí.
5. Nombre del negocio: **VuelveaCasa** (puedes poner el nombre legal después, Stripe deja cambiar "public business name" vs "legal name").

---

## 2.2 · Obtener las keys de test

1. Dashboard → arriba a la derecha confirma **Test mode** activado.
2. Menú izquierdo → **Developers** → **API keys**.
3. Copia:
   - `Publishable key` → empieza con `pk_test_...` (no la usamos en fase 1, pero guárdala)
   - `Secret key` → click en **Reveal** → empieza con `sk_test_...`
4. Pega en `.env.local` (reemplaza con tu valor real, conserva el prefijo `sk_test_`):
   ```env
   STRIPE_SECRET_KEY=<TU_SECRET_KEY_DE_STRIPE>
   ```
5. Instala el SDK **una vez** en el repo:
   ```bash
   npm i stripe
   ```
   (Se quedará en `package.json` y ya.)

---

## 2.3 · Webhook local para probar (con Stripe CLI)

Para probar el webhook en tu máquina sin exponer el puerto:

1. Instala la CLI: <https://docs.stripe.com/stripe-cli#install>
   - Mac: `brew install stripe/stripe-cli/stripe`
   - Windows: descarga el `.exe` y agrega al PATH. Alternativa: `scoop install stripe`
2. Autentica:
   ```bash
   stripe login
   ```
3. Levanta el reenvío local:
   ```bash
   stripe listen --forward-to localhost:3000/api/donar/webhook
   ```
4. La CLI te da un `whsec_...` temporal de sesión. Pégalo en `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=<WHSEC_TEMPORAL_DE_LA_CLI>
   ```
5. Reinicia `npm run dev` para tomar la env var.

---

## 2.4 · Prueba end-to-end en localhost

1. `npm run dev`
2. Ve a `http://localhost:3000/donar`
3. Monto `250` → click **Donar $250 MXN**
4. Te redirige a Stripe Checkout. Usa estas tarjetas de prueba (todas con CVC `123`, fecha `12/34`, código postal `12345`):

   | Tarjeta | Qué prueba |
   |---|---|
   | `4242 4242 4242 4242` | Pago exitoso |
   | `4000 0000 0000 9995` | Fondos insuficientes (rechazo) |
   | `4000 0027 6000 3184` | Requiere 3D Secure (autenticación) |
   | `4000 0000 0000 0341` | Agrega tarjeta OK pero primer cobro falla (útil para suscripciones) |

5. Stripe regresa a `/donar/gracias`.
6. En la terminal donde corre `stripe listen` debes ver:
   ```
   checkout.session.completed [evt_xxx] → 200 OK
   ```
7. En el terminal de `npm run dev` debes ver:
   ```
   [db:donaciones] { stripe_session_id: 'cs_test_...', amount: 250, currency: 'mxn', causa: 'fondo', recurrente: false, status: 'completed' }
   ```
   (El log llega porque `db.ts` aún es stub — se va a real cuando hagas el paso 04 Supabase.)

8. Prueba también **Mensual** marcado y causa diferente.

---

## 2.5 · Activar la cuenta para cobros reales

En modo Test no salen pesos. Para activar modo Live tienes que completar el "Activate account" que Stripe MX pide:

1. Dashboard → arriba a la derecha → **Activate account** (o Settings → Business settings → Activation).
2. Te pide:
   - **Tipo de entidad**: individual (persona física), empresa (moral), o sin fines de lucro.
     - Si aún no tienes AC/SAS, empieza como **Individual** (persona física con actividad empresarial). Puedes cambiarlo después enviando documentos.
   - **RFC** (persona o moral). Sin RFC no puedes activar cobros en MX.
   - **Dirección** (puede ser la domiciliaria).
   - **Teléfono** mexicano.
   - **Cuenta bancaria MXN (CLABE de 18 dígitos)** para recibir los payouts.
   - **Descripción del negocio**: "Plataforma sin fines de lucro para coordinación comunitaria de mascotas perdidas y rescates. Donaciones voluntarias de usuarios finales."
   - **URL del sitio**: `https://vuelveacasa.mx`.
   - **Política de soporte**: link a `/contacto`.
   - **Política de privacidad**: link a `/privacidad`.
   - **Términos**: link a `/terminos`.
   - **Producto/servicio**: "Donaciones para apoyo a mascotas en riesgo."
3. Sube INE/Pasaporte + comprobante de domicilio (se pide en verificación).
4. Stripe revisa. Pueden pedir info extra. Aprueba en 1–5 días hábiles.

**Mientras revisan**: puedes seguir usando modo Test en producción (no cobra) y lanzar con "Estamos activando donaciones" (que es exactamente lo que hace el sitio si `STRIPE_SECRET_KEY` está vacío).

---

## 2.6 · Webhook en producción

Cuando tengas el deploy de Vercel con dominio:

1. Dashboard → **Developers** → **Webhooks** → **Add endpoint**.
2. Endpoint URL: `https://vuelveacasa.mx/api/donar/webhook`
3. Events to send → **Select events** → marca:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Crear. Stripe te da un **Signing secret** que empieza con `whsec_`. Copia.
5. En Vercel → Settings → Environment Variables → añade (Production):
   - `STRIPE_SECRET_KEY` → valor live (empieza con `sk_live_`, no el de test)
   - `STRIPE_WEBHOOK_SECRET` → valor live (empieza con `whsec_`)
   - `NEXT_PUBLIC_SITE_URL=https://vuelveacasa.mx`
6. Redeploy (Vercel → Deployments → promover último).
7. En el dashboard del webhook → **Send test webhook** → elige `checkout.session.completed`. Revisa que responda `200`.

---

## 2.7 · Price IDs mensuales (opcional)

Si quieres tiers fijos mensuales ($100/$250/$500) en lugar de ad-hoc:

1. Dashboard → **Product catalog** → **Add product**.
2. Nombre: "Donación mensual · Fondo comunitario". Precio: `100 MXN`, recurring monthly.
3. Al guardarse, copia el `price_id` (empieza con `price_...`).
4. Crea otro para "Emergencias" y otro para "Rescatistas".
5. En `.env.local` y Vercel:
   ```env
   STRIPE_PRICE_MONTHLY_FONDO=price_xxx
   STRIPE_PRICE_MONTHLY_EMERGENCIA=price_xxx
   STRIPE_PRICE_MONTHLY_RESCATE=price_xxx
   ```
6. El código ya los detecta (`src/lib/stripe.ts::STRIPE_CONFIG.monthlyPriceIds`). Si están vacíos, el widget crea uno ad-hoc con el monto que el usuario eligió — funciona igual.

---

## 2.8 · Impuestos y facturación

- **Stripe Tax**: en MX no ofrece recolección automática IVA. Lo dejamos apagado.
- **Facturación CFDI 4.0**: Stripe no emite CFDI mexicanos. Dos caminos:
  1. **Sin deducibilidad** (más simple): las donaciones no son deducibles y así lo comunicas. Los comprobantes de Stripe son recibos internos.
  2. **Con deducibilidad** (donataria autorizada SAT): necesitas ser AC con autorización. Contratas un proveedor de facturación (Facturama, Facturapi, SW Sapien) y programas un workflow que reciba el `checkout.session.completed` y genere el CFDI con los datos del donante. Eso entra en fase 2 (cuando tengas la constitución y el registro SAT).
- Recomendación fase 1: mantén donaciones **no deducibles** y lo declaras claro en `/donar` → "Recibo interno, no deducible por ahora."

---

## 2.9 · Monitoreo y reporting

1. Dashboard → **Home** → card de "Gross volume" y "Successful payments".
2. Activa **Notifications** (Settings → Team and notifications → Email) para que te lleguen:
   - Nuevos pagos
   - Disputas
   - Suscripciones canceladas
3. Exporta mensualmente desde **Payments** → "Export" como CSV y archiva para el reporte de transparencia del fondo.

---

## 2.10 · Checklist Stripe

- [ ] Cuenta Stripe MX creada.
- [ ] `npm i stripe` corrido.
- [ ] Keys de test en `.env.local`.
- [ ] CLI configurada, prueba con 4242 exitosa, webhook local llega.
- [ ] Activación de cuenta enviada con RFC + CLABE.
- [ ] En Vercel: keys LIVE, webhook LIVE configurado apuntando a `/api/donar/webhook`.
- [ ] `Send test webhook` responde 200 en prod.
- [ ] Tres donaciones live de prueba (tú → tú) cuadran en el dashboard.
- [ ] Política de privacidad, términos y contacto visibles desde `/donar` (ya están por navbar/footer).

Cuando los 9 primeros estén listos, el flujo de donación está production-ready.
