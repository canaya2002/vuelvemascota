# Store Submission — copy-paste a App Store Connect & Play Console

Todo lo que vas a pegar en los formularios de Apple y Google. Cada bloque está
listo, no edites el contenido. Si quieres cambiar algo, cámbialo aquí
primero y vuelve a copiar.

> **Cuenta de prueba (compartida entre ASC y Play Console):**
>
> - Email: `review-apple@vuelvecasa.com`
> - Password: `fWRafvc62$Uh6&sx`
>
> Crear primero en Clerk Dashboard → Users → "Create User". Luego ese
> mismo login va en ASC "App Review Information" y Play Console "App
> access".

---

## 1. App Store Connect — App Information

| Campo | Valor |
|---|---|
| **Name** | `VuelveaCasa` |
| **Subtitle** (30) | `Reúne mascotas perdidas en MX` |
| **Bundle ID** | `com.vuelvecasa.app` |
| **SKU** | `vuelveacasa-ios-001` |
| **Primary Language** | Spanish (Mexico) |
| **Primary Category** | Lifestyle |
| **Secondary Category** | Social Networking |
| **Content Rights** | "Does not contain, show, or access third-party content" → check |

---

## 2. App Store — Pricing & Availability

- **Price**: Free
- **Availability**: México (only) en el primer release. Luego puedes
  agregar más países.

---

## 3. App Store — Privacy

### 3.1 Privacy Policy URL

```
https://www.vuelvecasa.com/privacidad
```

### 3.2 App Privacy "nutrition labels" — chuleta para clickear

Apple te pregunta para CADA categoría:
1. **Do you collect this data?** (Yes/No)
2. Si Yes:
   - **Linked to user?** (Yes/No) — si lo asocias con un userId, Yes.
   - **Used for tracking?** (Yes/No) — TODO en NO (no vendes datos).
   - **Purposes**: marca uno o más de la lista.

Sigue esta tabla **EXACTAMENTE**:

| Categoría → Tipo | Collect? | Linked | Tracking | Purposes |
|---|:---:|:---:|:---:|---|
| Contact Info → **Email Address** | Yes | Yes | No | App Functionality, Account Management |
| Contact Info → **Name** | Yes | Yes | No | App Functionality |
| Contact Info → **Phone Number** | Yes | Yes | No | App Functionality (contacto del caso) |
| Identifiers → **User ID** | Yes | Yes | No | App Functionality |
| Identifiers → **Device ID** | Yes | Yes | No | App Functionality (push tokens) |
| Location → **Coarse Location** | Yes | Yes | No | App Functionality (alertas por zona) |
| Location → **Precise Location** | Yes | Yes | No | App Functionality (mapa de casos) |
| User Content → **Photos or Videos** | Yes | Yes | No | App Functionality |
| User Content → **Other User Content** | Yes | Yes | No | App Functionality (descripciones, chat) |
| Diagnostics → **Crash Data** | Yes | No | No | Analytics, App Functionality |
| Diagnostics → **Performance Data** | Yes | No | No | Analytics |

**Lo que NO debes declarar:**

- ❌ Financial Info (incluye Payment Info) — declararlo implica que procesas pagos en-app y Apple te exige IAP.
- ❌ Purchases / Purchase History.
- ❌ Sensitive Info (race, religion, sexual orientation, etc.) — no aplica.
- ❌ Health & Fitness.
- ❌ Search History, Browsing History.
- ❌ Audio Data, Gameplay Content.

**Tracking (sección final)**: marca
> "No, we do not collect data from this app for tracking purposes"

---

## 4. App Store — Versión 1.0

### 4.1 Promotional Text (170 chars, editable sin nuevo build)

```
Red comunitaria de México para reportar y encontrar mascotas perdidas. Alertas en tu zona, hilos por caso y comunidad de rescatistas verificados.
```

### 4.2 Description (4000 chars máx — usados ~1,750)

