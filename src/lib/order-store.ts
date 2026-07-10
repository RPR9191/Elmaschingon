import fs from "fs";
import path from "path";
import { Order, OrderItem, OrderStatus } from "./types";

interface StoredOrder {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: OrderStatus;
  payment_method: string;
  notes: string;
  order_items: OrderItem[];
}

const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json");

function ensureOrdersFile(): void {
  const dir = path.dirname(ORDERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function readOrders(): StoredOrder[] {
  ensureOrdersFile();
  try {
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(raw) as StoredOrder[];
  } catch {
    return [];
  }
}

function writeOrders(orders: StoredOrder[]): void {
  ensureOrdersFile();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export function getOrders(): StoredOrder[] {
  return readOrders();
}

export function getOrder(id: number): StoredOrder | null {
  const orders = readOrders();
  return orders.find((o) => o.id === id) || null;
}

export function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
  notes?: string;
  payment_method?: string;
}): StoredOrder {
  const orders = readOrders();
  const maxId = orders.reduce((max, o) => Math.max(max, o.id), 0);
  const newOrder: StoredOrder = {
    id: maxId + 1,
    created_at: new Date().toISOString(),
    customer_name: data.customer_name,
    customer_phone: data.customer_phone || "",
    total: data.total,
    status: "pendiente",
    payment_method: data.payment_method || "efectivo",
    notes: data.notes || "",
    order_items: data.items || [],
  };
  orders.unshift(newOrder);
  writeOrders(orders);
  return newOrder;
}

export function updateOrderStatus(id: number, status: OrderStatus): StoredOrder | null {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status };
  writeOrders(orders);
  return orders[idx];
}