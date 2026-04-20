# 12 · Casos con fotos y mapa (Sprint 2.1)

**Tiempo estimado:** 30 min (Storage bucket + schema).
**Costo:** $0 — Supabase Storage free tier 1 GB + 5 GB/mes de egress. OpenStreetMap gratis y sin API key.
**Qué queda funcionando:** usuarios autenticados crean reportes con mapa y hasta 6 fotos. Las páginas `/casos/[slug]` se indexan y son compartibles. `/casos` es el listado público con filtros. Avistamientos llegan al dueño.

---

## 12.1 · Pre-requisitos

1. **Fase 1 deployada** (SETUP completo).
2. **Docs 04-supabase** corrido (proyecto creado + `DATABASE_URL`).
3. **Docs 11-auth** corrido (Clerk activo + webhook sincronizando a tabla `usuarios`).

---

## 12.2 · Ejecutar el schema completo

El archivo `db/schema.sql` ya contiene Fase 1 + Fase 2. Si lo corriste antes, los `create table if not exists` son idempotentes — puedes correrlo de nuevo para añadir las tablas nuevas (`usuarios`, `casos`, `caso_fotos`, etc.).

1. Supabase → **SQL Editor** → **New query**.
2. Pega el contenido de `db/schema.sql`.
3. **Run**.
4. Verifica en **Table Editor** que aparecen: `casos`, `caso_fotos`, `caso_avistamientos`, `caso_updates`, `alertas`, `alerta_envios`, `caso_matches`, `usuarios`.

---

## 12.3 · Bucket de Supabase Storage

1. Supabase → **Storage** → **New bucket**.
2. Name: `casos`.
3. **Public bucket** → ON (las fotos se ven sin login).
4. File size limit: 5 MB (recomendado).
5. Allowed MIME types: `image/*`.
6. **Create**.

Permisos (opcional pero recomendado): Storage → el bucket → **Policies** → deja las policies default "public read" para `SELECT` (no hace falta INSERT/UPDATE policy porque el backend usa service role).

---

## 12.4 · Env vars para Storage

1. Supabase → **Project Settings** → **API** → copia:
   - **Project URL** → `SUPABASE_URL=https://<proj>.supabase.co`
   - **Service role** (sección "Project API keys", el segundo) → `SUPABASE_SERVICE_ROLE=<eyJ...>`
2. En `.env.local` y Vercel (Production + Preview):
   ```env
   SUPABASE_URL=https://<proj>.supabase.co
   SUPABASE_SERVICE_ROLE=<service_role_jwt>
   ```

> **IMPORTANTE**: `SUPABASE_SERVICE_ROLE` salta RLS. Nunca la expongas al cliente (no le pongas prefix `NEXT_PUBLIC_`). Nuestro wrapper (`src/lib/storage.ts`) la usa solo en server actions / route handlers.

---

## 12.5 · Probar crear un caso

1. `npm run dev`.
2. Crea una cuenta en `/crear-cuenta` (si no lo has hecho).
3. Ve a `/panel/casos/nuevo`.
4. Selecciona tipo **Mascota perdida** → Especie **Perro**.
5. Llena nombre, color, fecha.
6. Selecciona una ciudad y ajusta el marcador del mapa.
7. Sube 1–3 fotos.
8. Agrega tu WhatsApp de prueba.
9. **Publicar caso**.
10. Te redirige a `/casos/<slug>`. Verifica:
    - Fotos cargan (si 403, revisa que el bucket sea público).
    - Mapa con el radio se pinta.
    - Botones de WhatsApp funcionan.
    - El caso aparece en `/casos`.
    - En Supabase → Table Editor → `casos` tiene una fila.

---

## 12.6 · Compartir casos

Cada `/casos/<slug>` trae:

- Metadata OG específica (fotos, título, descripción).
- `ShareButtons` con WhatsApp / Facebook / copiar link.
- JSON-LD `LostPost` / `FoundPost` para Search Console y Rich Results.

Para medir conversiones por compartido, los links de ShareButtons soportan añadir UTMs si los concatenas (próxima iteración).

---

## 12.7 · Avistamientos anónimos

`/casos/[slug]` incluye `AvistamientoForm`. Cualquier visitante (con o sin cuenta) puede reportar un avistamiento. Llega a la tabla `caso_avistamientos` y aparece en la página del caso. En Sprint 2.3 añadiremos notificación automática al dueño.

---

## 12.8 · Imágenes via Next/Image

`next.config.ts` ya permite:
- `*.supabase.co/storage/v1/object/public/**` → fotos de casos.
- `img.clerk.com` / `images.clerk.dev` → avatares.

Si cambias de bucket a private o usas otro CDN, actualiza `remotePatterns`.

---

## 12.9 · Moderación y admin

Por ahora no hay UI de moderación. Para moderar manualmente:

```sql
-- Marcar caso como archivado (no aparece en listados)
update casos set estado = 'archivado' where slug = '<slug>';

-- Destacar un caso (aparece primero en /casos)
update casos set destacado = true where slug = '<slug>';

-- Reencontrado
update casos set estado = 'reencontrado' where slug = '<slug>';

-- Borrar avistamiento falso
update caso_avistamientos set estado = 'descartado' where id = '<uuid>';
```

Sprint 2.4 (roadmap): panel admin en `/panel/admin` con los mismos botones.

---

## 12.10 · Limits y rate-limiting

El middleware (`src/proxy.ts`) ya rate-limitaba waitlist/contacto/donar. Para Sprint 2.1 deberías añadir `/api/casos` y server actions propias. Por ahora, Clerk + tu DB limitan el abuso natural (1 usuario = 1 cuenta).

Si necesitas bloqueo más estricto, añade:

```sql
-- Evitar spam de avistamientos
create index if not exists avistamientos_ip_hour
  on caso_avistamientos ((date_trunc('hour', created_at)));
```

Y en la action, chequea `select count(*) from caso_avistamientos where autor_contacto = ? and created_at > now() - interval '1 hour'`.

---

## 12.11 · Checklist Sprint 2.1

- [ ] Schema Fase 2 aplicado en Supabase.
- [ ] Bucket `casos` creado y público.
- [ ] `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE` en `.env.local` y Vercel.
- [ ] Crear cuenta → aparece en tabla `usuarios`.
- [ ] Crear caso con fotos funciona.
- [ ] Caso se muestra en `/casos` y en `/casos/<slug>`.
- [ ] Avistamiento de visitante se guarda en `caso_avistamientos`.
- [ ] Search Console → pedir indexación de `/casos` y un caso real (una vez que haya).
- [ ] Enlaces WhatsApp/Facebook desde ShareButtons funcionan.

---

## 12.12 · Pendientes para Sprint 2.2+

- [ ] Edición de caso (`/panel/casos/[slug]/editar`) con subida/borrado de fotos.
- [ ] Cerrar / reencontrado / archivar desde el panel.
- [ ] Matching automático perdida ↔ encontrada (tabla `caso_matches`).
- [ ] Notificación de avistamiento al dueño por email.
- [ ] Alertas por zona cuando entra un caso nuevo al radio del usuario.
- [ ] Donaciones por caso específico (pasar `caso_id` al Checkout de Stripe y enganchar con `donaciones.caso_id`).
- [ ] Directorio público de aliados `/aliados/[slug]`.
- [ ] Consent banner + GA4 events para "caso creado" y "avistamiento enviado".
