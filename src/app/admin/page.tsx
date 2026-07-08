"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Order, OrderStatus, STATUS_COLORS } from "@/lib/types";

const ADMIN_PASSWORD = "tacos2024";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchOrders();
      // Poll every 10 seconds
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [authenticated, fetchOrders]);

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
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      alert("Error al actualizar estado");
    }
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

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="border-b border-dark-border bg-dark-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gold">Tacos Sinaloa Admin</h1>
            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold">
              {orders.length} pedidos
            </span>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="rounded-lg border border-dark-border px-3 py-1.5 text-sm text-foreground/50 transition-colors hover:bg-dark-hover"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
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

        {error && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
            {error} — Asegurate de configurar las variables de entorno de Supabase.
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

                {/* Order items */}
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

                {/* Status buttons */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground/70">Estado:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["pendiente", "en preparación", "listo", "entregado"] as OrderStatus[]).map(
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
      </div>
    </div>
  );
}