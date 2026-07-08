"use client";

import React from "react";
import { CartItem } from "@/lib/types";

interface OrderModalProps {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onSendWhatsApp: () => void;
  onSaveOrder: () => void;
  saving: boolean;
}

export default function OrderModal({
  items,
  customerName,
  customerPhone,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onClose,
  onRemoveItem,
  onSendWhatsApp,
  onSaveOrder,
  saving,
}: OrderModalProps) {
  const total = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-dark-border bg-dark-card sm:rounded-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border px-5 py-4">
          <h2 className="text-lg font-bold text-foreground">Tu pedido</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-foreground/50 transition-colors hover:bg-dark-hover hover:text-foreground"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-dark-border bg-background p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gold">
                      {item.quantity}x
                    </span>
                    <h3 className="font-semibold text-foreground">
                      {item.category.name}
                    </h3>
                  </div>
                  {item.meat && (
                    <p className="mt-0.5 text-sm text-foreground/70">{item.meat.name}</p>
                  )}
                  {item.toppings.length > 0 && (
                    <p className="text-xs text-foreground/50">
                      Toppings: {item.toppings.map((t) => t.name).join(", ")}
                    </p>
                  )}
                  {item.salsa && (
                    <p className="text-xs text-foreground/50">
                      Salsa: {item.salsa.name}
                    </p>
                  )}
                  {item.extras.length > 0 && (
                    <p className="text-xs text-foreground/50">
                      Extras: {item.extras.map((e) => e.name).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gold">
                    ${item.total_price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="rounded p-1 text-error/60 transition-colors hover:bg-error/10 hover:text-error"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer info */}
        <div className="border-t border-dark-border px-5 py-4 space-y-3">
          <input
            type="text"
            placeholder="Tu nombre *"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="w-full rounded-lg border border-dark-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-foreground/30 outline-none transition-colors focus:border-gold/50"
          />
          <input
            type="tel"
            placeholder="Tu telefono (opcional)"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            className="w-full rounded-lg border border-dark-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-foreground/30 outline-none transition-colors focus:border-gold/50"
          />
        </div>

        {/* Total & actions */}
        <div className="border-t border-dark-border px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/70">Total</span>
            <span className="text-xl font-bold text-gold">${total.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSaveOrder}
              disabled={!customerName.trim() || saving}
              className="flex-1 rounded-lg border border-gold/30 px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Guardando..." : "Guardar pedido"}
            </button>
            <button
              onClick={onSendWhatsApp}
              disabled={!customerName.trim()}
              className="flex-1 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-gold-dark active:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enviar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}