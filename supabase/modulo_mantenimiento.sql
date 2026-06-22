-- Módulo de mantenimiento para MANYU.
-- Ejecutar completo en Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.manyumar_activos (
  id text primary key default gen_random_uuid()::text,
  tipo text not null check (tipo in ('embarcacion', 'equipamiento')),
  nombre text not null check (length(trim(nombre)) > 0),
  identificador text not null default '',
  descripcion text not null default '',
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.manyumar_planes_mantenimiento (
  id text primary key default gen_random_uuid()::text,
  activo_id text not null references public.manyumar_activos(id) on delete cascade,
  tarea text not null check (length(trim(tarea)) > 0),
  frecuencia_cantidad integer not null check (frecuencia_cantidad > 0),
  frecuencia_unidad text not null check (frecuencia_unidad in ('dias', 'semanas', 'meses', 'anos')),
  fecha_inicio date not null default current_date,
  proxima_fecha date not null default current_date,
  vigente boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.manyumar_requerimientos_mantenimiento (
  id text primary key default gen_random_uuid()::text,
  plan_mantenimiento_id text not null references public.manyumar_planes_mantenimiento(id) on delete cascade,
  activo_id text not null references public.manyumar_activos(id) on delete cascade,
  fecha_programada date not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'realizado', 'cancelado')),
  fecha_aprobacion timestamptz,
  aprobado_por text not null default '',
  fecha_realizacion date,
  realizado_por text not null default '',
  observaciones text not null default '',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint manyumar_requerimiento_plan_fecha_unica unique (plan_mantenimiento_id, fecha_programada),
  constraint manyumar_requerimiento_realizado_con_fecha check (estado <> 'realizado' or fecha_realizacion is not null)
);

create index if not exists manyumar_planes_activo_idx
  on public.manyumar_planes_mantenimiento (activo_id);
create index if not exists manyumar_planes_proxima_fecha_idx
  on public.manyumar_planes_mantenimiento (proxima_fecha) where vigente = true;
create index if not exists manyumar_requerimientos_estado_fecha_idx
  on public.manyumar_requerimientos_mantenimiento (estado, fecha_programada);
create index if not exists manyumar_requerimientos_activo_idx
  on public.manyumar_requerimientos_mantenimiento (activo_id);

create or replace function public.manyumar_mantenimiento_actualizado_en()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create or replace function public.manyumar_sumar_frecuencia(
  fecha_base date,
  cantidad integer,
  unidad text
)
returns date
language sql
immutable
set search_path = public
as $$
  select case unidad
    when 'dias' then fecha_base + cantidad
    when 'semanas' then fecha_base + (cantidad * 7)
    when 'meses' then (fecha_base + make_interval(months => cantidad))::date
    when 'anos' then (fecha_base + make_interval(years => cantidad))::date
  end;
$$;

create or replace function public.manyumar_crear_primer_requerimiento()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.manyumar_requerimientos_mantenimiento (
    plan_mantenimiento_id,
    activo_id,
    fecha_programada
  ) values (
    new.id,
    new.activo_id,
    new.proxima_fecha
  ) on conflict (plan_mantenimiento_id, fecha_programada) do nothing;
  return new;
end;
$$;

create or replace function public.manyumar_programar_siguiente_mantenimiento()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  pauta public.manyumar_planes_mantenimiento%rowtype;
  siguiente_fecha date;
