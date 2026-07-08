import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase no configurado" },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["pendiente", "en preparación", "listo", "entregado"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado invalido. Debe ser: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}