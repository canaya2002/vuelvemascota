-- ============================================================================
-- Chat redesign — case threads + user-saved views + anti-spam
-- Fecha: 2026-04-27
-- ============================================================================
--
-- Cambios:
--   1. chat_mensajes ahora puede vivir bajo un caso_id (hilo del caso).
--      El canal global queda solo como compatibilidad legacy + rol "Comunidad"
--      gateado por reputación.
--   2. chat_reportes — un reporte por (mensaje, usuario). 3+ distintos →
--      auto-oculto + shadow_until 24h sobre el autor.
--   3. usuario_silencias — mute/block local (filtra al leer).
--   4. usuarios.shadow_until + casos_verificados — gate de reputación.
--   5. vistas_filtros — saved filter views creadas por el usuario.
--      Privadas por default; share_slug opcional si el dueño marca pública.
--   6. vista_suscripciones — para "seguir" una vista compartida.
--
-- Correr en SQL editor de Supabase. Idempotente.
-- ============================================================================

-- ---- 1. caso_id en chat_mensajes ----
alter table chat_mensajes add column if not exists caso_id uuid references casos(id) on delete cascade;
create index if not exists chat_mensajes_caso_idx on chat_mensajes (caso_id, created_at desc) where caso_id is not null;

-- canal pasa de check estricto a libre (admite 'comunidad' además de los 4 viejos)
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'chat_mensajes_canal_check') then
    alter table chat_mensajes drop constraint chat_mensajes_canal_check;
  end if;
end$$;
alter table chat_mensajes alter column canal drop not null;

-- ---- 2. chat_reportes ----
create table if not exists chat_reportes (
  id uuid primary key default gen_random_uuid(),
  mensaje_id uuid not null references chat_mensajes(id) on delete cascade,
  reportado_por uuid not null references usuarios(id) on delete cascade,
  motivo text,
  created_at timestamptz not null default now(),
  unique (mensaje_id, reportado_por)
);
create index if not exists chat_reportes_mensaje_idx on chat_reportes (mensaje_id);
alter table chat_reportes enable row level security;

-- ---- 3. usuario_silencias (mute/block local) ----
create table if not exists usuario_silencias (
  silenciador_id uuid not null references usuarios(id) on delete cascade,
  silenciado_id uuid not null references usuarios(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (silenciador_id, silenciado_id),
  check (silenciador_id <> silenciado_id)
);
create index if not exists usuario_silencias_silenciador_idx on usuario_silencias (silenciador_id);
-- Para el LEFT JOIN en chat.list por silenciado_id (el lector pregunta:
-- "¿este autor está silenciado por mí?" → necesita índice del lado silenciado).
create index if not exists usuario_silencias_silenciado_idx on usuario_silencias (silenciado_id);
alter table usuario_silencias enable row level security;

-- ---- 4. shadow_until + casos_verificados ----
alter table usuarios add column if not exists shadow_until timestamptz;
alter table usuarios add column if not exists casos_verificados int not null default 0;
create index if not exists usuarios_shadow_idx on usuarios (shadow_until) where shadow_until is not null;

-- Mantén casos_verificados en sync cuando un caso pasa a 'reencontrado'.
create or replace function bump_casos_verificados() returns trigger as $$
begin
  if new.estado = 'reencontrado' and (old.estado is distinct from 'reencontrado') and new.creado_por is not null then
    update usuarios set casos_verificados = casos_verificados + 1 where id = new.creado_por;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists casos_bump_verificados on casos;
create trigger casos_bump_verificados
  after update on casos
  for each row execute function bump_casos_verificados();

-- ---- 5. vistas_filtros ----
create table if not exists vistas_filtros (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  nombre text not null,
  filtros jsonb not null,
  publica boolean not null default false,
  share_slug text unique,
  suscriptores int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vistas_usuario_idx on vistas_filtros (usuario_id);
create index if not exists vistas_publicas_idx on vistas_filtros (publica) where publica;
alter table vistas_filtros enable row level security;

drop trigger if exists vistas_set_updated_at on vistas_filtros;
create trigger vistas_set_updated_at
  before update on vistas_filtros
  for each row execute function set_updated_at();

-- ---- 6. vista_suscripciones ----
create table if not exists vista_suscripciones (
  vista_id uuid not null references vistas_filtros(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (vista_id, usuario_id)
);
create index if not exists vista_suscripciones_usuario_idx on vista_suscripciones (usuario_id);
alter table vista_suscripciones enable row level security;
