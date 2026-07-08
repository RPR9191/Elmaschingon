"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Order, OrderStatus, STATUS_COLORS } from "@/lib/types";
import { useOrderNotifications } from "@/lib/notifications";

const ADMIN_PASSWORD = "tacos2024";

type AdminTab = "orders" | "menu";

interface MenuData {
  categories: any[];
  meats: any[];
  toppings: any[];
  salsas: any[];
  extras: any[];
  config: { whatsapp_number: string };
}

const SECTION_CONFIG: Record<
  string,
  {
    label: string;
    columns: { key: string; label: string; type: "text" | "number" | "number_label" }[];
    defaultItem: Record<string, any>;
  }
> = {
  categories: {
    label: "Categorias",
    columns: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "base_price", label: "Precio base", type: "number" },
      { key: "sort_order", label: "Orden", type: "number" },
    ],
    defaultItem: { name: "", icon: "taco", base_price: 0, sort_order: 1 },
  },
  meats: {
    label: "Carnes",
    columns: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "description", label: "Descripcion", type: "text" },
    ],
    defaultItem: { name: "", description: "" },
  },
  toppings: {
    label: "Toppings",
    columns: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "extra_price", label: "Precio extra", type: "number" },
    ],
    defaultItem: { name: "", extra_price: 0 },
  },
  salsas: {
    label: "Salsas",
    columns: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "description", label: "Descripcion", type: "text" },
    ],
    defaultItem: { name: "", description: "" },
  },
  extras: {
    label: "Extras",
    columns: [
      { key: "name", label: "Nombre", type: "text" },
      { key: "price", label: "Precio", type: "number" },
    ],
    defaultItem: { name: "", price: 0 },
  },
};

