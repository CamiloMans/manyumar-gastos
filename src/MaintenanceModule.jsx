import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Archive,
  CalendarClock,
  Check,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  History,
  ListChecks,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Ship,
  Square,
  SquareCheckBig,
  Wrench,
  X,
} from "lucide-react";
import {
  approveRequirement,
  completeRequirement,
  createAssetWithPlan,
  createMaintenancePlan,
  archiveAsset,
  loadMaintenanceData,
  updateAsset,
  updateRequirementChecklist,
} from "./maintenanceRepository";

function inputDate(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDate(date) {
  if (!date) return "Sin fecha";
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function addFrequency(dateStr, amount, unit) {
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  const base = new Date(year, month - 1, day);
  const n = Number(amount) || 0;
  if (unit === "dias") base.setDate(base.getDate() + n);
  else if (unit === "semanas") base.setDate(base.getDate() + n * 7);
  else if (unit === "meses") base.setMonth(base.getMonth() + n);
  else if (unit === "anos") base.setFullYear(base.getFullYear() + n);
  return inputDate(base);
}

function frequencyLabel(plan) {
  const singular = { dias: "día", semanas: "semana", meses: "mes", anos: "año" };
  const plural = { dias: "días", semanas: "semanas", meses: "meses", anos: "años" };
  const unit = plan.frequencyAmount === 1 ? singular[plan.frequencyUnit] : plural[plan.frequencyUnit];
  return `Cada ${plan.frequencyAmount} ${unit}`;
}

function isDue(requirement) {
  return requirement.scheduledDate <= inputDate();
}

function AssetIcon({ type, size = 20 }) {
  const Icon = type === "embarcacion" ? Ship : Package;
  return <Icon size={size} strokeWidth={1.8} />;
}

export default function MaintenanceModule({ newAssetSignal = 0 }) {
  const [tab, setTab] = useState("agenda");
  const [assets, setAssets] = useState([]);
  const [plans, setPlans] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await loadMaintenanceData();
      setAssets(data.assets);
      setPlans(data.plans);
      setRequirements(data.requirements);
    } catch (loadError) {
      setError(loadError.message || "No se pudieron cargar los mantenimientos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (newAssetSignal > 0) setSheet({ type: "asset" });
  }, [newAssetSignal]);

  const activeRequirements = useMemo(
    () => requirements.filter((item) => item.status === "pendiente" || item.status === "aprobado"),
    [requirements],
  );
  const completedRequirements = useMemo(
    () =>
      requirements
        .filter((item) => item.status === "realizado")
        .sort((a, b) => (b.completedDate || "").localeCompare(a.completedDate || "")),
    [requirements],
  );
  const activeAssets = useMemo(() => assets.filter((asset) => asset.active), [assets]);
  const overdueCount = activeRequirements.filter(isDue).length;

  const reportError = (actionError, fallback) => {
    window.alert(actionError.message || fallback);
  };

  const handleCreateAsset = async (values) => {
    setSaving(true);
    try {
      await createAssetWithPlan(values.asset, values.plan);
      await loadData();
      setSheet(null);
      setTab("agenda");
    } catch (actionError) {
      reportError(actionError, "No se pudo crear el activo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePlan = async (values) => {
    setSaving(true);
    try {
      await createMaintenancePlan(values);
      await loadData();
      setSheet(null);
      setTab("agenda");
    } catch (actionError) {
      reportError(actionError, "No se pudo crear la pauta.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAsset = async (id, values) => {
    setSaving(true);
    try {
      await updateAsset(id, values);
      await loadData();
      setSheet(null);
    } catch (actionError) {
      reportError(actionError, "No se pudo actualizar el activo.");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (requirement) => {
    try {
      const saved = await approveRequirement(requirement.id);
      setRequirements((current) => current.map((item) => (item.id === saved.id ? saved : item)));
    } catch (actionError) {
      reportError(actionError, "No se pudo aprobar el requerimiento.");
    }
  };

  const handleComplete = async (values) => {
    setSaving(true);
    try {
      await completeRequirement(sheet.requirement.id, values);
      await loadData();
      setSheet(null);
    } catch (actionError) {
      reportError(actionError, "No se pudo registrar la realización.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChecklist = async (requirementId, checklist) => {
    setRequirements((current) => current.map((item) => (item.id === requirementId ? { ...item, checklist } : item)));
    try {
      await updateRequirementChecklist(requirementId, checklist);
    } catch (actionError) {
      reportError(actionError, "No se pudo actualizar el checklist.");
      await loadData();
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (!window.confirm(`¿Archivar ${asset.name}? Se cancelarán sus requerimientos futuros y se conservará el historial.`)) return;
    try {
      await archiveAsset(asset.id);
      await loadData();
    } catch (actionError) {
      reportError(actionError, "No se pudo archivar el activo.");
    }
  };

  if (loading) {
    return <MaintenanceStatus icon={RotateCcw} title="Cargando mantenimiento" detail="Consultando activos y requerimientos..." />;
  }

  if (error) {
    return (
      <MaintenanceStatus
        icon={Wrench}
        title="Falta configurar mantenimiento"
        detail={`${error} Ejecuta el archivo SQL indicado para habilitar este módulo.`}
        action="Reintentar"
        onAction={loadData}
      />
    );
  }

  return (
    <>
      <section className="maintenance-page page-stack">
        <div className="maintenance-intro">
          <span>MÓDULO DE OPERACIONES</span>
          <h2>Mantenimiento</h2>
          <p>Control periódico de embarcaciones y equipamiento.</p>
        </div>

        <div className="maintenance-summary">
          <SummaryMetric value={activeRequirements.length} label="Programados" icon={CalendarClock} />
          <SummaryMetric value={overdueCount} label="Por atender" icon={Clock3} tone={overdueCount ? "warning" : ""} />
          <SummaryMetric value={completedRequirements.length} label="Realizados" icon={CircleCheckBig} tone="success" />
        </div>

        {tab === "agenda" && (
          <AgendaView
            assets={activeAssets}
            plans={plans}
            requirements={activeRequirements}
            onApprove={handleApprove}
            onComplete={(requirement) => setSheet({ type: "complete", requirement })}
            onNew={() => setSheet({ type: "asset" })}
          />
        )}
        {tab === "assets" && (
          <AssetsView
            assets={activeAssets}
            plans={plans}
            onAddPlan={(asset) => setSheet({ type: "plan", asset })}
            onEdit={(asset) => setSheet({ type: "editAsset", asset })}
            onDelete={handleDeleteAsset}
            onNew={() => setSheet({ type: "asset" })}
          />
        )}
        {tab === "history" && (
          <HistoryView assets={assets} plans={plans} requirements={completedRequirements} />
        )}
      </section>

      <MaintenanceNav tab={tab} setTab={setTab} />
      {sheet?.type === "asset" && <AssetSheet disabled={saving} onClose={() => setSheet(null)} onSave={handleCreateAsset} />}
      {sheet?.type === "editAsset" && (
        <AssetEditSheet asset={sheet.asset} disabled={saving} onClose={() => setSheet(null)} onSave={handleUpdateAsset} />
      )}
      {sheet?.type === "plan" && (
        <PlanSheet asset={sheet.asset} disabled={saving} onClose={() => setSheet(null)} onSave={handleCreatePlan} />
      )}
      {sheet?.type === "complete" && (
        <CompleteSheet
          disabled={saving}
          requirement={sheet.requirement}
          plan={plans.find((item) => item.id === sheet.requirement.planId)}
          onClose={() => setSheet(null)}
          onSave={handleComplete}
          onToggleChecklist={handleToggleChecklist}
        />
      )}
    </>
  );
}

function MaintenanceStatus({ action, detail, icon: Icon, onAction, title }) {
  return (
    <div className="maintenance-status card">
      <Icon size={40} strokeWidth={1.6} />
      <strong>{title}</strong>
      <p>{detail}</p>
      {action && <button className="maintenance-outline-button" onClick={onAction}>{action}</button>}
    </div>
  );
}

function SummaryMetric({ icon: Icon, label, tone = "", value }) {
  return (
    <div className={`maintenance-metric ${tone}`}>
      <Icon size={18} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function AgendaView({ assets, onApprove, onComplete, onNew, plans, requirements }) {
  if (!requirements.length) {
    return <MaintenanceEmpty title="No hay mantenimientos pendientes" detail="Agrega un activo y define su primera pauta." action="Agregar activo" onAction={onNew} />;
  }

  return (
    <div className="maintenance-section">
      <div className="maintenance-section-title">
        <div><span>AGENDA</span><h3>Próximos requerimientos</h3></div>
        <b>{requirements.length}</b>
      </div>
      <div className="requirement-list">
        {requirements.map((requirement) => {
          const asset = assets.find((item) => item.id === requirement.assetId);
          const plan = plans.find((item) => item.id === requirement.planId);
          return (
            <article className={`requirement-card ${isDue(requirement) ? "due" : ""}`} key={requirement.id}>
              <div className="requirement-topline">
                <span className="asset-symbol"><AssetIcon type={asset?.type} /></span>
                <div>
                  <strong>{asset?.name || "Activo eliminado"}</strong>
                  <span>{asset?.identifier || (asset?.type === "embarcacion" ? "Embarcación" : "Equipamiento")}</span>
                </div>
                <span className={`status-pill ${requirement.status}`}>{requirement.status === "aprobado" ? "Aprobado" : "Por aprobar"}</span>
              </div>
              <div className="requirement-task">
                <Wrench size={17} />
                <div><b>{plan?.task || "Mantenimiento"}</b><span>{plan ? frequencyLabel(plan) : ""}</span></div>
              </div>
              {requirement.checklist?.length > 0 && (
                <div className="requirement-checklist-progress">
                  <ListChecks size={15} />
                  <span>{requirement.checklist.filter((item) => item.done).length}/{requirement.checklist.length} pasos del checklist</span>
                </div>
              )}
              <div className="requirement-date">
                <CalendarClock size={16} />
                <span>{isDue(requirement) ? "Programado para" : "Próxima fecha"}</span>
                <b>{formatDate(requirement.scheduledDate)}</b>
              </div>
              {requirement.status === "pendiente" ? (
                <button className="maintenance-action approve" onClick={() => onApprove(requirement)}><Check size={17} /> Aprobar requerimiento</button>
              ) : (
                <button className="maintenance-action complete" onClick={() => onComplete(requirement)}><CircleCheckBig size={17} /> Registrar realización</button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function AssetsView({ assets, onAddPlan, onDelete, onEdit, onNew, plans }) {
  return (
    <div className="maintenance-section">
      <div className="maintenance-section-title">
        <div><span>INVENTARIO</span><h3>Activos registrados</h3></div>
        <button className="section-add" onClick={onNew} aria-label="Agregar activo"><Plus size={18} /></button>
      </div>
      {!assets.length ? (
        <MaintenanceEmpty title="Aún no hay activos" detail="Registra una embarcación o un equipo para comenzar." action="Agregar activo" onAction={onNew} />
      ) : (
        <div className="asset-list">
          {assets.map((asset) => {
            const assetPlans = plans.filter((plan) => plan.assetId === asset.id);
            return (
              <article className="asset-card" key={asset.id}>
                <div className="asset-card-header">
                  <span className="asset-symbol large"><AssetIcon type={asset.type} size={23} /></span>
                  <div><span>{asset.type === "embarcacion" ? "EMBARCACIÓN" : "EQUIPAMIENTO"}</span><h4>{asset.name}</h4>{asset.identifier && <p>{asset.identifier}</p>}</div>
                  <div className="asset-card-actions">
                    <button className="asset-edit" onClick={() => onEdit(asset)} aria-label={`Editar ${asset.name}`} title="Editar activo"><Pencil size={16} /></button>
                    <button className="asset-delete" onClick={() => onDelete(asset)} aria-label={`Archivar ${asset.name}`} title="Archivar activo"><Archive size={17} /></button>
                  </div>
                </div>
                <div className="asset-plans">
                  {assetPlans.map((plan) => (
                    <div className="asset-plan-row" key={plan.id}>
                      <Wrench size={16} />
                      <div><b>{plan.task}</b><span>{frequencyLabel(plan)} · Próximo {formatDate(plan.nextDate)}</span></div>
                    </div>
                  ))}
                </div>
                <button className="asset-add-plan" onClick={() => onAddPlan(asset)}><Plus size={16} /> Agregar mantenimiento</button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HistoryView({ assets, plans, requirements }) {
  return (
    <div className="maintenance-section">
      <div className="maintenance-section-title"><div><span>TRAZABILIDAD</span><h3>Historial realizado</h3></div><b>{requirements.length}</b></div>
      {!requirements.length ? (
        <MaintenanceEmpty title="Sin mantenimientos realizados" detail="Aquí aparecerán las tareas completadas con su fecha y responsable." />
      ) : (
        <div className="history-list">
          {requirements.map((requirement) => {
            const asset = assets.find((item) => item.id === requirement.assetId);
            const plan = plans.find((item) => item.id === requirement.planId);
            return (
              <article className="history-row" key={requirement.id}>
                <span className="history-check"><Check size={16} /></span>
                <div>
                  <b>{plan?.task || "Mantenimiento"}</b>
                  <span>{asset?.name || "Activo"} · {formatDate(requirement.completedDate)}</span>
                  {requirement.checklist?.length > 0 && (
                    <p className="history-checklist">{requirement.checklist.filter((item) => item.done).length}/{requirement.checklist.length} pasos completados</p>
                  )}
                  {(requirement.completedBy || requirement.notes) && <p>{requirement.completedBy || "Sin responsable"}{requirement.notes ? ` — ${requirement.notes}` : ""}</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MaintenanceEmpty({ action, detail, onAction, title }) {
  return (
    <div className="maintenance-empty">
      <Anchor size={34} strokeWidth={1.5} />
      <strong>{title}</strong><p>{detail}</p>
      {action && <button onClick={onAction}>{action}</button>}
    </div>
  );
}

function MaintenanceNav({ setTab, tab }) {
  const items = [
    { key: "agenda", label: "Agenda", icon: CalendarClock },
    { key: "assets", label: "Activos", icon: Ship },
    { key: "history", label: "Historial", icon: History },
  ];
  return (
    <nav className="bottom-nav maintenance-bottom-nav" aria-label="Navegación de mantenimiento">
      <div className="bottom-nav-inner">
        {items.map(({ key, label, icon: Icon }) => (
          <button className={`nav-button ${tab === key ? "active" : ""}`} onClick={() => setTab(key)} key={key}>
            <span className="nav-icon"><Icon size={20} /></span><span className="nav-label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function SheetFrame({ children, disabled, onClose, title }) {
  return (
    <div className="sheet-layer">
      <button className="sheet-backdrop" aria-label="Cerrar" onClick={onClose} />
      <section className="transaction-sheet maintenance-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="form-header"><div><span>MANTENIMIENTO</span><h3>{title}</h3></div><button disabled={disabled} onClick={onClose}><X size={22} /></button></div>
        {children}
      </section>
    </div>
  );
}

function AssetSheet({ disabled, onClose, onSave }) {
  const [type, setType] = useState("embarcacion");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([""]);
  const [frequencyAmount, setFrequencyAmount] = useState(1);
  const [frequencyUnit, setFrequencyUnit] = useState("meses");
  const [startDate, setStartDate] = useState(inputDate());

  const hasStep = steps.some((step) => step.trim());

  const submit = (event) => {
    event.preventDefault();
    onSave({ asset: { type, name, identifier: "", description }, plan: { steps, frequencyAmount, frequencyUnit, startDate } });
  };

  return (
    <SheetFrame disabled={disabled} onClose={onClose} title="Nuevo activo">
      <form className="sheet-body maintenance-form" onSubmit={submit}>
        <div className="asset-type-picker">
          <button type="button" className={type === "embarcacion" ? "selected" : ""} onClick={() => setType("embarcacion")}><Ship size={21} /><span>Embarcación</span></button>
          <button type="button" className={type === "equipamiento" ? "selected" : ""} onClick={() => setType("equipamiento")}><Package size={21} /><span>Equipamiento</span></button>
        </div>
        <Field label="Nombre *"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Manyu I" required /></Field>
        <Field label="Descripción"><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Información útil del activo" /></Field>
        <div className="form-divider"><span>PRIMER MANTENIMIENTO</span></div>
        <Field label="Checklist a repetir *">
          <ChecklistEditor steps={steps} onChange={setSteps} disabled={disabled} />
        </Field>
        <FrequencyFields amount={frequencyAmount} onAmount={setFrequencyAmount} unit={frequencyUnit} onUnit={setFrequencyUnit} />
        <Field label="Primera fecha"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></Field>
        <button className="submit neutral" disabled={disabled || !name.trim() || !hasStep}>{disabled ? "Guardando..." : "Crear activo y mantenimiento"}</button>
      </form>
    </SheetFrame>
  );
}

function AssetEditSheet({ asset, disabled, onClose, onSave }) {
  const [type, setType] = useState(asset.type);
  const [name, setName] = useState(asset.name);
  const [description, setDescription] = useState(asset.description);

  const submit = (event) => {
    event.preventDefault();
    onSave(asset.id, { type, name, identifier: asset.identifier, description });
  };

  return (
    <SheetFrame disabled={disabled} onClose={onClose} title="Editar activo">
      <form className="sheet-body maintenance-form" onSubmit={submit}>
        <div className="asset-type-picker">
          <button type="button" className={type === "embarcacion" ? "selected" : ""} onClick={() => setType("embarcacion")}><Ship size={21} /><span>Embarcación</span></button>
          <button type="button" className={type === "equipamiento" ? "selected" : ""} onClick={() => setType("equipamiento")}><Package size={21} /><span>Equipamiento</span></button>
        </div>
        <Field label="Nombre *"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Manyu I" required /></Field>
        <Field label="Descripción"><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Información útil del activo" /></Field>
        <button className="submit neutral" disabled={disabled || !name.trim()}>{disabled ? "Guardando..." : "Guardar cambios"}</button>
      </form>
    </SheetFrame>
  );
}

function PlanSheet({ asset, disabled, onClose, onSave }) {
  const [steps, setSteps] = useState([""]);
  const [frequencyAmount, setFrequencyAmount] = useState(1);
  const [frequencyUnit, setFrequencyUnit] = useState("meses");
  const [startDate, setStartDate] = useState(inputDate());
  const hasStep = steps.some((step) => step.trim());
  return (
    <SheetFrame disabled={disabled} onClose={onClose} title="Nueva pauta">
      <form className="sheet-body maintenance-form" onSubmit={(event) => { event.preventDefault(); onSave({ assetId: asset.id, steps, frequencyAmount, frequencyUnit, startDate }); }}>
        <div className="selected-asset"><span className="asset-symbol"><AssetIcon type={asset.type} /></span><div><span>ACTIVO</span><b>{asset.name}</b></div></div>
        <Field label="Checklist a repetir *">
          <ChecklistEditor steps={steps} onChange={setSteps} disabled={disabled} />
        </Field>
        <FrequencyFields amount={frequencyAmount} onAmount={setFrequencyAmount} unit={frequencyUnit} onUnit={setFrequencyUnit} />
        <Field label="Primera fecha"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></Field>
        <button className="submit neutral" disabled={disabled || !hasStep}>{disabled ? "Guardando..." : "Crear pauta"}</button>
      </form>
    </SheetFrame>
  );
}

function CompleteSheet({ disabled, onClose, onSave, onToggleChecklist, plan, requirement }) {
  const [date, setDate] = useState(inputDate());
  const [completedBy, setCompletedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState(() => requirement.checklist || []);
  const [nextDate, setNextDate] = useState(() => (plan ? addFrequency(inputDate(), plan.frequencyAmount, plan.frequencyUnit) : ""));
  const [nextManual, setNextManual] = useState(false);

  useEffect(() => {
    if (!nextManual && plan) setNextDate(addFrequency(date, plan.frequencyAmount, plan.frequencyUnit));
  }, [date, plan, nextManual]);

  const toggle = (index) => {
    const next = items.map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    setItems(next);
    onToggleChecklist(requirement.id, next);
  };

  const pending = items.filter((item) => !item.done).length;

  return (
    <SheetFrame disabled={disabled} onClose={onClose} title="Registrar realización">
      <form className="sheet-body maintenance-form" onSubmit={(event) => { event.preventDefault(); onSave({ date, completedBy, notes, checklist: items, nextDate }); }}>
        <div className="completion-callout"><CircleCheckBig size={25} /><div><b>Confirma el trabajo realizado</b><span>El siguiente requerimiento se programará para la fecha de vencimiento que indiques.</span></div></div>
        {items.length > 0 && (
          <ChecklistRun items={items} onToggle={toggle} disabled={disabled} pending={pending} />
        )}
        <Field label="Fecha de realización *"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></Field>
        <Field label="Próximo vencimiento *">
          <input type="date" value={nextDate} min={date} onChange={(e) => { setNextDate(e.target.value); setNextManual(true); }} required />
        </Field>
        <Field label="Realizado por"><input value={completedBy} onChange={(e) => setCompletedBy(e.target.value)} placeholder="Nombre del responsable" /></Field>
        <Field label="Observaciones"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Trabajos, repuestos o hallazgos" /></Field>
        <button className="submit neutral" disabled={disabled || !nextDate}>{disabled ? "Guardando..." : "Confirmar realización"}</button>
      </form>
    </SheetFrame>
  );
}

function ChecklistEditor({ disabled, onChange, steps }) {
  const update = (index, value) => onChange(steps.map((step, i) => (i === index ? value : step)));
  const add = () => onChange([...steps, ""]);
  const remove = (index) => onChange(steps.length === 1 ? [""] : steps.filter((_, i) => i !== index));

  return (
    <div className="checklist-editor">
      {steps.map((step, index) => (
        <div className="checklist-edit-row" key={index}>
          <span className="checklist-edit-index">{index + 1}</span>
          <input
            value={step}
            onChange={(event) => update(index, event.target.value)}
            placeholder={index === 0 ? "Ej. Cambio de aceite y filtros" : "Otro paso del checklist"}
            disabled={disabled}
          />
          <button
            type="button"
            className="checklist-edit-remove"
            onClick={() => remove(index)}
            disabled={disabled || (steps.length === 1 && !steps[0].trim())}
            aria-label={`Quitar paso ${index + 1}`}
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="checklist-add-step" onClick={add} disabled={disabled}>
        <Plus size={15} /> Agregar paso
      </button>
    </div>
  );
}

function ChecklistRun({ disabled, items, onToggle, pending }) {
  return (
    <div className="checklist-run">
      <div className="checklist-run-head">
        <span><ListChecks size={15} /> Checklist</span>
        <b>{pending === 0 ? "Todo listo" : `Faltan ${pending}`}</b>
      </div>
      {items.map((item, index) => (
        <button
          type="button"
          key={index}
          className={`checklist-run-item ${item.done ? "done" : ""}`}
          onClick={() => onToggle(index)}
          disabled={disabled}
          aria-pressed={item.done}
        >
          <span className="checklist-box">{item.done ? <SquareCheckBig size={19} /> : <Square size={19} />}</span>
          <span className="checklist-text">{item.text}</span>
        </button>
      ))}
    </div>
  );
}

function FrequencyFields({ amount, onAmount, onUnit, unit }) {
  return (
    <div className="frequency-fields">
      <Field label="Repetir cada"><input type="number" min="1" value={amount} onChange={(e) => onAmount(e.target.value)} required /></Field>
      <Field label="Unidad"><select value={unit} onChange={(e) => onUnit(e.target.value)}><option value="dias">Días</option><option value="semanas">Semanas</option><option value="meses">Meses</option><option value="anos">Años</option></select></Field>
    </div>
  );
}

function Field({ children, label }) {
  return <label className="maintenance-field"><span>{label}</span>{children}</label>;
}
