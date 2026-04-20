# 04 · Supabase — Base de datos real (opcional ahora)

**Tiempo estimado:** 45 min.
**Costo:** free tier cubre 500 MB de Postgres, 2 GB de transferencia y 50,000 MAU. Fase 1 cabe cómodamente.
**Qué queda funcionando:** waitlist, contactos, aliados y donaciones persisten. Puedes leer desde el dashboard o desde SQL.

Sin Supabase, `src/lib/db.ts` solo loggea en consola. El sitio funciona igual, solo no persiste.

---

## 4.1 · Crear proyecto

1. <https://supabase.com> → **Start your project** → autentica con GitHub.
2. **New project**:
   - Name: `vuelveacasa-prod`
   - Database Password: genera una fuerte y guárdala en tu gestor. La vas a necesitar para la connection string.
   - Region: **`us-east-1 (N. Virginia)`** o **`sa-east-1 (São Paulo)`** — lo más cercano a MX. `us-east-1` suele ser mejor latencia combinada con Vercel (que por default corre ahí).
   - Plan: **Free**.
3. Espera ~2 min a que aprovisione.

---

## 4.2 · Crear las tablas

1. Dashboard del proyecto → **SQL Editor** → **New query**.
2. Pega este SQL tal cual y ejecuta (clic en **Run**):

```sql
-- UUIDs
create extension if not exists "pgcrypto";

-- Waitlist
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  ciudad text not null,
  rol text not null check (rol in ('dueño','encontre','voluntario','rescatista','veterinaria','aliado')),
  acepta boolean not null default true,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create unique index if not exists waitlist_email_unique on waitlist (lower(email));

-- Contacto
create table if not exists contacto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono text,
  tema text not null,
  mensaje text not null,
  ip text,
  created_at timestamptz not null default now()
);
create index if not exists contacto_created_at_idx on contacto (created_at desc);

-- Aliados (rescatistas, veterinarias, patrocinadores)
create table if not exists aliados (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('rescatistas','veterinarias','aliados')),
  organizacion text not null,
  responsable text not null,
  email text not null,
  telefono text not null,
  ciudad text not null,
  sitio text,
  notas text,
  estado text not null default 'pendiente' check (estado in ('pendiente','verificado','rechazado')),
  created_at timestamptz not null default now()
);
create index if not exists aliados_tipo_estado on aliados (tipo, estado);

-- Donaciones
create table if not exists donaciones (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  stripe_subscription_id text,
  email text,
  amount integer not null,                  -- en MXN (pesos enteros)
  currency text not null default 'mxn',
  causa text not null check (causa in ('fondo','emergencia','rescate')),
  recurrente boolean not null default false,
  status text not null default 'pending' check (status in ('pending','completed','failed','refunded')),
  raw jsonb,
  created_at timestamptz not null default now()
);
create index if not exists donaciones_status on donaciones (status);
create index if not exists donaciones_causa on donaciones (causa);

-- RLS: bloqueado desde el API público; solo acceso desde server-side con service_role.
alter table waitlist enable row level security;
alter table contacto enable row level security;
alter table aliados enable row level security;
alter table donaciones enable row level security;
-- (no policies = nadie puede leer/escribir desde el anon key; el backend usa service_role y bypass-ea RLS.)
```

3. Verifica en **Table Editor** que las 4 tablas aparezcan.

---

## 4.3 · Connection string

1. Dashboard → **Project Settings** (engranaje) → **Database**.
2. Copia **Connection string → URI** (formato `postgresql://postgres:<password>@db.<proj>.supabase.co:5432/postgres`).
3. Reemplaza `<password>` con el que guardaste en 4.1.
4. Para Vercel (que arma conexiones por request), usa el modo **Connection pooling → Transaction**:
   - Dashboard → Database → **Connection Pooling** → copia la URL del modo Transaction (puerto `6543`).
   - Esa es la que pegamos en `DATABASE_URL` porque Vercel funciones no pueden mantener conexiones persistentes.

En `.env.local` y Vercel:
```env
DATABASE_URL=postgresql://postgres.<proj>:<password>@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

---

## 4.4 · Instalar cliente SQL

Mejor opción para Vercel/Edge-compatible: **`postgres`** (Porsager, ligero).

```bash
npm i postgres
```

---

## 4.5 · Implementar `src/lib/db.ts`

Reemplaza el stub con esto:

```ts
import postgres from "postgres";
import type { WaitlistInput, ContactInput, AllyInput } from "./validations";

const connectionString = process.env.DATABASE_URL;

