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

function ensureMenuFile(): void {
  const dir = path.dirname(MENU_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(MENU_FILE)) {
    const defaultData: MenuData = {
      categories: [],
      meats: [],
      toppings: [],
      salsas: [],
      extras: [],
      config: {
        whatsapp_number: "13233032084",
      },
    };
    fs.writeFileSync(MENU_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
  }
}

export function getMenu(): MenuData {
  ensureMenuFile();
  try {
    const raw = fs.readFileSync(MENU_FILE, "utf-8");
    return JSON.parse(raw) as MenuData;
  } catch {
    const defaultData: MenuData = {
      categories: [],
      meats: [],
      toppings: [],
      salsas: [],
      extras: [],
      config: { whatsapp_number: "13233032084" },
    };
    fs.writeFileSync(MENU_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
    return defaultData;
  }
}

export function saveMenu(data: MenuData): void {
  ensureMenuFile();
  fs.writeFileSync(MENU_FILE, JSON.stringify(data, null, 2), "utf-8");
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