function TabButton({
  active,
  icon,
  label,
  onClick,
  badge,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-gold/10 text-gold border border-gold/30"
          : "text-foreground/50 hover:text-foreground border border-transparent hover:border-dark-border"
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-xs font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark-card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-dark-hover"
      >
        <span className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
          {title}
        </span>
        <svg
          className={`h-4 w-4 text-foreground/50 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="border-t border-dark-border p-4">{children}</div>}
    </div>
  );
}

export default function AdminPage() {
  // Auth state
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersError, setOrdersError] = useState("");

  // Menu state
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuSaving, setMenuSaving] = useState(false);
  const [menuError, setMenuError] = useState("");
  const [menuSuccess, setMenuSuccess] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    meats: false,
    toppings: false,
    salsas: false,
    extras: false,
    config: false,
  });

  // WhatsApp config
  const [whatsappNumber, setWhatsappNumber] = useState("13233032084");

  // ===== ORDERS =====

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setLoading(false);
    }
  }, []);
  
  const { newOrderCount, resetNewOrderCount } = useOrderNotifications(orders.length);

  useEffect(() => {
    if (authenticated) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [authenticated, fetchOrders]);

  // ===== MENU =====

  const fetchMenu = useCallback(async () => {
    setMenuLoading(true);
    setMenuError("");
    try {
      const res = await fetch("/api/menu/admin");
      if (!res.ok) throw new Error("Error al cargar menu");
      const data = await res.json();
      setMenuData(data);
      setWhatsappNumber(data.config?.whatsapp_number || "13233032084");
    } catch (err) {
      setMenuError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setMenuLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated && activeTab === "menu") {
      fetchMenu();
    }
  }, [authenticated, activeTab, fetchMenu]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Contrasena incorrecta");
    }
  };

  const updateStatus = async (id: number, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch {
      alert("Error al actualizar estado");
    }
  };

  // ===== MENU HANDLERS =====

  const updateItemField = (
    section: string,
    itemId: number,
    field: string,
    value: string | number
  ) => {
    if (!menuData) return;
    const items = [...(menuData as any)[section]];
    const idx = items.findIndex((i: any) => i.id === itemId);
    if (idx === -1) return;
    items[idx] = { ...items[idx], [field]: value };
    setMenuData({ ...menuData, [section]: items });
  };

  const addNewItem = (section: string) => {
    if (!menuData) return;
    const config = SECTION_CONFIG[section];
    if (!config) return;
    const items = [...(menuData as any)[section]];
    const maxId = items.reduce((max: number, i: any) => Math.max(max, i.id || 0), 0);
    items.push({ ...config.defaultItem, id: maxId + 1 });
    setMenuData({ ...menuData, [section]: items });
  };

  const removeItem = (section: string, itemId: number) => {
    if (!menuData) return;
    const items = (menuData as any)[section].filter((i: any) => i.id !== itemId);
    setMenuData({ ...menuData, [section]: items });
  };

  const saveMenu = async () => {
    if (!menuData) return;
    setMenuSaving(true);
    setMenuError("");
    setMenuSuccess("");
    try {
      const res = await fetch("/api/menu/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }
      const updated = await res.json();
      setMenuData(updated);
      setWhatsappNumber(updated.config?.whatsapp_number || "13233032084");
      setMenuSuccess("Menu guardado exitosamente");
      setTimeout(() => setMenuSuccess(""), 3000);
    } catch (err) {
      setMenuError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setMenuSaving(false);
    }
  };

  const saveWhatsAppConfig = async () => {
    setMenuSaving(true);
    setMenuError("");
    setMenuSuccess("");
    try {
      const res = await fetch("/api/menu/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: { whatsapp_number: whatsappNumber } }),
      });
      if (!res.ok) throw new Error("Error al guardar configuracion");
      setMenuSuccess("Numero de WhatsApp actualizado");
      setTimeout(() => setMenuSuccess(""), 3000);

      // Also update the menuData config
      if (menuData) {
        setMenuData({ ...menuData, config: { whatsapp_number: whatsappNumber } });
      }
    } catch (err) {
      setMenuError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setMenuSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Stats
  const todayOrders = orders.filter((o) => {
    const today = new Date();
    const orderDate = new Date(o.created_at);
    return orderDate.toDateString() === today.toDateString();
  });
  const todayTotal = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayAvg = todayOrders.length > 0 ? todayTotal / todayOrders.length : 0;

  // Login screen
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gold">Admin</h1>
            <p className="text-sm text-foreground/50">Tacos Sinaloa</p>
          </div>
          <div>
            <input
              type="password"
              placeholder="Contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-foreground placeholder-foreground/30 outline-none transition-colors focus:border-gold/50"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-gold py-3 font-semibold text-background transition-colors hover:bg-gold-dark"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  // ===== MENU EDITOR COMPONENT =====

  const renderMenuEditor = () => {
    if (menuLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <svg className="h-6 w-6 animate-spin text-gold" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="ml-3 text-sm text-foreground/50">Cargando menu...</span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {menuError && (
          <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
            {menuError}
          </div>
        )}
        {menuSuccess && (
          <div className="rounded-lg border border-success/20 bg-success/5 p-3 text-sm text-success">
            {menuSuccess}
          </div>
        )}

        {/* Editable sections */}
        {Object.entries(SECTION_CONFIG).map(([sectionKey, config]) => (
          <CollapsibleSection
            key={sectionKey}
            title={config.label}
            open={openSections[sectionKey]}
            onToggle={() => toggleSection(sectionKey)}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-dark-border">
                    {config.columns.map((col) => (
                      <th key={col.key} className="px-2 py-2 font-medium text-foreground/50 text-xs uppercase tracking-wider">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-2 py-2 w-16 text-right">
                      <span className="text-xs text-foreground/50 uppercase tracking-wider">Accion</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {menuData && (menuData as any)[sectionKey]?.map((item: any) => (
                    <tr key={item.id} className="border-b border-dark-border/50 last:border-0 hover:bg-dark-hover/30">
                      {config.columns.map((col) => (
                        <td key={col.key} className="px-2 py-2">
                          {col.type === "number" ? (
                            <input
                              type="number"
                              step="0.01"
                              value={item[col.key] ?? 0}
                              onChange={(e) =>
                                updateItemField(sectionKey, item.id, col.key, parseFloat(e.target.value) || 0)
                              }
                              className="w-full rounded border border-dark-border bg-background px-2 py-1 text-foreground text-sm outline-none transition-colors focus:border-gold/50"
                            />
                          ) : (
                            <input
                              type="text"
                              value={item[col.key] ?? ""}
                              onChange={(e) =>
                                updateItemField(sectionKey, item.id, col.key, e.target.value)
                              }
                              className="w-full rounded border border-dark-border bg-background px-2 py-1 text-foreground text-sm outline-none transition-colors focus:border-gold/50"
                            />
                          )}
                        </td>
                      ))}
                      <td className="px-2 py-2 text-right">
                        <button
                          onClick={() => removeItem(sectionKey, item.id)}
                          className="rounded p-1.5 text-error/50 transition-colors hover:bg-error/10 hover:text-error"
                          title="Eliminar"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => addNewItem(sectionKey)}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-dark-border px-3 py-1.5 text-xs text-foreground/50 transition-colors hover:border-gold/30 hover:text-gold"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agregar nuevo
              </button>
            </div>
          </CollapsibleSection>
        ))}

        {/* WhatsApp config section */}
        <CollapsibleSection
          title="Configuracion"
          open={openSections.config}
          onToggle={() => toggleSection("config")}
        >
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/50 uppercase tracking-wider">
                Numero de WhatsApp para notificaciones
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ej: 13233032084"
                  className="flex-1 rounded-lg border border-dark-border bg-background px-3 py-2 text-sm text-foreground placeholder-foreground/30 outline-none transition-colors focus:border-gold/50"
                />
                <button
                  onClick={saveWhatsAppConfig}
                  disabled={menuSaving || !whatsappNumber}
                  className="rounded-lg border border-gold/30 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {menuSaving ? "Guardando..." : "Actualizar"}
                </button>
              </div>
              <p className="mt-1 text-xs text-foreground/30">
                Sin codigo de pais. Ej: 13233032084 para +1 (323) 303-2084
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Global save button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={saveMenu}
            disabled={menuSaving || !menuData}
            className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {menuSaving ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Guardando...
              </span>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </div>
    );
  };

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="border-b border-dark-border bg-dark-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gold">Tacos Sinaloa Admin</h1>
            {activeTab === "orders" && (
              <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold">
                {orders.length} pedidos
              </span>
            )}
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="rounded-lg border border-dark-border px-3 py-1.5 text-sm text-foreground/50 transition-colors hover:bg-dark-hover"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-4">
        {/* Tab navigation */}
        <div className="mb-4 flex items-center gap-2 border-b border-dark-border pb-3">
          <TabButton
            active={activeTab === "orders"}
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
            label="Pedidos"
            onClick={() => { setActiveTab("orders"); resetNewOrderCount(); }}
            badge={newOrderCount}
          />
          <TabButton
            active={activeTab === "menu"}
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.93a2 2 0 01-1.66-.9l-.82-1.2A2 2 0 007.93 3H4a2 2 0 00-2 2v13c0 1.1.9 2 2 2z" />
                <line x1="12" y1="10" x2="12" y2="16" />
                <line x1="9" y1="13" x2="15" y2="13" />
              </svg>
            }
            label="Menu"
            onClick={() => setActiveTab("menu")}
          />
        </div>

        {/* Tab content */}
        {activeTab === "orders" ? (
          <>
            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-xl border border-dark-border bg-dark-card p-4">
                <p className="text-xs text-foreground/50">Pedidos hoy</p>
                <p className="mt-1 text-2xl font-bold text-gold">{todayOrders.length}</p>
              </div>
              <div className="rounded-xl border border-dark-border bg-dark-card p-4">
                <p className="text-xs text-foreground/50">Total vendido hoy</p>
                <p className="mt-1 text-2xl font-bold text-success">
                  ${todayTotal.toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-dark-border bg-dark-card p-4">
                <p className="text-xs text-foreground/50">Promedio por pedido</p>
                <p className="mt-1 text-2xl font-bold text-gold">
                  ${todayAvg.toFixed(2)}
                </p>
              </div>
            </div>

            {ordersError && (
              <div className="mb-4 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
                {ordersError} — Asegurate de configurar las variables de entorno de Supabase.
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Orders table */}
              <div className="lg:col-span-2">
                <h2 className="mb-3 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                  Pedidos recientes
                </h2>
                {loading ? (
                  <div className="rounded-xl border border-dark-border bg-dark-card p-8 text-center text-foreground/50">
                    Cargando pedidos...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-xl border border-dark-border bg-dark-card p-8 text-center text-foreground/50">
                    No hay pedidos aun. Los pedidos apareceran aqui cuando los clientes ordenen.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          selectedOrder?.id === order.id
                            ? "border-gold bg-gold/5"
                            : "border-dark-border bg-dark-card hover:border-gold/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">
                              {order.customer_name}
                            </p>
                            <p className="text-xs text-foreground/50">
                              {new Date(order.created_at).toLocaleString("es-MX", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="mt-1 text-sm text-foreground/70">
                              {order.order_items?.length || 0} items — ${order.total.toFixed(2)}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Order detail */}
              <div>
                <h2 className="mb-3 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                  Detalle del pedido
                </h2>
                {selectedOrder ? (
                  <div className="rounded-xl border border-dark-border bg-dark-card p-4 space-y-4">
                    <div>
                      <p className="text-lg font-bold text-foreground">{selectedOrder.customer_name}</p>
                      {selectedOrder.customer_phone && (
                        <a
                          href={`tel:${selectedOrder.customer_phone}`}
                          className="text-sm text-gold transition-colors hover:text-gold-light"
                        >
                          {selectedOrder.customer_phone}
                        </a>
                      )}
                      <p className="text-xs text-foreground/50 mt-0.5">
                        {new Date(selectedOrder.created_at).toLocaleString("es-MX")}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground/70">Items:</p>
                      {selectedOrder.order_items?.map((item, i) => (
                        <div key={i} className="rounded-lg border border-dark-border bg-background p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">
                              {item.quantity}x {item.category_name}
                            </span>
                            <span className="text-sm text-gold">${item.total_price.toFixed(2)}</span>
                          </div>
                          {item.meat_name && (
                            <p className="text-xs text-foreground/60">Carne: {item.meat_name}</p>
                          )}
                          {item.toppings && item.toppings.length > 0 && (
                            <p className="text-xs text-foreground/60">
                              Toppings: {Array.isArray(item.toppings) ? item.toppings.join(", ") : item.toppings}
                            </p>
                          )}
                          {item.salsa_name && (
                            <p className="text-xs text-foreground/60">Salsa: {item.salsa_name}</p>
                          )}
                          {item.extras && item.extras.length > 0 && (
                            <p className="text-xs text-foreground/60">
                              Extras: {Array.isArray(item.extras) ? item.extras.join(", ") : item.extras}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-dark-border pt-3">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="text-lg font-bold text-gold">${selectedOrder.total.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground/70">Estado:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["pendiente", "en preparación", "listo", "entregado"] as const).map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(selectedOrder.id, status)}
                              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                                selectedOrder.status === status
                                  ? "border-gold bg-gold/10 text-gold"
                                  : "border-dark-border text-foreground/50 hover:border-gold/30 hover:text-foreground"
                              }`}
                            >
                              {status}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div className="rounded-lg border border-dark-border bg-background p-3">
                        <p className="text-xs font-medium text-foreground/50">Notas:</p>
                        <p className="text-sm text-foreground">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dark-border bg-dark-card p-8 text-center text-foreground/50">
                    Selecciona un pedido para ver el detalle
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Menu tab */
          <>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                Editor de menu
              </h2>
              <p className="mt-1 text-xs text-foreground/30">
                Los cambios se reflejan automaticamente en la pagina de pedidos. Usa &quot;Guardar cambios&quot; para aplicar.
              </p>
            </div>
            {renderMenuEditor()}
          </>
        )}
      </div>
    </div>
  );
}