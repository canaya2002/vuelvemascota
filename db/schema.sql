-- ============================================================================
-- VuelveaCasa — Schema completo Fase 1 + Fase 2
-- Postgres 14+ (Supabase / Neon / Vercel Postgres)
-- Correr en el SQL editor de Supabase tal cual.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- Fase 1: formularios públicos
-- ---------------------------------------------------------------------------

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
  slug text unique,                            -- para /aliados/[slug] una vez verificados
  created_at timestamptz not null default now()
);
-- Migración incremental: si aliados existía antes sin slug.
alter table aliados add column if not exists slug text;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'aliados_slug_key'
  ) then
    alter table aliados add constraint aliados_slug_key unique (slug);
  end if;
end$$;
create index if not exists aliados_tipo_estado on aliados (tipo, estado);

create table if not exists donaciones (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  stripe_subscription_id text,
  email text,
  amount integer not null,                     -- en MXN (pesos enteros)
  currency text not null default 'mxn',
  causa text not null check (causa in ('fondo','emergencia','rescate')),
  recurrente boolean not null default false,
  status text not null default 'pending' check (status in ('pending','completed','failed','refunded')),
  caso_id uuid,                                -- opcional: donación ligada a un caso específico (Sprint 2.5)
  raw jsonb,
  created_at timestamptz not null default now()
);
-- Migración incremental: si donaciones existía de una versión anterior sin estas columnas.
alter table donaciones add column if not exists stripe_subscription_id text;
alter table donaciones add column if not exists caso_id uuid;
alter table donaciones add column if not exists raw jsonb;
create index if not exists donaciones_status on donaciones (status);
create index if not exists donaciones_causa on donaciones (causa);
create index if not exists donaciones_caso_id on donaciones (caso_id);

-- ---------------------------------------------------------------------------
-- Fase 2: usuarios (sincronizados con Clerk)
-- ---------------------------------------------------------------------------

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,          -- id de Clerk (source of truth)
  email text not null,
  nombre text,
  ciudad text,
  rol text,                                    -- 'dueño'|'voluntario'|'rescatista'|'veterinaria'|'admin'
  telefono text,
  foto_url text,
  bio text,
  verificado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists usuarios_email_unique on usuarios (lower(email));

-- ---------------------------------------------------------------------------
-- Fase 2: casos (perdidas, encontradas, avistamientos)
-- ---------------------------------------------------------------------------