```
VuelveaCasa es la red comunitaria de México para reportar mascotas perdidas o encontradas y reunirlas con sus familias. Vecinos, rescatistas y veterinarias trabajando juntos en una sola plataforma, gratis y abierta para todos.

QUÉ PUEDES HACER:
• Reportar una mascota perdida o encontrada con foto, ubicación exacta y señas particulares.
• Recibir notificaciones cuando se reporte una mascota cerca de tu zona.
• Reportar avistamientos de mascotas que viste en la calle, sin tener que adoptar.
• Crear vistas guardadas con filtros (solo perros, solo tu colonia, etc.) para no perder de vista lo que importa.
• Hablar directamente sobre cada caso en hilos privados — sin spam, con moderación.
• Conversar en la comunidad nacional con cuentas verificadas.
• Acceso al directorio de veterinarias y rescatistas aliados de tu ciudad.

CONSTRUIDA PARA MÉXICO:
• Datos de ciudades, estados, alcaldías y colonias mexicanas.
• Idioma 100% español neutro.
• Operada desde la CDMX por gente que rescata todos los días.

PRIVACIDAD ANTES QUE NADA:
• No vendemos tus datos. Punto.
• Tu ubicación se usa solo para mostrarte casos cerca y, si lo activas, alertarte. Puedes apagarla en cualquier momento desde Ajustes.
• Tu cuenta se puede borrar permanentemente desde la app, sin pedirnos permiso.
• Moderación automática para evitar abuso, fraude y datos personales en publicaciones públicas.

SOBRE LAS DONACIONES:
La app es 100% gratuita. Si quieres apoyar el proyecto, hay un enlace al sitio web oficial donde puedes hacer una donación voluntaria. Las donaciones NO desbloquean ni amplían ninguna función dentro de la app — todas las funciones están disponibles para todos los usuarios, sin excepción ni nivel premium. VuelveaCasa no es donataria autorizada por SAT, las donaciones no son deducibles de impuestos.

¿DUDAS? Visita vuelvecasa.com/contacto — te respondemos en menos de 48h.
```

### 4.3 Keywords (100 chars con coma como separador, sin espacios después)

```
mascota,perdida,perro,gato,rescate,veterinaria,adopción,México,CDMX,encontrar
```

### 4.4 Support URL

```
https://www.vuelvecasa.com/contacto
```

### 4.5 Marketing URL

```
https://www.vuelvecasa.com
```

### 4.6 Copyright

```
2026 VuelveaCasa
```

### 4.7 Age Rating

Cuestionario → respuestas:
- Cartoon or Fantasy Violence → None
- Realistic Violence → None
- Sexual Content or Nudity → None
- Profanity or Crude Humor → None
- Alcohol, Tobacco, Drug Use or References → None
- Mature/Suggestive Themes → None
- Horror/Fear Themes → None
- Medical/Treatment Information → None
- Gambling → None
- Unrestricted Web Access → No (uso solo `Linking.openURL` controlado)
- Contests → No

Resultado: **4+**.

---

## 5. App Store — App Review Information

### 5.1 Sign-in info

- **Username**: `review-apple@vuelvecasa.com`
- **Password**: `fWRafvc62$Uh6&sx`

### 5.2 Notes (en inglés — copia exacta)

```
Hello App Review team,

VuelveaCasa is a free Mexican community platform for reporting lost and found
pets. The app does NOT process any payments in-app and does NOT unlock any
feature through donations.

DONATIONS — VERY IMPORTANT FOR THIS REVIEW

The app shows an informational screen labeled "Donar" (Donate) accessible from
the Home tab. This screen explains how the project operates and shows a single
button labeled "Apoyar en el sitio web" ("Support on our website").

That button uses React Native's Linking.openURL() to open the system's default
browser (Safari on iOS) with the URL https://www.vuelvecasa.com/donar — the
ENTIRE payment flow happens on the external website, OUTSIDE the app.

We do NOT use:
  • In-app purchases (StoreKit)
  • SafariViewController / WKWebView for the donation flow
  • Any embedded web view

You can verify by tapping the button: Safari opens with the URL bar visible,
and the address shows vuelvecasa.com — clearly outside the app.

Donations are 100% voluntary. They do NOT unlock, expand, or modify ANY feature
of the app. All features are free for all users, with no premium tier, no
subscription, and no in-app upsell.

VuelveaCasa is NOT a tax-verified non-profit organization in Mexico (we are
not "donataria autorizada SAT"). We do not issue tax-deductible receipts. We
are not seeking Apple Nonprofit verification because we operate as a regular
community platform, not a charity. All donations processed externally are
reported as ordinary income for the operator and follow Mexican tax law (LISR).

This architecture is by design and permanent. The app will never process
in-app payments for donations.

ACCOUNT DELETION

The app supports full account deletion (per Guideline 5.1.1(v)). Test it via:
  Profile tab → Settings → Eliminar cuenta → confirm.
This calls DELETE /api/v1/me which fully removes the user record and all
associated data from our servers within 30 days.

TEST ACCOUNT

  Email:    review-apple@vuelvecasa.com
  Password: fWRafvc62$Uh6&sx

Sign in with the above to access the full app. The "Donar" screen is visible
from the Home tab. Please verify the link opens Safari (system browser), not
an in-app web view.

CONTENT MODERATION

User-generated content (case descriptions, comments, chat messages) goes
through automated moderation via OpenAI's omni-moderation-latest model with
local rule fallbacks. Reports of inappropriate content auto-hide messages
after 3 distinct user reports.

Thank you for reviewing!

— VuelveaCasa team
  Contact form: https://www.vuelvecasa.com/contacto
  Reviewer-only email: canaya917@gmail.com
```

