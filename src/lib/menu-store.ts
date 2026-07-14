import fs from "fs";
import path from "path";
import { Category, Meat, Topping, Salsa, Extra } from "./types";

export interface MenuData {
  categories: Category[];
  meats: Meat[];
  toppings: Topping[];
  salsas: Salsa[];
  extras: Extra[];
  config: {
    whatsapp_number: string;
  };
}

const MENU_FILE = path.join(process.cwd(), "data", "menu.json");

type SectionKey = keyof MenuData;

const VALID_SECTIONS: SectionKey[] = [
  "categories",
  "meats",
  "toppings",
  "salsas",
  "extras",
];

const ITEM_SECTIONS: SectionKey[] = [
  "categories",
  "meats",
  "toppings",
  "salsas",
  "extras",
];

function isSectionKey(key: string): key is SectionKey {
  return (VALID_SECTIONS as string[]).includes(key);
}

function isItemSection(key: SectionKey): boolean {
  return (ITEM_SECTIONS as string[]).includes(key);
}

const HARDCODED_MENU: MenuData = {
  categories: [
    { id: 1, name: "Tacos", base_price: 3, icon: "taco", sort_order: 1 },
    { id: 2, name: "Chorreadas", base_price: 7, icon: "", sort_order: 2 },
    { id: 3, name: "Vampiros", base_price: 6.5, icon: "", sort_order: 3 },
    { id: 4, name: "Gringas", base_price: 16, icon: "", sort_order: 4 },
    { id: 5, name: "Burritos", base_price: 13, icon: "", sort_order: 5 },
    { id: 6, name: "Quesadillas", base_price: 9, icon: "", sort_order: 6 },
  ],
  meats: [
    { id: 1, name: "Carne Asada", description: "" },
    { id: 2, name: "Al Pastor", description: "" },
    { id: 3, name: "Pollo", description: "" },
    { id: 4, name: "Chorizo", description: "" },
    { id: 5, name: "Cabeza", description: "" },
  ],
  toppings: [
    { id: 1, name: "Cebolla", extra_price: 0 },
    { id: 2, name: "Cilantro", extra_price: 0 },
    { id: 3, name: "Lechuga", extra_price: 0 },
    { id: 4, name: "Jitomate", extra_price: 0 },
    { id: 5, name: "Frijoles", extra_price: 1 },
    { id: 6, name: "Arroz", extra_price: 1 },
    { id: 7, name: "Crema", extra_price: 0 },
    { id: 8, name: "Aguacate", extra_price: 1.5 },
  ],
  salsas: [
    { id: 1, name: "Salsa Roja", description: "" },
    { id: 2, name: "Salsa Verde", description: "" },
    { id: 3, name: "Salsa de Guacamole", description: "" },
    { id: 4, name: "Salsa Habanero", description: "" },
  ],
  extras: [
    { id: 1, name: "Queso extra", price: 1 },
    { id: 2, name: "Más carne", price: 3 },
    { id: 3, name: "Totopos con salsa", price: 2 },
  ],
  config: { whatsapp_number: "13233032084" },
};

/**
 * Try to read menu from file. On any failure (file not found, read error, parse error,
 * or readonly filesystem in serverless), return the hardcoded default menu.
 */
export function getMenu(): MenuData {
  try {
    if (fs.existsSync(MENU_FILE)) {
      const raw = fs.readFileSync(MENU_FILE, "utf-8");
      const parsed = JSON.parse(raw) as MenuData;
      // Return hardcoded data if the file is empty (no categories, etc.)
      if (!parsed.categories || parsed.categories.length === 0) {
        return HARDCODED_MENU;
      }
      return parsed;
    }
  } catch {
    // File doesn't exist or can't be read (e.g. Vercel serverless)
  }
  return HARDCODED_MENU;
}

/**
 * Try to save menu to file. Silently catches errors (readonly filesystem in serverless).
 */
export function saveMenu(data: MenuData): boolean {
  try {
    const dir = path.dirname(MENU_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MENU_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    // Cannot write (readonly filesystem in Vercel serverless)
    return false;
  }
}

export function updateSection(section: string, items: unknown[]): MenuData {
  if (!isSectionKey(section)) {
    throw new Error(`Seccion invalida: ${section}`);
  }
  const menu = getMenu();
  (menu as any)[section] = items;
  saveMenu(menu);
  return menu;
}

export function addItem(section: string, item: Record<string, unknown>): MenuData {
  if (!isSectionKey(section) || !isItemSection(section as SectionKey)) {
    throw new Error(`Seccion invalida: ${section}`);
  }
  const menu = getMenu();
  const items = menu[section] as unknown as Record<string, unknown>[];
  const maxId = items.reduce((max, i) => Math.max(max, (i.id as number) || 0), 0);
  const newItem = { ...item, id: maxId + 1 };
  items.push(newItem as any);
  saveMenu(menu);
  return menu;
}

export function deleteItem(section: string, id: number): MenuData {
  if (!isSectionKey(section) || !isItemSection(section as SectionKey)) {
    throw new Error(`Seccion invalida: ${section}`);
  }
  const menu = getMenu();
  const items = menu[section] as unknown as Record<string, unknown>[];
  const filtered = items.filter((i) => (i.id as number) !== id);
  if (filtered.length === items.length) {
    throw new Error(`Item con id ${id} no encontrado en ${section}`);
  }
  (menu as any)[section] = filtered;
  saveMenu(menu);
  return menu;
}

export function getConfig(): { whatsapp_number: string } {
  const menu = getMenu();
  return menu.config || { whatsapp_number: "13233032084" };
}

export function updateConfig(config: Partial<{ whatsapp_number: string }>): MenuData {
  const menu = getMenu();
  menu.config = { ...menu.config, ...config };
  saveMenu(menu);
  return menu;
}
