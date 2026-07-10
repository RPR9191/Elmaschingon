import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { updateOrderStatus } from "@/lib/order-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["pendiente", "en preparación", "listo", "entregado"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado invalido. Debe ser: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Try Supabase first
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .update({ status })
        .eq("id", numericId)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json(data);
      }
      console.warn("[orders/:id] Supabase error on PATCH, falling back to local store:", error?.message);
    }

    // Fallback: update locally
    const updated = updateOrderStatus(numericId, status);
    if (!updated) {
      return NextResponse.json(
        { error: `Orden con id ${id} no encontrada` },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}