### 5.3 Demo Video (opcional — recomendado si tienes tiempo)

Screen recording de 60-90s mostrando:
1. Login.
2. Feed de casos.
3. Tap a un caso, ver detalle.
4. Tap "Donar" en Home tab → Safari abre con vuelvecasa.com → vuelve.
5. Crear un reporte.
6. Activar una alerta.
7. Profile → Settings → Eliminar cuenta (sin confirmar).

Sube como "App Review Attachment".

### 5.4 Sign-in Information — Contact

- **First Name**: Carlos
- **Last Name**: Anaya
- **Phone**: (tu teléfono)
- **Email**: canaya917@gmail.com

---

## 6. App Store — Si te rechazan

Códigos típicos y cómo responder:

### 3.1.1 (In-App Purchase)
> Hello, we do not process any in-app payments. Tapping "Apoyar en el sitio web" uses Linking.openURL which opens Safari (the system browser). The payment flow happens entirely on the external website https://www.vuelvecasa.com/donar. Please verify by tapping the button — Safari opens, not an in-app browser. Donations are 100% voluntary and do NOT unlock any feature. VuelveaCasa is not a tax-verified non-profit; donations are received as ordinary income for the operator.

Adjunta screen recording: tap → Safari abre → URL bar muestra vuelvecasa.com.

### 2.1 (Information Needed)
Te van a pedir info adicional. Responde lo que pidan en tono cordial.

### 5.1.1(v) (Account Deletion)
> Account deletion is available in the app: Profile → Settings → "Eliminar cuenta". This calls our DELETE /api/v1/me endpoint and fully removes the user record from our database. Please test with the provided review account.

### 4.2 (Minimal Functionality)
> The app has substantial functionality including case reporting, geofenced alerts, in-app chat, saved filter views, ally directory, and content moderation. Sample cases are loaded for review. Please test with the provided account.

Adjunta seed antes del resubmit (`db/seed/demo_casos.sql`).

### 2.3.10 (Accuracy)
Algo en la descripción no es preciso. Revisa que cada bullet de "QUÉ PUEDES HACER" coincida con una pantalla real del app.

---

## 7. Google Play Console — Store Listing

### 7.1 App details

| Campo | Valor |
|---|---|
| **App name** | `VuelveaCasa` |
| **Default language** | Spanish (Mexico) – es-MX |
| **App or game** | App |
| **Free or paid** | Free |

### 7.2 Short description (80 chars)

```
Red comunitaria mexicana para reportar y encontrar mascotas perdidas.
```

### 7.3 Full description

Misma que iOS §4.2 — copia y pega tal cual.

### 7.4 Categorization

- Application type: App
- Category: **Lifestyle**
- Tags: pet care, community

### 7.5 Contact details

- Email: `canaya917@gmail.com` (Play Console exige email real visible públicamente; el dominio aún no recibe entrante)
- Phone: opcional
- Website: `https://www.vuelvecasa.com/contacto`

### 7.6 Privacy Policy

```
https://www.vuelvecasa.com/privacidad
```

### 7.7 App access (login required)

- "All or some functionality is restricted" → Yes
- Username: `review-apple@vuelvecasa.com`
- Password: `fWRafvc62$Uh6&sx`
- Instructions: same notes as ASC §5.2 (puedes copiar el bloque inglés tal cual).

### 7.8 Ads

> "Does this app contain ads?" → **No**

### 7.9 Content rating questionnaire

- Violence: None
- Sexuality: None
- Profanity: None
- Drugs/Alcohol: None
- User-generated content: **Yes**
  - Live audio/video communication: No
  - Text chat: Yes (with moderation)
- Promotion of products: None
- Mature/suggestive themes: None
- Gambling: None

