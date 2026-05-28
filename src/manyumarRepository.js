import { isSupabaseConfigured, supabase, supabaseConfigMessage } from "./supabaseClient";
import { manyumarTables } from "./manyumarSchema";

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(supabaseConfigMessage);
  }

  return supabase;
}

function throwIfError(error, action) {
  if (error) {
    throw new Error(`${action}: ${error.message}`);
  }
}

function mapCompany(row) {
  return {
    id: row.id,
    name: row.nombre,
    icon: row.icono,
    sortOrder: Number(row.orden || 0),
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

function mapCategory(row) {
  return {
    id: row.id,
    name: row.nombre,
    icon: row.icono,
    type: row.tipo,
    sortOrder: Number(row.orden || 0),
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

function mapCompanyCategory(row) {
  return {
    id: row.id,
    companyId: row.empresa_id,
    name: row.nombre,
    icon: row.icono,
    type: row.tipo,
    sortOrder: Number(row.orden || 0),
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

function mapCategoryDetail(row) {
  return {
    id: row.id,
    parentCategoryId: row.categoria_padre_id,
    name: row.nombre,
    icon: row.icono,
    sortOrder: Number(row.orden || 0),
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

function mapIncomeOrigin(row) {
  return {
    id: row.id,
    name: row.nombre,
    icon: row.icono,
    sortOrder: Number(row.orden || 0),
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

export function mapTransaction(row) {
  return {
    id: row.id,
    companyId: row.empresa_id,
    categoryId: row.categoria_id,
    detailId: row.detalle_id || "",
    incomeOriginId: row.origen_ingreso_id || "",
    type: row.tipo,
    amount: Number(row.monto || 0),
    date: row.fecha_movimiento,
    description: row.descripcion || "",
    companyName: row.nombre_empresa || "",
    detailName: row.nombre_detalle || "",
    incomeOriginName: row.nombre_origen_ingreso || "",
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

function toTransactionRow(transaction) {
  const row = {
    id: transaction.id,
    empresa_id: transaction.companyId,
    categoria_id: transaction.categoryId,
    detalle_id: transaction.detailId || null,
    origen_ingreso_id: transaction.incomeOriginId || null,
    tipo: transaction.type,
    monto: Number(transaction.amount || 0),
    fecha_movimiento: transaction.date,
    descripcion: transaction.description || "",
    nombre_empresa: transaction.companyName || "",
    nombre_detalle: transaction.detailName || "",
    nombre_origen_ingreso: transaction.incomeOriginName || "",
  };

  if (!row.id) {
    delete row.id;
  }

  return row;
}

function toCompanyRow(company) {
  return {
    id: company.id,
    nombre: company.name,
    icono: company.icon || "tractor",
    orden: Number(company.sortOrder || 0),
  };
}

function toCategoryRow(category) {
  return {
    id: category.id,
    nombre: category.name,
    icono: category.icon || "package",
    tipo: category.type,
    orden: Number(category.sortOrder || 0),
  };
}

function toCompanyCategoryRow(category) {
  return {
    id: category.id,
    empresa_id: category.companyId,
    nombre: category.name,
    icono: category.icon || "package",
    tipo: category.type || "expense",
    orden: Number(category.sortOrder || 0),
  };
}

function toCategoryDetailRow(detail) {
  return {
    id: detail.id,
    categoria_padre_id: detail.parentCategoryId,
    nombre: detail.name,
    icono: detail.icon || "receipt",
    orden: Number(detail.sortOrder || 0),
  };
}

function toIncomeOriginRow(origin) {
  return {
    id: origin.id,
    nombre: origin.name,
    icono: origin.icon || "landmark",
    orden: Number(origin.sortOrder || 0),
  };
}

async function selectOrdered(client, table) {
  const { data, error } = await client.from(table).select("*").order("orden", { ascending: true });
  throwIfError(error, `No se pudo leer ${table}`);
  return data || [];
}

async function insertAndReturn(table, row, mapper, action) {
  const client = requireSupabase();
  const { data, error } = await client.from(table).insert(row).select("*").single();
  throwIfError(error, action);
  return mapper(data);
}

async function deleteById(table, id, action) {
  const client = requireSupabase();
  const { error } = await client.from(table).delete().eq("id", id);
  throwIfError(error, action);
}

async function updateIcon(table, id, icon, mapper, action) {
  const client = requireSupabase();
  const { data, error } = await client
    .from(table)
    .update({ icono: icon })
    .eq("id", id)
    .select("*")
    .single();

  throwIfError(error, action);
  return mapper(data);
}

async function updateName(table, id, name, mapper, action) {
  const client = requireSupabase();
  const { data, error } = await client
    .from(table)
    .update({ nombre: name })
    .eq("id", id)
    .select("*")
    .single();

  throwIfError(error, action);
  return mapper(data);
}

async function updateTransactionSnapshot(matchColumn, id, updateColumn, name, action) {
  const client = requireSupabase();
  const { error } = await client
    .from(manyumarTables.transactions)
    .update({ [updateColumn]: name })
    .eq(matchColumn, id);

  throwIfError(error, action);
}

export async function loadManyumarData() {
  const client = requireSupabase();

  const [
    companies,
    categories,
    companyCategories,
    categoryDetails,
    incomeOrigins,
    transactionsResponse,
  ] = await Promise.all([
    selectOrdered(client, manyumarTables.companies),
    selectOrdered(client, manyumarTables.categories),
    selectOrdered(client, manyumarTables.companyCategories),
    selectOrdered(client, manyumarTables.categoryDetails),
    selectOrdered(client, manyumarTables.incomeOrigins),
    client
      .from(manyumarTables.transactions)
      .select("*")
      .order("fecha_movimiento", { ascending: false })
      .order("creado_en", { ascending: false }),
  ]);

  throwIfError(transactionsResponse.error, `No se pudo leer ${manyumarTables.transactions}`);

  return {
    companies: companies.map(mapCompany),
    categories: categories.map(mapCategory),
    companyCategories: companyCategories.map(mapCompanyCategory),
    categoryDetails: categoryDetails.map(mapCategoryDetail),
    incomeOrigins: incomeOrigins.map(mapIncomeOrigin),
    transactions: (transactionsResponse.data || []).map(mapTransaction),
  };
}

export async function createCompany(company) {
  return insertAndReturn(
    manyumarTables.companies,
    toCompanyRow(company),
    mapCompany,
    `No se pudo guardar en ${manyumarTables.companies}`,
  );
}

export async function deleteCompany(id) {
  await deleteById(manyumarTables.companies, id, `No se pudo eliminar de ${manyumarTables.companies}`);
}

export async function updateCompanyIcon(id, icon) {
  return updateIcon(
    manyumarTables.companies,
    id,
    icon,
    mapCompany,
    `No se pudo actualizar ${manyumarTables.companies}`,
  );
}

export async function updateCompanyName(id, name) {
  return updateName(
    manyumarTables.companies,
    id,
    name,
    mapCompany,
    `No se pudo actualizar ${manyumarTables.companies}`,
  );
}

export async function updateTransactionCompanyName(companyId, name) {
  await updateTransactionSnapshot(
    "empresa_id",
    companyId,
    "nombre_empresa",
    name,
    `No se pudo actualizar ${manyumarTables.transactions}`,
  );
}

export async function createCategory(category) {
  return insertAndReturn(
    manyumarTables.categories,
    toCategoryRow(category),
    mapCategory,
    `No se pudo guardar en ${manyumarTables.categories}`,
  );
}

export async function deleteCategory(id) {
  await deleteById(manyumarTables.categories, id, `No se pudo eliminar de ${manyumarTables.categories}`);
}

export async function updateCategoryIcon(id, icon) {
  return updateIcon(
    manyumarTables.categories,
    id,
    icon,
    mapCategory,
    `No se pudo actualizar ${manyumarTables.categories}`,
  );
}

export async function updateCategoryName(id, name) {
  return updateName(
    manyumarTables.categories,
    id,
    name,
    mapCategory,
    `No se pudo actualizar ${manyumarTables.categories}`,
  );
}

export async function createCompanyCategory(category) {
  return insertAndReturn(
    manyumarTables.companyCategories,
    toCompanyCategoryRow(category),
    mapCompanyCategory,
    `No se pudo guardar en ${manyumarTables.companyCategories}`,
  );
}

export async function deleteCompanyCategory(id) {
  await deleteById(
    manyumarTables.companyCategories,
    id,
    `No se pudo eliminar de ${manyumarTables.companyCategories}`,
  );
}

export async function updateCompanyCategoryIcon(id, icon) {
  return updateIcon(
    manyumarTables.companyCategories,
    id,
    icon,
    mapCompanyCategory,
    `No se pudo actualizar ${manyumarTables.companyCategories}`,
  );
}

export async function updateCompanyCategoryName(id, name) {
  return updateName(
    manyumarTables.companyCategories,
    id,
    name,
    mapCompanyCategory,
    `No se pudo actualizar ${manyumarTables.companyCategories}`,
  );
}

export async function createCategoryDetail(detail) {
  return insertAndReturn(
    manyumarTables.categoryDetails,
    toCategoryDetailRow(detail),
    mapCategoryDetail,
    `No se pudo guardar en ${manyumarTables.categoryDetails}`,
  );
}

export async function deleteCategoryDetail(id) {
  await deleteById(manyumarTables.categoryDetails, id, `No se pudo eliminar de ${manyumarTables.categoryDetails}`);
}

export async function updateCategoryDetailIcon(id, icon) {
  return updateIcon(
    manyumarTables.categoryDetails,
    id,
    icon,
    mapCategoryDetail,
    `No se pudo actualizar ${manyumarTables.categoryDetails}`,
  );
}

export async function updateCategoryDetailName(id, name) {
  return updateName(
    manyumarTables.categoryDetails,
    id,
    name,
    mapCategoryDetail,
    `No se pudo actualizar ${manyumarTables.categoryDetails}`,
  );
}

export async function updateTransactionDetailName(detailId, name) {
  await updateTransactionSnapshot(
    "detalle_id",
    detailId,
    "nombre_detalle",
    name,
    `No se pudo actualizar ${manyumarTables.transactions}`,
  );
}

export async function createIncomeOrigin(origin) {
  return insertAndReturn(
    manyumarTables.incomeOrigins,
    toIncomeOriginRow(origin),
    mapIncomeOrigin,
    `No se pudo guardar en ${manyumarTables.incomeOrigins}`,
  );
}

export async function deleteIncomeOrigin(id) {
  await deleteById(manyumarTables.incomeOrigins, id, `No se pudo eliminar de ${manyumarTables.incomeOrigins}`);
}

export async function updateIncomeOriginIcon(id, icon) {
  return updateIcon(
    manyumarTables.incomeOrigins,
    id,
    icon,
    mapIncomeOrigin,
    `No se pudo actualizar ${manyumarTables.incomeOrigins}`,
  );
}

export async function updateIncomeOriginName(id, name) {
  return updateName(
    manyumarTables.incomeOrigins,
    id,
    name,
    mapIncomeOrigin,
    `No se pudo actualizar ${manyumarTables.incomeOrigins}`,
  );
}

export async function updateTransactionIncomeOriginName(originId, name) {
  await updateTransactionSnapshot(
    "origen_ingreso_id",
    originId,
    "nombre_origen_ingreso",
    name,
    `No se pudo actualizar ${manyumarTables.transactions}`,
  );
}

export async function createTransaction(transaction) {
  const client = requireSupabase();
  const { data, error } = await client
    .from(manyumarTables.transactions)
    .insert(toTransactionRow(transaction))
    .select("*")
    .single();

  throwIfError(error, `No se pudo guardar en ${manyumarTables.transactions}`);
  return mapTransaction(data);
}

export async function updateTransaction(id, transaction) {
  const client = requireSupabase();
  const row = toTransactionRow({ ...transaction, id });
  delete row.id;

  const { data, error } = await client
    .from(manyumarTables.transactions)
    .update(row)
    .eq("id", id)
    .select("*")
    .single();

  throwIfError(error, `No se pudo actualizar ${manyumarTables.transactions}`);
  return mapTransaction(data);
}

export async function deleteTransaction(id) {
  await deleteById(manyumarTables.transactions, id, `No se pudo eliminar de ${manyumarTables.transactions}`);
}
