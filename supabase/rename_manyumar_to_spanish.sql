-- Rename existing Manyumar Supabase tables and columns to Spanish names.
-- Run once in Supabase SQL Editor for project pokfcklwtcpsisaewime.

alter table if exists public.manyumar_companies rename to manyumar_empresas;
alter table if exists public.manyumar_categories rename to manyumar_categorias;
alter table if exists public.manyumar_company_categories rename to manyumar_categorias_empresa;
alter table if exists public.manyumar_category_details rename to manyumar_detalles_categoria;
alter table if exists public.manyumar_income_origins rename to manyumar_origenes_ingreso;
alter table if exists public.manyumar_transactions rename to manyumar_movimientos;

alter table if exists public.manyumar_empresas rename column name to nombre;
alter table if exists public.manyumar_empresas rename column icon to icono;
alter table if exists public.manyumar_empresas rename column sort_order to orden;
alter table if exists public.manyumar_empresas rename column created_at to creado_en;
alter table if exists public.manyumar_empresas rename column updated_at to actualizado_en;

alter table if exists public.manyumar_categorias rename column name to nombre;
alter table if exists public.manyumar_categorias rename column icon to icono;
alter table if exists public.manyumar_categorias rename column "type" to tipo;
alter table if exists public.manyumar_categorias rename column sort_order to orden;
alter table if exists public.manyumar_categorias rename column created_at to creado_en;
alter table if exists public.manyumar_categorias rename column updated_at to actualizado_en;

alter table if exists public.manyumar_categorias_empresa rename column company_id to empresa_id;
alter table if exists public.manyumar_categorias_empresa rename column name to nombre;
alter table if exists public.manyumar_categorias_empresa rename column icon to icono;
alter table if exists public.manyumar_categorias_empresa rename column "type" to tipo;
alter table if exists public.manyumar_categorias_empresa rename column sort_order to orden;
alter table if exists public.manyumar_categorias_empresa rename column created_at to creado_en;
alter table if exists public.manyumar_categorias_empresa rename column updated_at to actualizado_en;

alter table if exists public.manyumar_detalles_categoria rename column parent_category_id to categoria_padre_id;
alter table if exists public.manyumar_detalles_categoria rename column name to nombre;
alter table if exists public.manyumar_detalles_categoria rename column icon to icono;
alter table if exists public.manyumar_detalles_categoria rename column sort_order to orden;
alter table if exists public.manyumar_detalles_categoria rename column created_at to creado_en;
alter table if exists public.manyumar_detalles_categoria rename column updated_at to actualizado_en;

alter table if exists public.manyumar_origenes_ingreso rename column name to nombre;
alter table if exists public.manyumar_origenes_ingreso rename column icon to icono;
alter table if exists public.manyumar_origenes_ingreso rename column sort_order to orden;
alter table if exists public.manyumar_origenes_ingreso rename column created_at to creado_en;
alter table if exists public.manyumar_origenes_ingreso rename column updated_at to actualizado_en;

alter table if exists public.manyumar_movimientos rename column company_id to empresa_id;
alter table if exists public.manyumar_movimientos rename column category_id to categoria_id;
alter table if exists public.manyumar_movimientos rename column detail_id to detalle_id;
alter table if exists public.manyumar_movimientos rename column income_origin_id to origen_ingreso_id;
alter table if exists public.manyumar_movimientos rename column "type" to tipo;
alter table if exists public.manyumar_movimientos rename column amount to monto;
alter table if exists public.manyumar_movimientos rename column transaction_date to fecha_movimiento;
alter table if exists public.manyumar_movimientos rename column description to descripcion;
alter table if exists public.manyumar_movimientos rename column company_name to nombre_empresa;
alter table if exists public.manyumar_movimientos rename column detail_name to nombre_detalle;
alter table if exists public.manyumar_movimientos rename column income_origin_name to nombre_origen_ingreso;
alter table if exists public.manyumar_movimientos rename column created_at to creado_en;
alter table if exists public.manyumar_movimientos rename column updated_at to actualizado_en;

alter index if exists manyumar_transactions_date_idx rename to manyumar_movimientos_fecha_idx;
alter index if exists manyumar_transactions_company_idx rename to manyumar_movimientos_empresa_idx;
alter index if exists manyumar_transactions_type_idx rename to manyumar_movimientos_tipo_idx;
alter index if exists manyumar_company_categories_company_idx rename to manyumar_categorias_empresa_empresa_idx;
alter index if exists manyumar_category_details_parent_idx rename to manyumar_detalles_categoria_padre_idx;

drop index if exists public.manyumar_movimientos_cuenta_idx;
drop index if exists public.manyumar_transactions_account_idx;
alter table if exists public.manyumar_movimientos drop column if exists account_id;
alter table if exists public.manyumar_movimientos drop column if exists cuenta_id;
drop table if exists public.manyumar_cuentas;
drop table if exists public.manyumar_accounts;

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

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.manyumar_empresas to anon, authenticated;
grant select, insert, update, delete on public.manyumar_categorias to anon, authenticated;
grant select, insert, update, delete on public.manyumar_categorias_empresa to anon, authenticated;
grant select, insert, update, delete on public.manyumar_detalles_categoria to anon, authenticated;
grant select, insert, update, delete on public.manyumar_origenes_ingreso to anon, authenticated;
grant select, insert, update, delete on public.manyumar_movimientos to anon, authenticated;

select pg_notify('pgrst', 'reload schema');
