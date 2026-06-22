# Manyumar Gastos

Aplicación móvil para registrar ingresos y egresos de Manyumar.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Supabase

Tabla `manyumar_empresas`:
`id`, `nombre`, `icono`, `orden`, `creado_en`, `actualizado_en`

Tabla `manyumar_categorias`:
`id`, `nombre`, `icono`, `tipo`, `orden`, `creado_en`, `actualizado_en`

Tabla `manyumar_categorias_empresa`:
`id`, `empresa_id`, `nombre`, `icono`, `tipo`, `orden`, `creado_en`, `actualizado_en`

Tabla `manyumar_detalles_categoria`:
`id`, `categoria_padre_id`, `nombre`, `icono`, `orden`, `creado_en`, `actualizado_en`

Tabla `manyumar_origenes_ingreso`:
`id`, `nombre`, `icono`, `orden`, `creado_en`, `actualizado_en`

Tabla `manyumar_movimientos`:
`id`, `empresa_id`, `categoria_id`, `detalle_id`, `origen_ingreso_id`, `tipo`, `monto`, `fecha_movimiento`, `descripcion`, `nombre_empresa`, `nombre_detalle`, `nombre_origen_ingreso`, `creado_en`, `actualizado_en`

## Módulo de mantenimiento

Ejecutar [`supabase/modulo_mantenimiento.sql`](supabase/modulo_mantenimiento.sql) en el SQL Editor de Supabase. El script crea las tablas, índices, automatizaciones, permisos y políticas RLS del módulo.

Tabla `manyumar_activos`:
`id`, `tipo`, `nombre`, `identificador`, `descripcion`, `activo`, `creado_en`, `actualizado_en`

Tabla `manyumar_planes_mantenimiento`:
`id`, `activo_id`, `tarea`, `frecuencia_cantidad`, `frecuencia_unidad`, `fecha_inicio`, `proxima_fecha`, `vigente`, `creado_en`, `actualizado_en`

Tabla `manyumar_requerimientos_mantenimiento`:
`id`, `plan_mantenimiento_id`, `activo_id`, `fecha_programada`, `estado`, `fecha_aprobacion`, `aprobado_por`, `fecha_realizacion`, `realizado_por`, `observaciones`, `creado_en`, `actualizado_en`

Al crear una pauta se genera su primer requerimiento. Cuando un requerimiento aprobado se marca como realizado, la base de datos calcula y crea automáticamente el siguiente según la frecuencia definida.