begin
  if new.estado = 'realizado' and old.estado is distinct from 'realizado' then
    select * into pauta
    from public.manyumar_planes_mantenimiento
    where id = new.plan_mantenimiento_id;

    if pauta.vigente then
      siguiente_fecha := public.manyumar_sumar_frecuencia(
        coalesce(new.fecha_realizacion, current_date),
        pauta.frecuencia_cantidad,
        pauta.frecuencia_unidad
      );

      update public.manyumar_planes_mantenimiento
      set proxima_fecha = siguiente_fecha
      where id = pauta.id;

      insert into public.manyumar_requerimientos_mantenimiento (
        plan_mantenimiento_id,
        activo_id,
        fecha_programada
      ) values (
        pauta.id,
        pauta.activo_id,
        siguiente_fecha
      ) on conflict (plan_mantenimiento_id, fecha_programada) do nothing;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.manyumar_archivar_mantenimientos_del_activo()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.activo = true and new.activo = false then
    update public.manyumar_planes_mantenimiento
    set vigente = false
    where activo_id = new.id and vigente = true;

    update public.manyumar_requerimientos_mantenimiento
    set estado = 'cancelado'
    where activo_id = new.id and estado in ('pendiente', 'aprobado');
  end if;
  return new;
end;
$$;

drop trigger if exists manyumar_activos_actualizado_en on public.manyumar_activos;
create trigger manyumar_activos_actualizado_en
before update on public.manyumar_activos
for each row execute function public.manyumar_mantenimiento_actualizado_en();

drop trigger if exists manyumar_planes_actualizado_en on public.manyumar_planes_mantenimiento;
create trigger manyumar_planes_actualizado_en
before update on public.manyumar_planes_mantenimiento
for each row execute function public.manyumar_mantenimiento_actualizado_en();

drop trigger if exists manyumar_requerimientos_actualizado_en on public.manyumar_requerimientos_mantenimiento;
create trigger manyumar_requerimientos_actualizado_en
before update on public.manyumar_requerimientos_mantenimiento
for each row execute function public.manyumar_mantenimiento_actualizado_en();

drop trigger if exists manyumar_plan_crear_primer_requerimiento on public.manyumar_planes_mantenimiento;
create trigger manyumar_plan_crear_primer_requerimiento
after insert on public.manyumar_planes_mantenimiento
for each row execute function public.manyumar_crear_primer_requerimiento();

drop trigger if exists manyumar_requerimiento_programar_siguiente on public.manyumar_requerimientos_mantenimiento;
create trigger manyumar_requerimiento_programar_siguiente
after update of estado on public.manyumar_requerimientos_mantenimiento
for each row execute function public.manyumar_programar_siguiente_mantenimiento();

drop trigger if exists manyumar_activo_archivar_mantenimientos on public.manyumar_activos;
create trigger manyumar_activo_archivar_mantenimientos
after update of activo on public.manyumar_activos
for each row execute function public.manyumar_archivar_mantenimientos_del_activo();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.manyumar_activos to anon, authenticated;
grant select, insert, update, delete on public.manyumar_planes_mantenimiento to anon, authenticated;
grant select, insert, update, delete on public.manyumar_requerimientos_mantenimiento to anon, authenticated;

alter table public.manyumar_activos enable row level security;
alter table public.manyumar_planes_mantenimiento enable row level security;
alter table public.manyumar_requerimientos_mantenimiento enable row level security;

drop policy if exists "Acceso completo a activos" on public.manyumar_activos;
create policy "Acceso completo a activos" on public.manyumar_activos
for all to anon, authenticated using (true) with check (true);

drop policy if exists "Acceso completo a planes de mantenimiento" on public.manyumar_planes_mantenimiento;
create policy "Acceso completo a planes de mantenimiento" on public.manyumar_planes_mantenimiento
for all to anon, authenticated using (true) with check (true);

drop policy if exists "Acceso completo a requerimientos de mantenimiento" on public.manyumar_requerimientos_mantenimiento;
create policy "Acceso completo a requerimientos de mantenimiento" on public.manyumar_requerimientos_mantenimiento
for all to anon, authenticated using (true) with check (true);

select
  (select count(*) from public.manyumar_activos) as activos,
  (select count(*) from public.manyumar_planes_mantenimiento) as planes_mantenimiento,
  (select count(*) from public.manyumar_requerimientos_mantenimiento) as requerimientos_mantenimiento;
