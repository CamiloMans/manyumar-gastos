import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpCircle,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coins,
  DollarSign,
  FlaskConical,
  Handshake,
  Home,
  Landmark,
  Package,
  Plus,
  Receipt,
  Settings,
  Sprout,
  Tags,
  Tractor,
  Trash2,
  TrendingUp,
  WalletCards,
  Wheat,
  Wrench,
  X,
} from "lucide-react";

const expenseCategories = [
  { id: "adquisicion", name: "ADQUISICION", icon: "package", type: "expense" },
  { id: "contador", name: "CONTADOR", icon: "receipt", type: "expense" },
  { id: "cosecha", name: "COSECHA", icon: "wheat", type: "expense" },
  { id: "mantenimiento", name: "MANTENIMIENTO", icon: "wrench", type: "expense" },
  { id: "muestreo", name: "MUESTREO", icon: "flask", type: "expense" },
  { id: "prestamo-egreso", name: "PRESTAMO", icon: "handshake", type: "expense" },
  { id: "siembra", name: "SIEMBRA", icon: "sprout", type: "expense" },
];

const incomeCategories = [
  { id: "prestamo-ingreso", name: "PRESTAMO", icon: "handshake", type: "income" },
  { id: "serv-cosecha", name: "SERV. COSECHA", icon: "wheat", type: "income" },
  { id: "serv-siembra", name: "SERV. SIEMBRA", icon: "sprout", type: "income" },
  { id: "venta", name: "VENTA", icon: "dollar", type: "income" },
];

const defaultAccounts = [
  { id: "main", name: "Cuenta principal", initialBalance: 0 },
  { id: "savings", name: "Ahorros", initialBalance: 0 },
];

const companyOptions = [
  { id: "manyumar", name: "MANYUMAR", icon: "tractor" },
  { id: "servicio", name: "SERVICIO", icon: "wrench" },
];

const manyumarExpenseCategories = [
  { id: "manyumar-materiales", name: "MATERIALES", icon: "package", type: "expense", company: "manyumar" },
  { id: "manyumar-semillas", name: "SEMILLAS", icon: "sprout", type: "expense", company: "manyumar" },
  { id: "manyumar-serv-administrativos", name: "SERVICIOS ADMINISTRATIVOS", icon: "receipt", type: "expense", company: "manyumar" },
  { id: "manyumar-serv-operativos", name: "SERVICIOS OPERATIVOS", icon: "wrench", type: "expense", company: "manyumar" },
];

const servicioExpenseCategories = [
  { id: "servicio-materiales", name: "MATERIALES", icon: "package", type: "expense", company: "servicio" },
  { id: "servicio-mantencion", name: "MANTENCIÓN", icon: "wrench", type: "expense", company: "servicio" },
  { id: "servicio-sueldos", name: "SUELDOS", icon: "coins", type: "expense", company: "servicio" },
  { id: "servicio-servicios", name: "SERVICIOS", icon: "receipt", type: "expense", company: "servicio" },
];

const expenseCategoryDetails = {
  "manyumar-serv-operativos": [
    { id: "so-mantenimiento", name: "MANTENCIÓN", icon: "wrench" },
    { id: "so-ser-cosecha", name: "SERVICIO DE COSECHA", icon: "wheat" },
    { id: "so-ser-siembra", name: "SERVICIO DE SIEMBRA", icon: "sprout" },
  ],
  "servicio-servicios": [
    { id: "servicio-documentos", name: "DOCUMENTOS", icon: "receipt" },
  ],
  "manyumar-serv-administrativos": [
    { id: "sa-acuatecma", name: "ACUATECMA", icon: "landmark" },
    { id: "sa-clave-internet-factura", name: "CLAVE INTERNET FACTURA", icon: "receipt" },
    { id: "sa-contador", name: "CONTADOR", icon: "receipt" },
    { id: "sa-infa", name: "INFA", icon: "landmark" },
    { id: "sa-patente", name: "PATENTE", icon: "receipt" },
    { id: "sa-u-de-chile", name: "UNIVERSIDAD DE CHILE", icon: "landmark" },
  ],
};