Resultado esperado: **PEGI 3 / Everyone**.

### 7.10 Target audience

- Age: **18+** (declarar 18+ evita complicaciones COPPA aunque la app sea
  segura para todas las edades).

### 7.11 News app

No.

### 7.12 COVID-19 contact tracing

No.

### 7.13 Data safety form

Mismas decisiones que ASC §3.2:

**Datos recolectados**:
| Tipo | Recolectado | Compartido | Procesamiento | Propósito |
|---|:---:|:---:|---|---|
| Email address | Required | No | Encrypted in transit | Account management |
| Name | Optional | No | Encrypted in transit | App functionality |
| Phone number | Optional | No | Encrypted in transit | App functionality (contacto del caso) |
| User IDs | Required | No | Encrypted in transit | App functionality |
| Approximate location | Optional | No | Encrypted in transit | App functionality |
| Precise location | Optional | No | Encrypted in transit | App functionality |
| Photos | Optional | No | Encrypted in transit | App functionality |
| Other UGC | Optional | No | Encrypted in transit | App functionality |
| Crash logs | Optional | No | Encrypted in transit | Analytics |
| Diagnostics | Optional | No | Encrypted in transit | Analytics |

- Encryption in transit: **Yes** (HTTPS).
- User can request deletion: **Yes** (in-app: Profile → Settings → Eliminar cuenta).

### 7.14 Government apps

No.

### 7.15 News apps

No.

### 7.16 Permissions justification (en Play Console "App content")

- `ACCESS_FINE_LOCATION`: para mostrar mapa de casos cerca del usuario y enviar alertas geofenced.
- `CAMERA`: para tomar foto al reportar un caso.
- `READ_MEDIA_IMAGES`: para subir foto desde galería al reportar.
- `POST_NOTIFICATIONS`: para enviar alertas de casos cercanos cuando el usuario las activa.

---

## 8. Google Play Console — Visual assets

| Asset | Tamaño | Notas |
|---|---|---|
| **App icon** | 512×512 PNG | Sin transparency |
| **Feature graphic** | 1024×500 PNG/JPG | Banner del store, prominentemente arriba |
| **Phone screenshots** | 1080×1920 mín, hasta 8 | Reutiliza los de iOS |
| **7" tablet** | opcional | |
| **10" tablet** | opcional | |

Mismas pantallas que iOS:
1. Hero del feed.
2. Detalle de un caso.
3. Crear reporte.
4. Alertas configuradas.
5. Comunidad / Vistas.
6. Perfil.

⚠️ **NO** screenshots de la pantalla "Donar".

---

## 9. EAS submit commands (referencia rápida)

### iOS

```bash
cd apps/mobile

# Si necesitas build nuevo (el actual es del 23-abr y debería servir):
npx eas-cli build -p ios --profile production

# Submit el último build a ASC:
npx eas-cli submit -p ios --latest

# Te pide:
#   - Apple ID (canaya917@gmail.com)
#   - App-specific password (genérala en https://appleid.apple.com → Sign-In and Security → App-Specific Passwords)
#   - O bien: ASC API Key (.p8 + Key ID + Issuer ID — ver §B8.1 del PRODUCTION_LAUNCH.md)
```

### Android

```bash
cd apps/mobile

# Build production AAB
npx eas-cli build -p android --profile production

# Submit a Play Console (Internal testing track por default)
npx eas-cli submit -p android --latest

# Pide service account JSON la primera vez (ver §B9.4 del PRODUCTION_LAUNCH.md)
```

---

## 10. Pre-flight final antes de tap "Submit for Review"

- [ ] Cuenta de prueba creada en Clerk y probada (login funciona).
- [ ] `db/seed/demo_casos.sql` aplicado en Supabase (12 casos visibles).
- [ ] Privacy Policy y Terms accesibles en `https://www.vuelvecasa.com/privacidad` y `/terminos`.
- [ ] DELETE /api/v1/me probado (la cuenta de prueba se puede borrar).
- [ ] Push notifications wired en EAS (APNs key + FCM JSON).
- [ ] Build production reciente y tested en device físico.
- [ ] Todos los campos de §3 (Privacy), §4 (Versión), §5 (Review Info)
      llenados con los bloques de arriba.
- [ ] Screenshots subidos (mínimo 3 en 6.9").
- [ ] Bundle de `apps/mobile` no contiene strings prohibidos
      (verificado el 2026-04-28 — ver `LAUNCH_CHECKLIST.md`).
