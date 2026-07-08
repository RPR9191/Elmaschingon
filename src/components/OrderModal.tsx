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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-dark-border/50 bg-dark-card shadow-2xl shadow-black/40 sm:rounded-2xl mx-3 sm:mx-4 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-border/50 px-5 py-4">
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            Tu pedido
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-foreground/40 transition-all hover:bg-dark-hover hover:text-foreground active:scale-90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
          {items.length === 0 ? (
            <p className="text-center text-sm text-foreground/40 py-8">No hay items en tu pedido</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-dark-border/40 bg-background/80 p-3.5 transition-all hover:border-gold/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center min-w-[2rem] h-6 rounded-md bg-gold/10 px-1.5 text-sm font-bold text-gold">
                        {item.quantity}x
                      </span>
                      <h3 className="font-semibold text-foreground truncate">
                        {item.category.name}
                      </h3>
                    </div>
                    {item.meat && (
                      <p className="mt-1 text-sm text-foreground/70 pl-[2.5rem]">{item.meat.name}</p>
                    )}
                    {item.toppings.length > 0 && (
                      <p className="text-xs text-foreground/50 pl-[2.5rem]">
                        Toppings: {item.toppings.map((t) => t.name).join(", ")}
                      </p>
                    )}
                    {item.salsa && (
                      <p className="text-xs text-foreground/50 pl-[2.5rem]">
                        Salsa: {item.salsa.name}
                      </p>
                    )}
                    {item.extras.length > 0 && (
                      <p className="text-xs text-foreground/50 pl-[2.5rem]">
                        Extras: {item.extras.map((e) => e.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-semibold text-gold">
                      ${item.total_price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="rounded-lg p-1.5 text-error/50 transition-all hover:bg-error/10 hover:text-error active:scale-90"
                      title="Eliminar"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer info */}
        <div className="border-t border-dark-border/50 px-5 py-4 space-y-3">
          <input
            type="text"
            placeholder="Tu nombre *"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="w-full rounded-xl border border-dark-border/60 bg-background px-3.5 py-3 text-sm text-foreground placeholder-foreground/25 outline-none transition-all focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
          />
          <input
            type="tel"
            placeholder="Tu teléfono (opcional)"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            className="w-full rounded-xl border border-dark-border/60 bg-background px-3.5 py-3 text-sm text-foreground placeholder-foreground/25 outline-none transition-all focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
          />
        </div>

        {/* Total & actions */}
        <div className="border-t border-dark-border/50 px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/60">Total</span>
            <span className="text-xl font-bold text-gold">${total.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={onSaveOrder}
              disabled={!customerName.trim() || saving}
              className="flex-1 rounded-xl border border-gold/20 px-4 py-3 text-sm font-medium text-gold transition-all hover:bg-gold/5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
            >
              {saving ? "Guardando..." : "Guardar pedido"}
            </button>
            <button
              onClick={onSendWhatsApp}
              disabled={!customerName.trim()}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
              style={{
                backgroundColor: "#25D366",
                boxShadow: "0 4px 14px rgba(37, 211, 102, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#20BD5A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#25D366";
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar por WhatsApp
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}