const incomeOriginOptions = [
  { id: "brushel", name: "BRUSHEL", icon: "landmark" },
  { id: "com-caniggia", name: "COM.CANIGGIA", icon: "landmark" },
  { id: "landes", name: "LANDES", icon: "landmark" },
  { id: "pacific-gold", name: "PACIFIC GOLD", icon: "landmark" },
  { id: "prestamo", name: "PRESTAMO", icon: "handshake" },
  { id: "sudmaris", name: "SUDMARIS", icon: "landmark" },
  { id: "trans-antartic", name: "TRANS ANTARTIC", icon: "landmark" },
];

const categoryIconComponents = {
  sprout: Sprout,
  wheat: Wheat,
  package: Package,
  wrench: Wrench,
  handshake: Handshake,
  flask: FlaskConical,
  dollar: DollarSign,
  tractor: Tractor,
  receipt: Receipt,
  landmark: Landmark,
  trend: TrendingUp,
  coins: Coins,
};

const categoryIconById = {
  cosecha: "wheat",
  contador: "receipt",
  siembra: "sprout",
  adquisicion: "package",
  mantenimiento: "wrench",
  "prestamo-egreso": "handshake",
  "prestamo-ingreso": "handshake",
  muestreo: "flask",
  "serv-siembra": "sprout",
  "serv-cosecha": "wheat",
  venta: "dollar",
};

const selectableCategoryIcons = [
  { key: "sprout", Icon: Sprout },
  { key: "wheat", Icon: Wheat },
  { key: "package", Icon: Package },
  { key: "wrench", Icon: Wrench },
  { key: "handshake", Icon: Handshake },
  { key: "flask", Icon: FlaskConical },
  { key: "dollar", Icon: DollarSign },
  { key: "tractor", Icon: Tractor },
  { key: "receipt", Icon: Receipt },
  { key: "landmark", Icon: Landmark },
  { key: "trend", Icon: TrendingUp },
  { key: "coins", Icon: Coins },
];

const formatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});
const amountInputFormatter = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 0,
});
const spanishMonths = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function firstDayOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function inputDate(date = new Date()) {
  const value = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return value.toISOString().slice(0, 10);
}

