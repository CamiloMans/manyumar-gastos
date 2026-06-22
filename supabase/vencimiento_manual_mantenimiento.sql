-- Fecha de vencimiento manual para MANYU.
-- Al registrar una realización, quien completa elige la fecha del próximo
-- requerimiento (vencimiento). Si no la indica, se calcula por frecuencia.
-- Ejecutar completo en Supabase > SQL Editor (después de checklist_mantenimiento.sql).

-- Fecha de vencimiento elegida a mano al completar el requerimiento.
alter table public.manyumar_requerimientos_mantenimiento
  add column if not exists proxima_fecha_programada date;

-- El siguiente requerimiento usa la fecha elegida; si es null, suma la frecuencia.
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
      siguiente_fecha := coalesce(
        new.proxima_fecha_programada,
        public.manyumar_sumar_frecuencia(
          coalesce(new.fecha_realizacion, current_date),
          pauta.frecuencia_cantidad,
          pauta.frecuencia_unidad
        )
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
