export interface Category {
  id: number;
  name: string;
  icon: string;
  base_price: number;
  sort_order: number;
}

export interface Meat {
  id: number;
  name: string;
  description: string;
}

export interface Topping {
  id: number;
  name: string;
  extra_price: number;
}

export interface Salsa {
  id: number;
  name: string;
  description: string;
}

export interface Extra {
  id: number;
  name: string;
  price: number;
}

export interface MenuItem {
  id: number;
  name: string;
  category_id: number;
  base_price: number;
  active: boolean;
}

export interface CartItem {
  id: string;
  category: Category;
  meat: Meat | null;
  toppings: Topping[];
  salsa: Salsa | null;
  extras: Extra[];
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderItem {
  category_name: string;
  meat_name: string | null;
  toppings: string[];
  salsa_name: string | null;
  extras: string[];
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderPayload {
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
  notes: string;
  payment_method: string;
}

export interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: "pendiente" | "en preparación" | "listo" | "entregado";
  payment_method: string;
  notes: string;
  order_items: OrderItem[];
}

export type OrderStatus = "pendiente" | "en preparación" | "listo" | "entregado";

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: "text-warning",
  "en preparación": "text-gold",
  listo: "text-success",
  entregado: "text-foreground/50",
};