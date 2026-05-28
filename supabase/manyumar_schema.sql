-- Esquema Manyumar para Supabase.
-- Ejecutar en el SQL Editor del proyecto pokfcklwtcpsisaewime.

create extension if not exists pgcrypto;

create or replace function public.manyumar_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create table if not exists public.manyumar_empresas (
  id text primary key,
  nombre text not null,
  icono text not null default 'tractor',
  orden integer not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.manyumar_categorias (
  id text primary key,
  nombre text not null,
  icono text not null default 'package',
  tipo text not null check (tipo in ('expense', 'income', 'both')),
  orden integer not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.manyumar_categorias_empresa (
  id text primary key,
  empresa_id text not null references public.manyumar_empresas(id) on delete cascade,
  nombre text not null,
  icono text not null default 'package',
  tipo text not null default 'expense' check (tipo in ('expense', 'income', 'both')),
  orden integer not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.manyumar_detalles_categoria (
  id text primary key,
  categoria_padre_id text not null references public.manyumar_categorias_empresa(id) on delete cascade,
  nombre text not null,
  icono text not null default 'receipt',
  orden integer not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.manyumar_origenes_ingreso (
  id text primary key,
  nombre text not null,
  icono text not null default 'landmark',
  orden integer not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.manyumar_movimientos (
  id text primary key default gen_random_uuid()::text,
  empresa_id text not null references public.manyumar_empresas(id) on delete restrict,
  categoria_id text not null,
  detalle_id text,
  origen_ingreso_id text,
  tipo text not null check (tipo in ('expense', 'income')),
  monto bigint not null check (monto > 0),
  fecha_movimiento date not null default current_date,
  descripcion text not null default '',
  nombre_empresa text not null default '',
  nombre_detalle text not null default '',
  nombre_origen_ingreso text not null default '',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists manyumar_movimientos_fecha_idx
  on public.manyumar_movimientos (fecha_movimiento desc);

create index if not exists manyumar_movimientos_empresa_idx
  on public.manyumar_movimientos (empresa_id);

create index if not exists manyumar_movimientos_tipo_idx
  on public.manyumar_movimientos (tipo);

create index if not exists manyumar_categorias_empresa_empresa_idx
  on public.manyumar_categorias_empresa (empresa_id);

create index if not exists manyumar_detalles_categoria_padre_idx
  on public.manyumar_detalles_categoria (categoria_padre_id);

drop trigger if exists manyumar_empresas_updated_at on public.manyumar_empresas;
create trigger manyumar_empresas_updated_at
before update on public.manyumar_empresas
for each row execute function public.manyumar_set_updated_at();

drop trigger if exists manyumar_categorias_updated_at on public.manyumar_categorias;
create trigger manyumar_categorias_updated_at
before update on public.manyumar_categorias
for each row execute function public.manyumar_set_updated_at();

drop trigger if exists manyumar_categorias_empresa_updated_at on public.manyumar_categorias_empresa;
create trigger manyumar_categorias_empresa_updated_at
before update on public.manyumar_categorias_empresa
for each row execute function public.manyumar_set_updated_at();

drop trigger if exists manyumar_detalles_categoria_updated_at on public.manyumar_detalles_categoria;
create trigger manyumar_detalles_categoria_updated_at
before update on public.manyumar_detalles_categoria
for each row execute function public.manyumar_set_updated_at();

drop trigger if exists manyumar_origenes_ingreso_updated_at on public.manyumar_origenes_ingreso;
create trigger manyumar_origenes_ingreso_updated_at
before update on public.manyumar_origenes_ingreso
for each row execute function public.manyumar_set_updated_at();

drop trigger if exists manyumar_movimientos_updated_at on public.manyumar_movimientos;
create trigger manyumar_movimientos_updated_at
before update on public.manyumar_movimientos
for each row execute function public.manyumar_set_updated_at();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.manyumar_empresas to anon, authenticated;
grant select, insert, update, delete on public.manyumar_categorias to anon, authenticated;
grant select, insert, update, delete on public.manyumar_categorias_empresa to anon, authenticated;
grant select, insert, update, delete on public.manyumar_detalles_categoria to anon, authenticated;
grant select, insert, update, delete on public.manyumar_origenes_ingreso to anon, authenticated;
grant select, insert, update, delete on public.manyumar_movimientos to anon, authenticated;

insert into public.manyumar_empresas (id, nombre, icono, orden)
values
  ('manyumar', 'MANYUMAR', 'tractor', 10),
  ('servicio', 'SERVICIO', 'wrench', 20)
on conflict (id) do update
set nombre = excluded.nombre,
    icono = excluded.icono,
    orden = excluded.orden;

insert into public.manyumar_categorias (id, nombre, icono, tipo, orden)
values
  ('adquisicion', 'ADQUISICION', 'package', 'expense', 10),
  ('contador', 'CONTADOR', 'receipt', 'expense', 20),
  ('cosecha', 'COSECHA', 'wheat', 'expense', 30),
  ('mantenimiento', 'MANTENIMIENTO', 'wrench', 'expense', 40),
  ('muestreo', 'MUESTREO', 'flask', 'expense', 50),
  ('prestamo-egreso', 'PRESTAMO', 'handshake', 'expense', 60),
  ('siembra', 'SIEMBRA', 'sprout', 'expense', 70),
  ('prestamo-ingreso', 'PRESTAMO', 'handshake', 'income', 80),
  ('serv-cosecha', 'SERV. COSECHA', 'wheat', 'income', 90),
  ('serv-siembra', 'SERV. SIEMBRA', 'sprout', 'income', 100),
  ('venta', 'VENTA', 'dollar', 'income', 110)
on conflict (id) do update
set nombre = excluded.nombre,
    icono = excluded.icono,
    tipo = excluded.tipo,
    orden = excluded.orden;

insert into public.manyumar_categorias_empresa (id, empresa_id, nombre, icono, tipo, orden)
values
  ('manyumar-materiales', 'manyumar', 'MATERIALES', 'package', 'expense', 10),
  ('manyumar-semillas', 'manyumar', 'SEMILLAS', 'sprout', 'expense', 20),
  ('manyumar-serv-administrativos', 'manyumar', 'SERVICIOS ADMINISTRATIVOS', 'receipt', 'expense', 30),
  ('manyumar-serv-operativos', 'manyumar', 'SERVICIOS OPERATIVOS', 'wrench', 'expense', 40),
  ('servicio-materiales', 'servicio', 'MATERIALES', 'package', 'expense', 50),
  ('servicio-mantencion', 'servicio', 'MANTENCION', 'wrench', 'expense', 60),
  ('servicio-sueldos', 'servicio', 'SUELDOS', 'coins', 'expense', 70),
  ('servicio-servicios', 'servicio', 'SERVICIOS', 'receipt', 'expense', 80),
  ('manyumar-prestamo-ingreso', 'manyumar', 'PRESTAMO', 'handshake', 'income', 90),
  ('manyumar-serv-cosecha', 'manyumar', 'SERV. COSECHA', 'wheat', 'income', 100),
  ('manyumar-serv-siembra', 'manyumar', 'SERV. SIEMBRA', 'sprout', 'income', 110),
  ('manyumar-venta', 'manyumar', 'VENTA', 'dollar', 'income', 120),
  ('servicio-prestamo-ingreso', 'servicio', 'PRESTAMO', 'handshake', 'income', 130),
  ('servicio-serv-cosecha', 'servicio', 'SERV. COSECHA', 'wheat', 'income', 140),
  ('servicio-serv-siembra', 'servicio', 'SERV. SIEMBRA', 'sprout', 'income', 150),
  ('servicio-venta', 'servicio', 'VENTA', 'dollar', 'income', 160)
on conflict (id) do update
set empresa_id = excluded.empresa_id,
    nombre = excluded.nombre,
    icono = excluded.icono,
    tipo = excluded.tipo,
    orden = excluded.orden;

insert into public.manyumar_detalles_categoria (id, categoria_padre_id, nombre, icono, orden)
values
  ('so-mantenimiento', 'manyumar-serv-operativos', 'MANTENCION', 'wrench', 10),
  ('so-ser-cosecha', 'manyumar-serv-operativos', 'SERVICIO DE COSECHA', 'wheat', 20),
  ('so-ser-siembra', 'manyumar-serv-operativos', 'SERVICIO DE SIEMBRA', 'sprout', 30),
  ('servicio-documentos', 'servicio-servicios', 'DOCUMENTOS', 'receipt', 40),
  ('sa-acuatecma', 'manyumar-serv-administrativos', 'ACUATECMA', 'landmark', 50),
  ('sa-clave-internet-factura', 'manyumar-serv-administrativos', 'CLAVE INTERNET FACTURA', 'receipt', 60),
  ('sa-contador', 'manyumar-serv-administrativos', 'CONTADOR', 'receipt', 70),
  ('sa-infa', 'manyumar-serv-administrativos', 'INFA', 'landmark', 80),
  ('sa-patente', 'manyumar-serv-administrativos', 'PATENTE', 'receipt', 90),
  ('sa-u-de-chile', 'manyumar-serv-administrativos', 'UNIVERSIDAD DE CHILE', 'landmark', 100)
on conflict (id) do update
set categoria_padre_id = excluded.categoria_padre_id,
    nombre = excluded.nombre,
    icono = excluded.icono,
    orden = excluded.orden;

insert into public.manyumar_origenes_ingreso (id, nombre, icono, orden)
values
  ('brushel', 'BRUSHEL', 'landmark', 10),
  ('com-caniggia', 'COM.CANIGGIA', 'landmark', 20),
  ('landes', 'LANDES', 'landmark', 30),
  ('pacific-gold', 'PACIFIC GOLD', 'landmark', 40),
  ('prestamo', 'PRESTAMO', 'handshake', 50),
  ('sudmaris', 'SUDMARIS', 'landmark', 60),
  ('trans-antartic', 'TRANS ANTARTIC', 'landmark', 70)
on conflict (id) do update
set nombre = excluded.nombre,
    icono = excluded.icono,
    orden = excluded.orden;

select
  (select count(*) from public.manyumar_empresas) as empresas,
  (select count(*) from public.manyumar_categorias) as categorias,
  (select count(*) from public.manyumar_categorias_empresa) as categorias_empresa,
  (select count(*) from public.manyumar_detalles_categoria) as detalles_categoria,
  (select count(*) from public.manyumar_origenes_ingreso) as origenes_ingreso;