function monthTitle(date, titleCase = false) {
  const text = `${spanishMonths[date.getMonth()]} ${date.getFullYear()}`;
  return titleCase ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function isSameMonth(dateString, monthDate) {
  const date = new Date(dateString);
  return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth();
}

function shortDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

function longDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function parseAmountInput(value) {
  return Number(String(value).replace(/\D/g, ""));
}

function formatAmountInput(value) {
  const digits = String(value).replace(/\D/g, "");
  return digits ? amountInputFormatter.format(Number(digits)) : "";
}

function categoryInitials(category) {
  const words = (category?.name || "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length > 1) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return (words[0] || "?").slice(0, 2).toUpperCase();
}

function categoryIconKey(category) {
  const key = category?.icon;
  if (key && categoryIconComponents[key]) return key;
  return categoryIconById[category?.id] || null;
}

function CategoryBadge({ category, compact = false }) {
  const iconKey = categoryIconKey(category);
  const Icon = iconKey ? categoryIconComponents[iconKey] : null;

  return (
    <span className={cx("category-badge", category?.type, compact && "compact")}>
      {Icon ? <Icon size={compact ? 14 : 15} strokeWidth={1.75} /> : categoryInitials(category)}
    </span>
  );
}

function App() {
  const [view, setView] = useState("home");
  const [selectedMonth, setSelectedMonth] = useState(() => firstDayOfMonth());
  const [transactions, setTransactions] = useStoredState("manyumar.transactions", []);
  const [categories, setCategories] = useStoredState("manyumar.categories.v4", [
    ...expenseCategories,
    ...incomeCategories,
  ]);
  const [accounts, setAccounts] = useStoredState("manyumar.accounts", defaultAccounts);
  const [transactionModal, setTransactionModal] = useState(null);
  const [settingsPanel, setSettingsPanel] = useState(null);

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(transactionModal));
    return () => document.body.classList.remove("modal-open");
  }, [transactionModal]);

  const monthTransactions = useMemo(
    () => transactions.filter((transaction) => isSameMonth(transaction.date, selectedMonth)),
    [selectedMonth, transactions],
  );

  const totals = useMemo(() => {
    const income = monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const expense = monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    return { income, expense, balance: income - expense };
  }, [monthTransactions]);

  const lookupCategories = useMemo(
    () => [...categories, ...manyumarExpenseCategories, ...servicioExpenseCategories],
    [categories],
  );

  const context = {
    accounts,
    categories,
    lookupCategories,
    monthTransactions,
    selectedMonth,
    setAccounts,
    setCategories,
    setSelectedMonth,
    setSettingsPanel,
    setTransactionModal,
    setTransactions,
    settingsPanel,
    totals,
    transactions,
    view,
    setView,
  };

  return (
    <div className="app-shell">
      <Header onAdd={setTransactionModal} />
      <main className="app-main">
        {view === "home" && <HomeView {...context} />}
        {view === "expenses" && <LedgerView {...context} type="expense" />}
        {view === "income" && <LedgerView {...context} type="income" />}
        {view === "settings" && <SettingsView setView={setView} />}
        {view === "categories" && <CategoriesView {...context} />}
        {view === "accounts" && <AccountsView {...context} />}
      </main>
      <BottomNav view={view} setView={setView} onAdd={() => setTransactionModal({ type: "expense" })} />
      {transactionModal && (
        <TransactionSheet
          accounts={accounts}
          categories={categories}
          onClose={() => setTransactionModal(null)}
          onSave={(transaction) => {
            setTransactions((current) => [{ ...transaction, id: crypto.randomUUID() }, ...current]);
            setTransactionModal(null);
          }}
          type={transactionModal.type}
        />
      )}
    </div>
  );
}

function Header({ onAdd }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <h1>Manyumar</h1>
        <div className="header-actions">
          <IconButton label="Agregar ingreso" tone="income" onClick={() => onAdd({ type: "income" })}>
            <ArrowUpCircle size={20} />
          </IconButton>
          <IconButton label="Agregar gasto" tone="expense" onClick={() => onAdd({ type: "expense" })}>
            <ArrowDownCircle size={20} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

function IconButton({ children, label, tone, onClick }) {
  return (
    <button className={cx("icon-button", tone)} aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  );
}

function BottomNav({ view, setView, onAdd }) {
  const items = [
    { key: "home", label: "Inicio", icon: Home },
    { key: "expenses", label: "Gastos", icon: ArrowDownRight },
    { key: "income", label: "Ingresos", icon: ArrowUpRight },
    { key: "settings", label: "Ajustes", icon: Settings },
  ];

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <div className="bottom-nav-inner">
        {items.slice(0, 2).map((item) => (
          <NavButton key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />
        ))}
        <button className="nav-add" aria-label="Agregar transacción" title="Agregar transacción" onClick={onAdd}>
          <Plus size={26} />
        </button>
        {items.slice(2).map((item) => (
          <NavButton key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />
        ))}
      </div>
    </nav>
  );
}

function NavButton({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button className={cx("nav-button", active && "active")} onClick={onClick}>
      <Icon size={20} />
      <span>{item.label}</span>
    </button>
  );
}

