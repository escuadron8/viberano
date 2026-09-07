-- T-11: esquema de base de datos — conocimiento, conversación y mensaje.
-- Ver specs/plan.md §4. Las políticas RLS se añaden en T-12, no aquí.

create type tipo_conocimiento as enum ('oficial', 'compartido', 'personal');
create type estado_conocimiento as enum ('activo', 'archivado', 'retirado');

create table conocimiento (
  id           uuid primary key default gen_random_uuid(),
  tipo         tipo_conocimiento not null,
  estado       estado_conocimiento not null default 'activo',
  herramienta  text not null,          -- 'salesforce' | 'jira' | 'figma' | 'tableau'
  titulo       text not null,
  contenido    text not null,
  autor_id     uuid references auth.users(id),   -- null en conocimiento oficial
  origen_id    uuid references conocimiento(id), -- trazabilidad al compartir  (FR-012)
  creado_en    timestamptz not null default now(),
  busqueda     tsvector generated always as
                 (to_tsvector('spanish', titulo || ' ' || contenido)) stored
);

create index on conocimiento using gin (busqueda);
create index on conocimiento (herramienta, tipo, estado);

create table conversacion (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id),
  herramienta text not null,
  creado_en timestamptz not null default now()
);

create table mensaje (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references conversacion(id) on delete cascade,
  rol text not null,              -- 'usuario' | 'tutor'
  contenido text not null,
  fuentes jsonb,                  -- las citas devueltas, para auditar SC-002/SC-003
  reportado boolean default false,-- alimenta SC-003
  creado_en timestamptz not null default now()
);
