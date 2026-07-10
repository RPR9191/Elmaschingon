import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { getMenu } from "@/lib/menu-store";

export async function GET() {
  // Try Supabase first
  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("menu_items")
      .select("*, categories(*)")
      .eq("active", true)
      .order("name");

    if (!error && data) {
      return NextResponse.json(data);
    }
    console.warn("[menu] Supabase error, falling back to local store:", error?.message);
  }

  // Fallback: return local menu data
  const localMenu = getMenu();
  return NextResponse.json({
    usingLocal: true,
    categories: localMenu.categories,
    meats: localMenu.meats,
    toppings: localMenu.toppings,
    salsas: localMenu.salsas,
    extras: localMenu.extras,
  });
}