// Singleton seguro en hot-reload.
const globalForDb = globalThis as unknown as { _sql?: ReturnType<typeof postgres> };
const sql =
  globalForDb._sql ??
  (connectionString
    ? postgres(connectionString, { prepare: false, idle_timeout: 20, max: 1 })
    : null);
if (!globalForDb._sql && sql) globalForDb._sql = sql;

export type DonationRecord = {
  stripe_session_id: string;
  amount: number;
  currency: string;
  causa: string;
  recurrente: boolean;
  email?: string;
  status: "pending" | "completed" | "failed";
};

export const db = {
  async insertWaitlist(data: WaitlistInput) {
    if (!sql) {
      console.log("[db:waitlist:stub]", data);
      return { ok: true };
    }
    try {
      await sql`
        insert into waitlist (nombre, email, ciudad, rol, acepta)
        values (${data.nombre}, ${data.email}, ${data.ciudad}, ${data.rol}, ${data.acepta})
        on conflict ((lower(email))) do update set
          nombre = excluded.nombre, ciudad = excluded.ciudad, rol = excluded.rol
      `;
      return { ok: true };
    } catch (err) {
      console.error("[db:waitlist:error]", err);
      return { ok: false };
    }
  },
  async insertContact(data: ContactInput) {
    if (!sql) { console.log("[db:contacto:stub]", data); return { ok: true }; }
    await sql`
      insert into contacto (nombre, email, telefono, tema, mensaje)
      values (${data.nombre}, ${data.email}, ${data.telefono}, ${data.tema}, ${data.mensaje})
    `;
    return { ok: true };
  },
  async insertAlly(data: AllyInput & { tipo: string }) {
    if (!sql) { console.log("[db:aliados:stub]", data); return { ok: true }; }
    await sql`
      insert into aliados (tipo, organizacion, responsable, email, telefono, ciudad, sitio, notas)
      values (${data.tipo}, ${data.organizacion}, ${data.responsable}, ${data.email}, ${data.telefono}, ${data.ciudad}, ${data.sitio}, ${data.notas})
    `;
    return { ok: true };
  },
  async insertDonation(data: DonationRecord) {
    if (!sql) { console.log("[db:donaciones:stub]", data); return { ok: true }; }
    await sql`
      insert into donaciones (stripe_session_id, email, amount, currency, causa, recurrente, status)
      values (${data.stripe_session_id}, ${data.email ?? null}, ${data.amount}, ${data.currency}, ${data.causa}, ${data.recurrente}, ${data.status})
      on conflict (stripe_session_id) do update set status = excluded.status
    `;
    return { ok: true };
  },
};
```

El patrón mantiene la compatibilidad con el stub (si `DATABASE_URL` no está, solo loggea).

---

## 4.6 · Seguridad

- Las tablas tienen **RLS habilitado sin policies** → no son leíbles desde el anon key. Solo el backend (service_role, implícito en la URL con password) puede escribir.
- No expongas `DATABASE_URL` en el cliente (no uses el prefijo `NEXT_PUBLIC_`).
- Si quieres que el equipo vea los datos desde Supabase UI, crea **usuarios en el proyecto** (Settings → Team) con permisos Developer.

---

## 4.7 · Monitoreo y backups

- Supabase hace snapshots diarios automáticos en el plan free (retención 7 días).
- Si quieres backups en tu lado: Project Settings → Database → **Backups** → download.
- Observabilidad: Reports → Queries para ver latencias; Logs → Postgres para errores.

---

## 4.8 · Alternativas

- **Neon** (<https://neon.tech>): Postgres serverless con free tier generoso, branches por rama (útil si quieres DB de preview por cada PR). Mejor DX para Vercel.
- **Vercel Postgres**: Postgres gestionado desde Vercel. Integración perfecta, free tier limitado.
- En cualquiera, el código de `src/lib/db.ts` usa `postgres` cliente y cambia solo la connection string.

---

## 4.9 · Checklist Supabase

- [ ] Proyecto creado en región cercana (us-east-1).
- [ ] SQL de 4.2 ejecutado, 4 tablas visibles.
- [ ] `DATABASE_URL` con connection pooling (puerto 6543) en Vercel.
- [ ] `npm i postgres` corrido.
- [ ] `src/lib/db.ts` reemplazado por la versión de 4.5.
- [ ] `npm run build` pasa.
- [ ] Prueba: mandar waitlist → aparece fila en `select * from waitlist`.
- [ ] Donación live de prueba → fila `status=completed` en `donaciones`.
