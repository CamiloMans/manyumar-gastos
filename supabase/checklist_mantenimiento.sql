-- Checklist de mantenimiento para MANYU.
-- Convierte la tarea única en una lista de pasos reutilizable: el plan define
-- los pasos una vez y cada requerimiento (ocurrencia) guarda cuáles ya se tacharon.
-- Ejecutar completo en Supabase > SQL Editor (después de modulo_mantenimiento.sql).

-- Pasos del checklist definidos en el plan: array de textos.
-- Ej. ["Cambio de aceite", "Cambio de filtros", "Revisar correa"]
alter table public.manyumar_planes_mantenimiento
  add column if not exists pasos jsonb not null default '[]'::jsonb;

-- Estado tachado por ocurrencia: array de {texto, hecho}.
-- Ej. [{"texto": "Cambio de aceite", "hecho": true}, {"texto": "Cambio de filtros", "hecho": false}]
alter table public.manyumar_requerimientos_mantenimiento
  add column if not exists checklist jsonb not null default '[]'::jsonb;

-- Construye un checklist sin tachar a partir de los pasos del plan.
create or replace function public.manyumar_checklist_desde_pasos(pasos jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select coalesce(
    (
      select jsonb_agg(jsonb_build_object('texto', paso, 'hecho', false))
      from jsonb_array_elements_text(coalesce(pasos, '[]'::jsonb)) as paso
    ),
    '[]'::jsonb
  );
$$;

-- Al crear un plan, el primer requerimiento nace con el checklist del plan.
create or replace function public.manyumar_crear_primer_requerimiento()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.manyumar_requerimientos_mantenimiento (
    plan_mantenimiento_id,
    activo_id,
    fecha_programada,
    checklist
  ) values (
    new.id,
    new.activo_id,
    new.proxima_fecha,
    public.manyumar_checklist_desde_pasos(new.pasos)
  ) on conflict (plan_mantenimiento_id, fecha_programada) do nothing;
  return new;
end;
$$;

-- Cada requerimiento siguiente también copia los pasos vigentes del plan.
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
        fecha_programada,
        checklist
      ) values (
        pauta.id,
        pauta.activo_id,
        siguiente_fecha,
        public.manyumar_checklist_desde_pasos(pauta.pasos)
      ) on conflict (plan_mantenimiento_id, fecha_programada) do nothing;
    end if;
  end if;
  return new;
end;
$$;

-- Backfill: planes existentes usan su tarea como primer (y único) paso.
update public.manyumar_planes_mantenimiento
set pasos = jsonb_build_array(tarea)
where pasos = '[]'::jsonb and length(trim(tarea)) > 0;

-- Backfill: requerimientos pendientes/aprobados heredan el checklist de su plan.
update public.manyumar_requerimientos_mantenimiento r
set checklist = public.manyumar_checklist_desde_pasos(p.pasos)
from public.manyumar_planes_mantenimiento p
where r.plan_mantenimiento_id = p.id
  and r.checklist = '[]'::jsonb
  and r.estado in ('pendiente', 'aprobado');

select
  (select count(*) from public.manyumar_planes_mantenimiento where pasos <> '[]'::jsonb) as planes_con_pasos,
  (select count(*) from public.manyumar_requerimientos_mantenimiento where checklist <> '[]'::jsonb) as requerimientos_con_checklist;
