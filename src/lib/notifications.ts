"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────

export interface OrderNotificationItem {
  category_name: string;
  meat_name: string | null;
  toppings: string[];
  salsa_name: string | null;
  extras: string[];
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderNotificationPayload {
  customer_name: string;
  customer_phone: string;
  items: OrderNotificationItem[];
  total: number;
}

// ──────────────────────────────────────────────
// Email
// ──────────────────────────────────────────────

/**
 * Envía una notificación por email sobre un nuevo pedido
 * llamando al endpoint /api/notify del servidor.
 */
export async function sendEmailNotification(
  order: OrderNotificationPayload
): Promise<boolean> {
  try {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return res.ok;
  } catch {
    console.warn("sendEmailNotification: error de conexión");
    return false;
  }
}

// ──────────────────────────────────────────────
// Sonido
// ──────────────────────────────────────────────

/**
 * Reproduce un beep corto usando la Web Audio API.
 * No requiere archivos externos.
 */
export function playNotificationSound(): void {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 880;
    osc.type = "sine";

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio no disponible — silencioso
  }
}

// ──────────────────────────────────────────────
// Hook para el admin
// ──────────────────────────────────────────────

/**
 * Hook que monitorea la cantidad de pedidos y:
 *  - reproduce un sonido cuando llega un pedido nuevo
 *  - mantiene un contador de pedidos nuevos no leídos
 *
 * @param ordersLength - longitud actual del array de pedidos
 * @returns { newOrderCount, resetNewOrderCount }
 */
export function useOrderNotifications(
  ordersLength: number
): { newOrderCount: number; resetNewOrderCount: () => void } {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const prevLength = useRef(ordersLength);

  useEffect(() => {
    if (ordersLength > prevLength.current) {
      const diff = ordersLength - prevLength.current;
      setNewOrderCount((n) => n + diff);
      playNotificationSound();
    }
    prevLength.current = ordersLength;
  }, [ordersLength]);

  const resetNewOrderCount = useCallback(() => setNewOrderCount(0), []);

  return { newOrderCount, resetNewOrderCount };
}