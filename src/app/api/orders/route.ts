import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase no configurado. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local" },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase no configurado" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { customer_name, customer_phone, items, total, notes, payment_method } = body;

    if (!customer_name || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Nombre del cliente y al menos un item son requeridos" },
        { status: 400 }
      );
    }

    // Insert the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name,
        customer_phone: customer_phone || "",
        total,
        status: "pendiente",
        payment_method: payment_method || "efectivo",
        notes: notes || "",
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      category_name: item.category_name,
      meat_name: item.meat_name || null,
      toppings: item.toppings || [],
      salsa_name: item.salsa_name || null,
      extras: item.extras || [],
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order_id: order.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}