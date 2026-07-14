import { NextRequest, NextResponse } from "next/server";
import {
  getMenu,
  saveMenu,
  updateSection,
  addItem,
  deleteItem,
  updateConfig,
} from "@/lib/menu-store";

/**
 * GET /api/menu/admin
 * Returns the full menu data (categories, meats, toppings, salsas, extras, config)
 */
export async function GET() {
  try {
    const menu = getMenu();
    return NextResponse.json(menu);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al leer el menu" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/menu/admin
 * Body: { section: string, items?: any[], item?: any, config?: any }
 *
 * Actions based on body content:
 * - { section: "categories"|"meats"|"toppings"|"salsas"|"extras", items: [...] } -> replace entire section
 * - { section: "...", item: {...} } -> add new item to section
 * - { config: {...} } -> update config (whatsapp number, etc.)
 * - { ... } -> full menu replacement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Update config
    if (body.config && !body.categories && !body.meats && !body.toppings && !body.salsas && !body.extras) {
      const menu = updateConfig(body.config);
      return NextResponse.json(menu);
    }

    // Update a section with new items array
    if (body.section && body.items !== undefined) {
      const menu = updateSection(body.section, body.items);
      // If this is a full menu save from the admin panel, handle it
      return NextResponse.json(menu);
    }

    // Add a new item to a section
    if (body.section && body.item) {
      const menu = addItem(body.section, body.item);
      return NextResponse.json(menu);
    }

    // Full menu replacement (sent by admin "Guardar cambios" button)
    if (body.categories || body.meats || body.toppings || body.salsas || body.extras) {
      const current = getMenu();
      const updated = {
        ...current,
        ...(body.categories !== undefined ? { categories: body.categories } : {}),
        ...(body.meats !== undefined ? { meats: body.meats } : {}),
        ...(body.toppings !== undefined ? { toppings: body.toppings } : {}),
        ...(body.salsas !== undefined ? { salsas: body.salsas } : {}),
        ...(body.extras !== undefined ? { extras: body.extras } : {}),
        ...(body.config !== undefined ? { config: body.config } : {}),
      };
      const saved = saveMenu(updated);
      // Always return the data, even if persistence failed
      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "Body invalido. Envia { section, items }, { section, item }, o { config }" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/menu/admin
 * Body: { section: string, id: number }
 * Deletes an item from the specified section by id
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, id } = body;

    if (!section || id === undefined) {
      return NextResponse.json(
        { error: "Se requiere 'section' y 'id'" },
        { status: 400 }
      );
    }

    const menu = deleteItem(section, id);
    return NextResponse.json(menu);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Error al eliminar item",
      },
      { status: 500 }
    );
  }
}