function HomeView({ lookupCategories, monthTransactions, selectedMonth, totals }) {
  const latest = [...monthTransactions].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  const expenseByCategory = categoryTotals(monthTransactions, lookupCategories, "expense");

  return (
    <section className="page-stack home-page">
      <p className="month-kicker">{monthTitle(selectedMonth).toUpperCase()}</p>

      <div className="balance-card">
        <p>Balance del mes</p>
        <strong>{formatter.format(totals.balance)}</strong>
      </div>

      <div className="summary-grid">
        <SummaryCard title="Ingresos" value={totals.income} type="income" />
        <SummaryCard title="Gastos" value={totals.expense} type="expense" />
      </div>

      {expenseByCategory.length > 0 && (
        <Card className="category-summary-card">
          <h2>Gastos por categoría</h2>
          <div className="category-total-list">
            {expenseByCategory.map((item) => (
              <div className="category-total-row" key={item.id}>
                <CategoryBadge category={item} compact />
                <span>{item.name}</span>
                <strong>{formatter.format(item.total)}</strong>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="movements-card">
        <h2>Últimos movimientos</h2>
        {latest.length === 0 ? (
          <EmptyState compact text="No hay movimientos aún" detail="Agrega tu primer gasto o ingreso" />
        ) : (
          <div className="movement-list">
            {latest.slice(0, 6).map((transaction) => (
              <MovementRow key={transaction.id} transaction={transaction} categories={lookupCategories} />
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}

function SummaryCard({ title, value, type }) {
  const Icon = type === "income" ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className="summary-card">
      <span className={cx("summary-icon", type)}>
        <Icon size={20} />
      </span>
      <div>
        <p>{title}</p>
        <strong className={type}>{formatter.format(value)}</strong>
      </div>
    </Card>
  );
}

function LedgerView({
  lookupCategories,
  monthTransactions,
  selectedMonth,
  setSelectedMonth,
  setTransactionModal,
  setTransactions,
  totals,
  type,
}) {
  const label = type === "expense" ? "gastos" : "ingresos";
  const title = type === "expense" ? "Total gastos" : "Total ingresos";
  const total = type === "expense" ? totals.expense : totals.income;
  const list = monthTransactions
    .filter((transaction) => transaction.type === type)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const groups = groupByDate(list);

  return (
    <section className="page-stack ledger-page">
      <MonthSwitcher selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
      <div className={cx("ledger-total", type)}>
        <p>{title}</p>
        <strong>{formatter.format(total)}</strong>
        <span>
          {list.length} {list.length === 1 ? "movimiento" : "movimientos"}
        </span>
      </div>

      {list.length === 0 ? (
        <EmptyLedger
          type={type}
          text={`No hay ${label} este mes`}
          action={`Agregar ${type === "expense" ? "gasto" : "ingreso"}`}
          onAdd={() => setTransactionModal({ type })}
        />
      ) : (
        <div className="dated-groups">
          {groups.map((group) => (
            <div className="dated-group" key={group.date}>
              <div className="date-row">
                <span>{longDate(group.date)}</span>
                <strong>{formatter.format(group.total)}</strong>
              </div>
              <Card className="ledger-list-card">
                {group.items.map((transaction) => (
                  <LedgerRow
                    key={transaction.id}
                    categories={lookupCategories}
                    onDelete={() =>
                      setTransactions((current) => current.filter((item) => item.id !== transaction.id))
                    }
                    transaction={transaction}
                  />
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      {list.length > 0 && (
        <button
          className="floating-add"
          aria-label={`Agregar ${type === "expense" ? "gasto" : "ingreso"}`}
          onClick={() => setTransactionModal({ type })}
        >
          <Plus size={22} />
        </button>
      )}
    </section>
  );
}

function MonthSwitcher({ selectedMonth, setSelectedMonth }) {
  return (
    <div className="month-switcher">
      <button aria-label="Mes anterior" onClick={() => setSelectedMonth(addMonths(selectedMonth, -1))}>
        <ChevronLeft size={22} />
      </button>
      <h2>{monthTitle(selectedMonth, true)}</h2>
      <button aria-label="Mes siguiente" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}>
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

function EmptyLedger({ action, onAdd, text }) {
  return (
    <div className="empty-ledger">
      <WalletCards size={64} strokeWidth={1.6} />
      <p>{text}</p>
      <button className="outline-action" onClick={onAdd}>
        <Plus size={16} />
        {action}
      </button>
    </div>
  );
}

function SettingsView({ setView }) {
  return (
    <section className="page-stack settings-page">
      <div>
        <h2>Configuración</h2>
        <p>Personaliza tu experiencia</p>
      </div>
      <Card className="settings-card">
        <SettingsRow
          icon={Tags}
          title="Categorías"
          description="Gestiona tus categorías"
          onClick={() => setView("categories")}
        />
        <SettingsRow
          icon={WalletCards}
          title="Cuentas"
          description="Administra tus cuentas bancarias"
          onClick={() => setView("accounts")}
        />
      </Card>
      <div className="version">
        <p>Manyumar v1.0.0</p>
        <p>Control de finanzas personales</p>
      </div>
    </section>
  );
}

function SettingsRow({ description, icon: Icon, onClick, title }) {
  return (
    <button className="settings-row" onClick={onClick}>
      <span className="settings-icon">
        <Icon size={20} />
      </span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <ChevronRight size={20} />
    </button>
  );
}

function CategoriesView({ categories, setCategories, setSettingsPanel, settingsPanel, setView }) {
  const expenses = categories.filter((category) => category.type === "expense");
  const incomes = categories.filter((category) => category.type === "income");

  return (
    <section className="page-stack manage-page">
      <ManageHeader count={`${categories.length} categorías`} title="Categorías" onBack={() => setView("settings")} />
      <button className="outline-action full" onClick={() => setSettingsPanel(settingsPanel === "category" ? null : "category")}>
        <Plus size={16} />
        Nueva categoría
      </button>
      {settingsPanel === "category" && (
        <NewCategoryPanel
          onClose={() => setSettingsPanel(null)}
          onSave={(category) => {
            setCategories((current) => [{ ...category, id: crypto.randomUUID() }, ...current]);
            setSettingsPanel(null);
          }}
        />
      )}
      <CategorySection
        categories={expenses}
        title="Egresos"
        tone="expense"
        onDelete={(id) => setCategories((current) => current.filter((category) => category.id !== id))}
      />
      <CategorySection
        categories={incomes}
        title="Ingresos"
        tone="income"
        onDelete={(id) => setCategories((current) => current.filter((category) => category.id !== id))}
      />
    </section>
  );
}

function CategorySection({ categories, onDelete, title, tone }) {
  return (
    <Card className="managed-card">
      <p className={cx("section-label", tone)}>{title}</p>
      <div className="managed-list">
        {categories.map((category) => (
          <div className="managed-row" key={category.id}>
            <span className="managed-main">
              <CategoryBadge category={category} />
              <strong>{category.name}</strong>
            </span>
            <button aria-label="Eliminar" onClick={() => onDelete(category.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AccountsView({
  accounts,
  setAccounts,
  setSettingsPanel,
  settingsPanel,
  setView,
  transactions,
}) {
  return (
    <section className="page-stack manage-page">
      <ManageHeader count={`${accounts.length} cuentas`} title="Cuentas" onBack={() => setView("settings")} />
      <button className="outline-action full" onClick={() => setSettingsPanel(settingsPanel === "account" ? null : "account")}>
        <Plus size={16} />
        Nueva cuenta
      </button>
      {settingsPanel === "account" && (
        <NewAccountPanel
          onClose={() => setSettingsPanel(null)}
          onSave={(account) => {
            setAccounts((current) => [{ ...account, id: crypto.randomUUID() }, ...current]);
            setSettingsPanel(null);
          }}
        />
      )}
      <Card className="managed-card flat">
        <div className="managed-list">
          {accounts.map((account) => (
            <div className="managed-row" key={account.id}>
              <span className="managed-main">
                <span className="round-icon">
                  <WalletCards size={20} />
                </span>
                <span>
                  <strong>{account.name}</strong>
                  <small>{formatter.format(accountBalance(account, transactions))}</small>
                </span>
              </span>
              <button aria-label="Eliminar" onClick={() => setAccounts((current) => current.filter((row) => row.id !== account.id))}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function ManageHeader({ count, onBack, title }) {
  return (
    <div className="manage-header">
      <button aria-label="Volver" onClick={onBack}>
        <ArrowLeft size={20} />
      </button>
      <div>
        <h2>{title}</h2>
        <p>{count}</p>
      </div>
    </div>
  );
}

function NewCategoryPanel({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [icon, setIcon] = useState("sprout");

  return (
    <Card className="inline-form">
      <FormHeader title="Nueva categoría" onClose={onClose} />
      <label>
        Nombre
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de la categoría" />
      </label>
      <label>
        Tipo
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="expense">Egreso</option>
          <option value="income">Ingreso</option>
        </select>
      </label>
      <div className="icon-picker" aria-label="Icono">
        {selectableCategoryIcons.map(({ key, Icon }) => (
          <button className={icon === key ? "selected" : ""} key={key} type="button" onClick={() => setIcon(key)}>
            <Icon size={16} strokeWidth={1.75} />
          </button>
        ))}
      </div>
      <button className="submit neutral" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), icon, type })}>
        Agregar categoría
      </button>
    </Card>
  );
}

function NewAccountPanel({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  return (
    <Card className="inline-form">
      <FormHeader title="Nueva cuenta" onClose={onClose} />
      <label>
        Nombre
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de la cuenta" />
      </label>
      <label className="amount-label">
        Saldo inicial
        <span>
          <b>$</b>
          <input
            inputMode="decimal"
            type="number"
            min="0"
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            placeholder="0"
          />
        </span>
      </label>
      <button
        className="submit neutral"
        disabled={!name.trim()}
        onClick={() => onSave({ name: name.trim(), initialBalance: Number(balance || 0) })}
      >
        Agregar cuenta
      </button>
    </Card>
  );
}

function FormHeader({ onClose, title }) {
  return (
    <div className="form-header">
      <h3>{title}</h3>
      <button aria-label="Cerrar" onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  );
}

function TransactionSheet({ accounts, categories, onClose, onSave, type }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [incomeOriginId, setIncomeOriginId] = useState("");
  const [detailId, setDetailId] = useState("");
  const [date, setDate] = useState(inputDate());
  const [openSelect, setOpenSelect] = useState(null);
  const accountId = accounts[0]?.id || "main";

  useEffect(() => {
    setCategoryId("");
  }, [companyId]);

  useEffect(() => {
    const categoryDetails = expenseCategoryDetails[categoryId] || null;
    const autoDetailId = categoryDetails?.length === 1 ? categoryDetails[0].id : "";
    setDetailId((current) => (current === autoDetailId ? current : autoDetailId));
  }, [categoryId]);

  const hasCompanyCategories = type === "expense" && ["manyumar", "servicio"].includes(companyId);
  let categoryListForCompany = categories.filter((category) => category.type === type || category.type === "both");
  if (hasCompanyCategories && companyId === "manyumar") {
    categoryListForCompany = manyumarExpenseCategories;
  }
  if (hasCompanyCategories && companyId === "servicio") {
    categoryListForCompany = servicioExpenseCategories;
  }
  const sortedCategories = hasCompanyCategories
    ? categoryListForCompany
    : [...categoryListForCompany].sort((a, b) => a.name.localeCompare(b.name, "es"));

  const selectedCategory = categoryListForCompany.find((category) => category.id === categoryId);
  const selectedCompany = companyOptions.find((company) => company.id === companyId);
  const selectedIncomeOrigin = incomeOriginOptions.find((origin) => origin.id === incomeOriginId);
  const detailOptions = expenseCategoryDetails[categoryId] || null;
  const selectedDetail = detailOptions?.find((detail) => detail.id === detailId);
  const valid =
    parseAmountInput(amount) > 0 &&
    categoryId &&
    companyId &&
    (type !== "income" || incomeOriginId) &&
    (!detailOptions || detailId) &&
    date &&
    accountId;
  const noun = type === "expense" ? "gasto" : "ingreso";

  return (
    <div className="sheet-layer" role="dialog" aria-modal="true" aria-label={`Nuevo ${noun}`}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="transaction-sheet">
        <FormHeader title={`Nuevo ${noun}`} onClose={onClose} />
        <div className="sheet-body">
          <label className="amount-label">
            Monto
            <span>
              <b>$</b>
              <input
                aria-label="Monto"
                autoFocus
                autoComplete="off"
                inputMode="numeric"
                onChange={(event) => setAmount(formatAmountInput(event.target.value))}
                placeholder="0"
                type="text"
                value={amount}
              />
            </span>
          </label>

          <PickerField
            label="Empresa"
            open={openSelect === "company"}
            placeholder="Seleccionar empresa"
            selected={selectedCompany?.name}
            onToggle={() => setOpenSelect(openSelect === "company" ? null : "company")}
          />
          {openSelect === "company" && (
            <OptionList
              items={companyOptions}
              selectedId={companyId}
              onSelect={(id) => {
                setCompanyId(id);
                setOpenSelect(null);
              }}
            />
          )}

          <PickerField
            label="Categoría"
            open={openSelect === "category"}
            placeholder="Seleccionar categoría"
            selected={selectedCategory?.name}
            onToggle={() => setOpenSelect(openSelect === "category" ? null : "category")}
          />
          {openSelect === "category" && (
            <div className="category-picker">
              {sortedCategories.map((category) => (
                <button
                  className={category.id === categoryId ? "selected" : ""}
                  key={category.id}
                  onClick={() => {
                    setCategoryId(category.id);
                    setOpenSelect(null);
                  }}
                >
                  <CategoryBadge category={category} compact />
                  <span className="category-picker-label">{category.name}</span>
                </button>
              ))}
            </div>
          )}

          {detailOptions && (
            <>
              <PickerField
                label="Detalle"
                open={openSelect === "detail"}
                placeholder="Seleccionar detalle"
                selected={selectedDetail?.name}
                onToggle={() => setOpenSelect(openSelect === "detail" ? null : "detail")}
              />
              {openSelect === "detail" && (
                <OptionList
                  items={detailOptions}
                  selectedId={detailId}
                  onSelect={(id) => {
                    setDetailId(id);
                    setOpenSelect(null);
                  }}
                />
              )}
            </>
          )}

          {type === "income" && (
            <>
              <PickerField
                label="Origen de ingreso"
                open={openSelect === "incomeOrigin"}
                placeholder="Seleccionar origen"
                selected={selectedIncomeOrigin?.name}
                onToggle={() => setOpenSelect(openSelect === "incomeOrigin" ? null : "incomeOrigin")}
              />
              {openSelect === "incomeOrigin" && (
                <OptionList
                  items={incomeOriginOptions}
                  selectedId={incomeOriginId}
                  onSelect={(id) => {
                    setIncomeOriginId(id);
                    setOpenSelect(null);
                  }}
                />
              )}
            </>
          )}

          <label>
            Fecha
            <span className="date-field">
              <input aria-label="Fecha" onChange={(event) => setDate(event.target.value)} type="date" value={date} />
              <CalendarDays size={18} />
            </span>
          </label>

          <label>
            Descripción
            <input
              aria-label="Descripción"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Opcional"
              value={description}
            />
          </label>

          <button
            className={cx("submit", type)}
            disabled={!valid}
            onClick={() =>
              onSave({
                accountId,
                amount: parseAmountInput(amount),
                categoryId,
                companyId,
                companyName: selectedCompany?.name || "",
                createdAt: new Date().toISOString(),
                date,
                description: description.trim() || selectedCategory?.name || noun,
                detailId: detailOptions ? detailId : "",
                detailName: detailOptions ? selectedDetail?.name || "" : "",
                incomeOriginId: type === "income" ? incomeOriginId : "",
                incomeOriginName: type === "income" ? selectedIncomeOrigin?.name || "" : "",
                type,
              })
            }
          >
            Registrar {noun}
          </button>
        </div>
      </div>
    </div>
  );
}

function PickerField({ label, onToggle, open, placeholder, selected }) {
  return (
    <div className="picker-wrap">
      <p>{label}</p>
      <button className="picker-field" onClick={onToggle} type="button">
        <span className={!selected ? "muted" : ""}>{selected || placeholder}</span>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
    </div>
  );
}

function OptionList({ items, onSelect, selectedId }) {
  return (
    <div className="option-list">
      {items.map((item) => (
        <button className={item.id === selectedId ? "selected" : ""} key={item.id} onClick={() => onSelect(item.id)}>
          <CategoryBadge category={item} compact />
          <span className="option-list-label">{item.name}</span>
        </button>
      ))}
    </div>
  );
}

function Card({ children, className }) {
  return <div className={cx("card", className)}>{children}</div>;
}

function EmptyState({ compact, detail, text }) {
  return (
    <div className={cx("empty-state", compact && "compact")}>
      <WalletCards size={compact ? 48 : 64} strokeWidth={1.7} />
      <p>{text}</p>
      {detail && <span>{detail}</span>}
    </div>
  );
}

function MovementRow({ categories, transaction }) {
  const category = categories.find((item) => item.id === transaction.categoryId);
  return (
    <div className="movement-row">
      <CategoryBadge category={category} compact />
      <TransactionInfo category={category} showDate transaction={transaction} />
      <b className={transaction.type}>
        {transaction.type === "expense" ? "-" : ""}
        {formatter.format(transaction.amount)}
      </b>
    </div>
  );
}

function LedgerRow({ categories, onDelete, transaction }) {
  const category = categories.find((item) => item.id === transaction.categoryId);
  return (
    <div className="ledger-row">
      <CategoryBadge category={category} compact />
      <TransactionInfo category={category} transaction={transaction} />
      <b className={transaction.type}>{formatter.format(transaction.amount)}</b>
      <button aria-label="Eliminar" onClick={onDelete}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function TransactionInfo({ category, showDate = false, transaction }) {
  const categoryName = category?.name || "Sin categoría";
  const description = transaction.description?.trim();
  const descriptionLine = description && description !== categoryName ? description : "";
  const metaParts = [
    descriptionLine,
    showDate ? shortDate(transaction.date) : "",
    transaction.companyName,
    transaction.incomeOriginName,
  ].filter(Boolean);

  return (
    <span className="transaction-info">
      <span className="transaction-heading">
        <strong>{categoryName}</strong>
        {transaction.detailName && <em>{transaction.detailName}</em>}
      </span>
      {metaParts.length > 0 && <small>{metaParts.join(" · ")}</small>}
    </span>
  );
}

function categoryTotals(transactions, categories, type) {
  const totals = new Map();
  transactions
    .filter((transaction) => transaction.type === type)
    .forEach((transaction) => {
      totals.set(transaction.categoryId, (totals.get(transaction.categoryId) || 0) + Number(transaction.amount));
    });

  return [...totals.entries()]
    .map(([id, total]) => ({ ...categories.find((category) => category.id === id), id, total }))
    .filter((item) => item.name)
    .sort((a, b) => b.total - a.total);
}

function groupByDate(transactions) {
  const groups = new Map();
  transactions.forEach((transaction) => {
    if (!groups.has(transaction.date)) {
      groups.set(transaction.date, { date: transaction.date, items: [], total: 0 });
    }
    const group = groups.get(transaction.date);
    group.items.push(transaction);
    group.total += Number(transaction.amount);
  });
  return [...groups.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function accountBalance(account, transactions) {
  return transactions.reduce((total, transaction) => {
    if (transaction.accountId !== account.id) return total;
    return total + (transaction.type === "income" ? Number(transaction.amount) : -Number(transaction.amount));
  }, Number(account.initialBalance || 0));
}

export default App;
