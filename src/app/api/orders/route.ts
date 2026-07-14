import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { getOrders, createOrder } from "@/lib/order-store";

export async function GET() {
  // Try Supabase first
  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json(data);
    }
    console.warn("[orders] Supabase error on GET, falling back to local store:", error?.message);
  }

  // Fallback: return local orders
  const localOrders = getOrders();
  return NextResponse.json(localOrders);
}

export async function POST(request: NextRequest) {
  // Parse body once and reuse
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body invalido" },
      { status: 400 }
    );
  }

  const { customer_name, customer_phone, items, total, notes, payment_method } = body;

  if (!customer_name || !items || items.length === 0) {
    return NextResponse.json(
      { error: "Nombre del cliente y al menos un item son requeridos" },
      { status: 400 }
    );
  }

  // Try Supabase first
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
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
        console.warn("[orders] Supabase error on POST, falling back to local store:", orderError.message);
      } else {
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
          console.warn("[orders] Supabase error inserting items, falling back to local store:", itemsError.message);
        } else {
          return NextResponse.json({ success: true, order_id: order.id }, { status: 201 });
        }
      }
    } catch (err) {
      console.warn("[orders] Supabase POST exception, falling back to local store:", err);
    }
  }

  // Fallback: save order locally (memory-only in Vercel serverless)
  try {
    const order = createOrder({
      customer_name,
      customer_phone: customer_phone || "",
      items: items.map((item: any) => ({
        category_name: item.category_name,
        meat_name: item.meat_name || null,
        toppings: item.toppings || [],
        salsa_name: item.salsa_name || null,
        extras: item.extras || [],
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
      total,
      notes: notes || "",
      payment_method: payment_method || "efectivo",
    });

    return NextResponse.json({ success: true, order_id: order.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}