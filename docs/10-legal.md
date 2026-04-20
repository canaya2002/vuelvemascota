# 10 · Legal MX — Aviso de privacidad, términos y razón social

**Tiempo estimado:** 1–2 horas (ajustes de texto) + tiempos externos si constituyes persona moral (4–8 semanas AC).
**Costo:** $0 si solo ajustas plantillas; $5,000–15,000 MXN si contratas abogado para revisar; $10,000–25,000 MXN + notario para constituir AC.

**Disclaimer**: este documento es una guía operativa para que sepas qué cambiar y qué te falta por decidir. **No sustituye** asesoría legal. Para lanzar con donaciones reales, una revisión por abogado mexicano es recomendable.

---

## 10.1 · Decisión inicial: ¿bajo qué figura operas?

Tres niveles, en orden de complejidad:

| Figura | Puedes cobrar donaciones | Donaciones deducibles | Requiere | Ideal para |
|---|---|---|---|---|
| **Persona física con actividad empresarial** | Sí | No | RFC, CLABE | Arrancar rápido, validar demanda |
| **Asociación Civil (AC)** | Sí | No hasta tener autorización SAT | Acta constitutiva ante notario, RFC AC | Cuando tengas volumen y equipo |
| **AC + Donataria Autorizada SAT** | Sí | Sí (emites CFDI con régimen 601) | Autorización SAT después de 1–3 años de operación | Cuando quieras ofrecer deducibilidad |

**Fase 1 pragmática:** arranca como **persona física**. Ya tienes RFC y cuenta bancaria. Las donaciones **no** serán deducibles, lo declaras claramente. Cuando tengas tracción, escalas a AC.

---

## 10.2 · Qué cambiar en `src/lib/site.ts`

Hoy:
```ts
legal: {
  razonSocial: "VuelveaCasa México",
},
```

Si eres persona física:
```ts
legal: {
  razonSocial: "Carlos Anaya Ruiz", // tu nombre legal
  rfc: "AARCXXXXXX00X",             // tu RFC
  formaLegal: "Persona física con actividad empresarial",
  domicilio: "Calle xxx, Colonia xxx, CP xxxxx, Ciudad de México, México",
},
```

Si AC:
```ts
legal: {
  razonSocial: "VuelveaCasa México, A.C.",
  rfc: "VCA250101ABC",
  formaLegal: "Asociación Civil",
  domicilio: "...",
  registro: "N.º de folio ante RPP ...",
},
```

---

## 10.3 · Aviso de privacidad — ajustes obligatorios

Abre `src/app/privacidad/page.tsx` y reemplaza literalmente:

### 10.3.1 Sección "Responsable"

```tsx
<h2>1. Responsable del tratamiento</h2>
<p>
  [RAZÓN SOCIAL COMPLETA] (en adelante "VuelveaCasa"), con domicilio en
  [CALLE Y NÚMERO, COLONIA, CP, MUNICIPIO/ALCALDÍA, ESTADO, MÉXICO],
  es responsable del tratamiento de sus datos personales conforme a la
  Ley Federal de Protección de Datos Personales en Posesión de los
  Particulares (LFPDPPP).
</p>
```

### 10.3.2 Datos recabados — ser específico

Adecua a lo que realmente guardas (el sitio **sí** guarda):

- Nombre, correo, ciudad y rol (waitlist).
- Nombre, correo, teléfono (opcional), tema, mensaje (contacto).
- Datos de aliados: organización, responsable, correo, teléfono, ciudad, sitio.
- Datos de donaciones: tokenizados por Stripe (nunca tarjeta completa en nuestro server).
- Datos de navegación anónimos (IP anonimizada, user agent) si activas GA4.

### 10.3.3 Finalidades primarias vs secundarias

La LFPDPPP distingue:

- **Primarias** (no necesitas consentimiento explícito adicional): operar la plataforma, procesar donaciones, responder contacto, enviar notificaciones de casos.
- **Secundarias** (requieren checkbox separado): marketing, newsletters, encuestas.

Si envías emails de marketing (newsletter), añade al formulario de waitlist un checkbox **distinto** para "Acepto recibir comunicaciones informativas y noticias". Hoy el checkbox único cubre ambos; para cumplimiento fino, sepáralo.

### 10.3.4 Derechos ARCO

Obligatorio explicar cómo ejercerlos:

```tsx
<h2>4. Derechos ARCO</h2>
<p>Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al
tratamiento de sus datos personales (derechos ARCO). Para ejercerlos,
envíe su solicitud a <a href="mailto:hola@vuelveacasa.mx">hola@vuelveacasa.mx</a>
indicando:</p>
<ul>
  <li>Nombre completo y domicilio para recibir respuesta.</li>
  <li>Copia de identificación oficial (INE, pasaporte).</li>
  <li>Descripción clara del derecho que desea ejercer.</li>
  <li>Elementos que permitan identificar los datos a los que se refiere.</li>
</ul>
<p>Atenderemos su solicitud en un plazo máximo de 20 días hábiles conforme al artículo 32 LFPDPPP.</p>
```

### 10.3.5 Transferencias a terceros

Obligatorio listar nominalmente:

```tsx
<h2>5. Terceros con los que compartimos</h2>
<ul>
  <li><strong>Stripe Payments Mexico, S. de R.L. de C.V.</strong> — procesamiento de donaciones.</li>
  <li><strong>Resend Inc.</strong> — envío de correos transaccionales.</li>
  <li><strong>Supabase Inc.</strong> (si lo activas) — almacenamiento de datos.</li>
  <li><strong>Vercel Inc.</strong> — hosting y entrega del sitio.</li>
  <li><strong>Google Ireland Ltd.</strong> (si activas GA4) — analítica anónima.</li>
</ul>
<p>Cada uno actúa bajo contrato de encargado de tratamiento y con medidas de seguridad equivalentes a las nuestras.</p>
```

