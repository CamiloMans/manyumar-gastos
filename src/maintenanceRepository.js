import { isSupabaseConfigured, supabase, supabaseConfigMessage } from "./supabaseClient";

const tablas = {
  activos: "manyumar_activos",
  planes: "manyumar_planes_mantenimiento",
  requerimientos: "manyumar_requerimientos_mantenimiento",
};

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) throw new Error(supabaseConfigMessage);
  return supabase;
}

function throwIfError(error, action) {
  if (error) throw new Error(`${action}: ${error.message}`);
}

function cleanSteps(steps) {
  return (Array.isArray(steps) ? steps : []).map((step) => String(step).trim()).filter(Boolean);
}

function serializeChecklist(checklist) {
  return (Array.isArray(checklist) ? checklist : []).map((item) => ({
    texto: String(item?.text ?? "").trim(),
    hecho: Boolean(item?.done),
  }));
}

function mapActivo(row) {
  return {
    id: row.id,
    type: row.tipo,
    name: row.nombre,
    identifier: row.identificador || "",
    description: row.descripcion || "",
    active: row.activo,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

function mapPlan(row) {
  return {
    id: row.id,
    assetId: row.activo_id,
    task: row.tarea,
    steps: Array.isArray(row.pasos) ? row.pasos.map((paso) => String(paso)) : [],
    frequencyAmount: Number(row.frecuencia_cantidad),
    frequencyUnit: row.frecuencia_unidad,
    startDate: row.fecha_inicio,
    nextDate: row.proxima_fecha,
    active: row.vigente,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

function mapRequerimiento(row) {
  return {
    id: row.id,
    planId: row.plan_mantenimiento_id,
    assetId: row.activo_id,
    scheduledDate: row.fecha_programada,
    status: row.estado,
    approvedAt: row.fecha_aprobacion,
    approvedBy: row.aprobado_por || "",
    completedDate: row.fecha_realizacion,
    completedBy: row.realizado_por || "",
    notes: row.observaciones || "",
    checklist: Array.isArray(row.checklist)
      ? row.checklist.map((item) => ({ text: String(item?.texto ?? ""), done: Boolean(item?.hecho) }))
      : [],
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

export async function loadMaintenanceData() {
  const client = requireSupabase();
  const [activos, planes, requerimientos] = await Promise.all([
    client.from(tablas.activos).select("*").order("nombre", { ascending: true }),
    client.from(tablas.planes).select("*").order("proxima_fecha", { ascending: true }),
    client
      .from(tablas.requerimientos)
      .select("*")
      .order("fecha_programada", { ascending: true })
      .order("creado_en", { ascending: false }),
  ]);

  throwIfError(activos.error, `No se pudo leer ${tablas.activos}`);
  throwIfError(planes.error, `No se pudo leer ${tablas.planes}`);
  throwIfError(requerimientos.error, `No se pudo leer ${tablas.requerimientos}`);

  return {
    assets: (activos.data || []).map(mapActivo),
    plans: (planes.data || []).map(mapPlan),
    requirements: (requerimientos.data || []).map(mapRequerimiento),
  };
}

async function createAsset(asset) {
  const client = requireSupabase();
  const { data, error } = await client
    .from(tablas.activos)
    .insert({
      tipo: asset.type,
      nombre: asset.name.trim(),
      identificador: asset.identifier.trim(),
      descripcion: asset.description.trim(),
    })
    .select("*")
    .single();

  throwIfError(error, `No se pudo guardar en ${tablas.activos}`);
  return mapActivo(data);
}

export async function updateAsset(id, asset) {
  const client = requireSupabase();
  const { data, error } = await client
    .from(tablas.activos)
    .update({
      tipo: asset.type,
      nombre: asset.name.trim(),
      identificador: asset.identifier.trim(),
      descripcion: asset.description.trim(),
    })
    .eq("id", id)
    .select("*")
    .single();

  throwIfError(error, `No se pudo actualizar en ${tablas.activos}`);
  return mapActivo(data);
}

export async function createMaintenancePlan(plan) {
  const client = requireSupabase();
  const steps = cleanSteps(plan.steps);
  if (!steps.length) throw new Error("Agrega al menos un paso al checklist del mantenimiento.");
  const { data, error } = await client
    .from(tablas.planes)
    .insert({
      activo_id: plan.assetId,
      tarea: steps.join(" · "),
      pasos: steps,
      frecuencia_cantidad: Number(plan.frequencyAmount),
      frecuencia_unidad: plan.frequencyUnit,
      fecha_inicio: plan.startDate,
      proxima_fecha: plan.startDate,
    })
    .select("*")
    .single();

  throwIfError(error, `No se pudo guardar en ${tablas.planes}`);
  return mapPlan(data);
}

export async function createAssetWithPlan(asset, plan) {
  const savedAsset = await createAsset(asset);

  try {
    const savedPlan = await createMaintenancePlan({ ...plan, assetId: savedAsset.id });
    return { asset: savedAsset, plan: savedPlan };
  } catch (error) {
    await requireSupabase().from(tablas.activos).delete().eq("id", savedAsset.id);
    throw error;
  }
}

export async function approveRequirement(id, approvedBy = "Usuario MANYU") {
  const client = requireSupabase();
  const { data, error } = await client
    .from(tablas.requerimientos)
    .update({
      estado: "aprobado",
      fecha_aprobacion: new Date().toISOString(),
      aprobado_por: approvedBy,
    })
    .eq("id", id)
    .eq("estado", "pendiente")
    .select("*")
    .single();

  throwIfError(error, `No se pudo aprobar en ${tablas.requerimientos}`);
  return mapRequerimiento(data);
}

export async function completeRequirement(id, completion) {
  const client = requireSupabase();
  const update = {
    estado: "realizado",
    fecha_realizacion: completion.date,
    realizado_por: completion.completedBy.trim(),
    observaciones: completion.notes.trim(),
  };
  if (completion.checklist) update.checklist = serializeChecklist(completion.checklist);
  if (completion.nextDate) update.proxima_fecha_programada = completion.nextDate;
  const { data, error } = await client
    .from(tablas.requerimientos)
    .update(update)
    .eq("id", id)
    .eq("estado", "aprobado")
    .select("*")
    .single();

  throwIfError(error, `No se pudo completar en ${tablas.requerimientos}`);
  return mapRequerimiento(data);
}

export async function updateRequirementChecklist(id, checklist) {
  const client = requireSupabase();
  const { data, error } = await client
    .from(tablas.requerimientos)
    .update({ checklist: serializeChecklist(checklist) })
    .eq("id", id)
    .select("*")
    .single();

  throwIfError(error, `No se pudo actualizar el checklist en ${tablas.requerimientos}`);
  return mapRequerimiento(data);
}

export async function archiveAsset(id) {
  const { error } = await requireSupabase().from(tablas.activos).update({ activo: false }).eq("id", id);
  throwIfError(error, `No se pudo archivar en ${tablas.activos}`);
}
