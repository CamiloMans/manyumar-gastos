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
