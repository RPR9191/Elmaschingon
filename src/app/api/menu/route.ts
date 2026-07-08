import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!supabaseAdmin) {
    // Return local menu data as fallback
    return NextResponse.json({ usingLocal: true });
  }

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .select("*, categories(*)")
    .eq("active", true)
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}