### 10.3.6 INAI y último párrafo

```tsx
<p>Si considera que su derecho a la protección de datos ha sido
vulnerado, puede acudir al Instituto Nacional de Transparencia,
Acceso a la Información y Protección de Datos Personales (INAI):
<a href="https://home.inai.org.mx/" target="_blank" rel="noopener noreferrer">home.inai.org.mx</a>.</p>
<p>Última actualización: [FECHA].</p>
```

---

## 10.4 · Términos y condiciones — ajustes

`src/app/terminos/page.tsx`:

### 10.4.1 Jurisdicción

Añade sección final:

```tsx
<h2>9. Jurisdicción y ley aplicable</h2>
<p>Para cualquier controversia derivada de estos términos, las partes se
someten expresamente a las leyes federales de los Estados Unidos
Mexicanos y a la jurisdicción de los tribunales competentes en
[CIUDAD DE TU DOMICILIO], renunciando a cualquier otra jurisdicción.</p>
```

### 10.4.2 Donaciones

Haz explícito:

```tsx
<h2>4. Donaciones</h2>
<p>Las donaciones son actos voluntarios y unilaterales. Se procesan por
Stripe Payments Mexico. VuelveaCasa no emite recibos deducibles fiscalmente
a menos que así se anuncie expresamente. Publicamos reportes periódicos
de uso del fondo comunitario.</p>
<p>Las donaciones recurrentes se cobran mensualmente hasta que el donante
las cancele desde el correo de confirmación o contactando a
<a href="mailto:hola@vuelveacasa.mx">hola@vuelveacasa.mx</a>.</p>
```

### 10.4.3 Contenido de usuarios

Queda como está, pero añade:

```tsx
<p>El usuario declara que las fotografías, descripciones y datos que
publica son verídicos. Publicar información falsa o suplantar identidad
es causa inmediata de baja y puede acarrear responsabilidades penales.</p>
```

---

## 10.5 · Texto corto que debes colocar en `/donar`

Justo abajo del widget, añade un disclaimer visible:

```tsx
<p className="text-xs text-[var(--muted)]">
  VuelveaCasa opera como {SITE.legal.formaLegal} ({SITE.legal.razonSocial},
  RFC {SITE.legal.rfc}). Las donaciones son voluntarias y no son deducibles
  de impuestos mientras no se cuente con autorización SAT. Nuestros
  reportes de uso se publican en /donar#transparencia.
</p>
```

Para esto, primero amplía `SITE.legal` en `site.ts` (sección 10.2).

---

## 10.6 · Registro ante INAI (opcional pero buena señal)

El "Aviso de Privacidad Integral" no se registra formalmente, pero puedes dar de alta tu aviso en el **Sistema Persona** del INAI:

1. <https://home.inai.org.mx/?page_id=1649> → Persona Titular de Datos.
2. Es voluntario; aporta trust signal a aliados corporativos.

---

## 10.7 · Cookies

Con solo GA4 con `anonymize_ip: true` y sin retargeting, el banner **no es estrictamente obligatorio** en MX. Conviene si:

- Operas en UE (GDPR).
- Haces retargeting con píxeles que dejan cookies persistentes.
- Quieres anticiparte a un INAI más estricto (algunos estados ya lo requieren).

Implementación simple con Klaro o CookieYes (ver doc 08).

---

## 10.8 · Ruta a donataria autorizada SAT (cuando quieras)

Requisitos (artículo 82 LISR + RMF):

1. **Ser AC ya constituida** con al menos **1 año** de operación y objeto social compatible con actividades asistenciales (cuidado animal sí aplica).
2. Solicitud formal al SAT con documentación: acta constitutiva, RFC, pruebas de actividad social.
3. El SAT publica lista anual de donatarias en el DOF.
4. Una vez autorizada, emites CFDI régimen 601 y los donantes deducen hasta 7% de sus ingresos.

Fase 2–3. Arranca sin esto.

---

## 10.9 · Revisión profesional (recomendada)

Si puedes invertir $5,000–10,000 MXN:

- Un abogado corporativo te revisa privacidad, términos y política de donaciones.
- Plataformas de abogado por hora en MX: **Lemontech**, **Rappi Legal**, **Legal Easy**. Opción barata: abogado junior freelance en LinkedIn o Upwork.
- Lo que pides: "Revisión de aviso de privacidad LFPDPPP, términos y condiciones de plataforma web de donaciones, y recomendaciones para figura jurídica en fase inicial".

---

## 10.10 · Textos de emergencia en el sitio

Añade a `/faq` (ya existe) estas preguntas específicas si no están:

- ¿Las donaciones son deducibles? → No en fase 1. Explicación.
- ¿Qué pasa con mis datos si me borro? → Explicación de derechos ARCO.
- ¿Por qué piden la ubicación? → Radio de difusión, nunca dirección exacta.

---

## 10.11 · Checklist legal

- [ ] Decidiste figura legal de arranque (persona física recomendado).
- [ ] RFC y CLABE listos para Stripe.
- [ ] `SITE.legal` actualizado con razón social, RFC, domicilio.
- [ ] `privacidad/page.tsx` ajustado con secciones 10.3.1 a 10.3.6.
- [ ] `terminos/page.tsx` ajustado con secciones 10.4.1 a 10.4.3.
- [ ] Disclaimer de "no deducible" visible en `/donar`.
- [ ] Fecha "Última actualización" puesta en ambos documentos.
- [ ] Revisión por abogado (opcional pero recomendada antes de ads pagados).
- [ ] Plan a 12 meses: constituir AC si la tracción lo justifica.