create table if not exists casos (
  id uuid primary key default gen_random_uuid(),
  slug text unique,                            -- /casos/[slug], ej. firulais-coyoacan-a1b2
  tipo text not null check (tipo in ('perdida','encontrada','avistamiento')),
  especie text not null check (especie in ('perro','gato','otro')),
  nombre text,                                 -- nombre de la mascota (si se conoce)
  raza text,
  color text,
  tamano text check (tamano in ('chico','mediano','grande') or tamano is null),
  edad_aprox text,
  sexo text check (sexo in ('hembra','macho','desconocido') or sexo is null),
  senas text,                                  -- texto libre de señas
  descripcion text,
  fecha_evento date not null,                  -- fecha de extravío o hallazgo
  ciudad text not null,
  municipio text,                              -- alcaldía (CDMX) o municipio (resto)
  colonia text,
  lat numeric(10,7),                           -- latitud
  lng numeric(10,7),                           -- longitud
  radio_m integer default 2000,                -- radio de difusión en metros
  tiene_chip boolean,
  tiene_collar boolean,
  contacto_nombre text,
  contacto_telefono text,
  contacto_whatsapp text,
  contacto_email text,
  estado text not null default 'activo' check (estado in ('activo','cerrado','reencontrado','archivado')),
  creado_por uuid references usuarios(id) on delete set null,
  meta_donacion integer,                       -- meta monto MXN (Sprint 2.5)
  donado_mxn integer not null default 0,       -- total donado al caso (reconciliado por webhook)
  vistas integer not null default 0,
  destacado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists casos_tipo_estado on casos (tipo, estado);
-- Migración incremental: si la DB ya existía sin estas columnas, add them.
alter table casos add column if not exists estado text;
alter table casos add column if not exists municipio text;
alter table casos add column if not exists meta_donacion integer;
alter table casos add column if not exists donado_mxn integer not null default 0;
alter table casos add column if not exists vistas integer not null default 0;
alter table casos add column if not exists destacado boolean not null default false;

create index if not exists casos_ciudad_estado on casos (ciudad, estado);
create index if not exists casos_estado on casos (estado) where estado is not null;
create index if not exists casos_municipio on casos (municipio) where municipio is not null;
create index if not exists casos_fecha on casos (fecha_evento desc);
create index if not exists casos_creado_por on casos (creado_por);
-- Búsqueda full-text ligera
create index if not exists casos_texto_trgm on casos using gin ((coalesce(nombre,'') || ' ' || coalesce(descripcion,'') || ' ' || coalesce(senas,'') || ' ' || coalesce(raza,'') || ' ' || coalesce(color,'')) gin_trgm_ops);

-- Fotos de cada caso (Sprint 2.1)
create table if not exists caso_fotos (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references casos(id) on delete cascade,
  url text not null,                           -- URL en Supabase Storage / Vercel Blob
  orden integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists caso_fotos_caso on caso_fotos (caso_id, orden);

-- Avistamientos / pistas agregadas a un caso
create table if not exists caso_avistamientos (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references casos(id) on delete cascade,
  autor_usuario_id uuid references usuarios(id) on delete set null,
  autor_nombre text,
  autor_contacto text,
  lat numeric(10,7),
  lng numeric(10,7),
  fecha_avistado timestamptz not null,
  descripcion text not null,
  foto_url text,
  estado text not null default 'pendiente' check (estado in ('pendiente','confirmado','descartado')),
  created_at timestamptz not null default now()
);
create index if not exists avistamientos_caso on caso_avistamientos (caso_id, created_at desc);

-- Actualizaciones / comentarios del dueño sobre el caso (timeline)
create table if not exists caso_updates (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references casos(id) on delete cascade,
  autor_usuario_id uuid references usuarios(id) on delete set null,
  mensaje text not null,
  created_at timestamptz not null default now()
);
create index if not exists caso_updates_caso on caso_updates (caso_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Fase 2: alertas por zona (Sprint 2.3)
-- ---------------------------------------------------------------------------

create table if not exists alertas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  ciudad text,
  colonia text,
  lat numeric(10,7),
  lng numeric(10,7),
  radio_m integer not null default 3000,
  especies text[] not null default array['perro','gato','otro'],
  canales text[] not null default array['email'],  -- 'email','push','whatsapp'
  activa boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists alertas_usuario on alertas (usuario_id);
create index if not exists alertas_activa on alertas (activa) where activa;

-- Registro de envíos para throttling y métricas
create table if not exists alerta_envios (
  id uuid primary key default gen_random_uuid(),
  alerta_id uuid not null references alertas(id) on delete cascade,
  caso_id uuid not null references casos(id) on delete cascade,
  canal text not null,
  exitoso boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists alerta_envios_unique on alerta_envios (alerta_id, caso_id, canal);

-- ---------------------------------------------------------------------------
-- Fase 2 · Sprint 2.7: suscripciones Web Push
-- ---------------------------------------------------------------------------

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuarios(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_used timestamptz
);
create index if not exists push_sub_usuario on push_subscriptions (usuario_id);

-- ---------------------------------------------------------------------------
-- Fase 2: matching entre casos perdida ↔ encontrada (Sprint 2.4)
-- ---------------------------------------------------------------------------

create table if not exists caso_matches (
  id uuid primary key default gen_random_uuid(),
  caso_a uuid not null references casos(id) on delete cascade,
  caso_b uuid not null references casos(id) on delete cascade,
  score numeric(4,3) not null,                 -- 0.000–1.000
  razones jsonb,                               -- {"especie":true,"color":0.8,"distancia_km":1.4}
  estado text not null default 'sugerido' check (estado in ('sugerido','confirmado','descartado')),
  created_at timestamptz not null default now(),
  constraint caso_matches_uniq unique (caso_a, caso_b),
  constraint caso_matches_no_self check (caso_a <> caso_b)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- En fase inicial, el backend conecta con usuario service_role (bypass RLS).
-- Si un día quieres exponer via PostgREST/Supabase client desde el browser,
-- define policies específicas.
-- ---------------------------------------------------------------------------
alter table waitlist enable row level security;
alter table contacto enable row level security;
alter table aliados enable row level security;
alter table donaciones enable row level security;
alter table usuarios enable row level security;
alter table casos enable row level security;
alter table caso_fotos enable row level security;
alter table caso_avistamientos enable row level security;
alter table caso_updates enable row level security;
alter table alertas enable row level security;
alter table alerta_envios enable row level security;
alter table caso_matches enable row level security;

-- ---------------------------------------------------------------------------
-- Trigger: updated_at en casos y usuarios
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists casos_set_updated_at on casos;
create trigger casos_set_updated_at
  before update on casos
  for each row execute function set_updated_at();

drop trigger if exists usuarios_set_updated_at on usuarios;
create trigger usuarios_set_updated_at
  before update on usuarios
  for each row execute function set_updated_at();
