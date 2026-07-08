import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

interface OrderItem {
  category_name: string;
  meat_name: string | null;
  toppings: string[];
  salsa_name: string | null;
  extras: string[];
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface NotifyBody {
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
}

function buildEmailHtml(body: NotifyBody, timestamp: string): string {
  const itemRows = body.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #333;text-align:left;">
        ${item.quantity}x ${item.category_name}
        ${item.meat_name ? `<br><span style="color:#999;font-size:12px;">Carne: ${item.meat_name}</span>` : ""}
        ${item.toppings.length > 0 ? `<br><span style="color:#999;font-size:12px;">Toppings: ${item.toppings.join(", ")}</span>` : ""}
        ${item.salsa_name ? `<br><span style="color:#999;font-size:12px;">Salsa: ${item.salsa_name}</span>` : ""}
        ${item.extras.length > 0 ? `<br><span style="color:#999;font-size:12px;">Extras: ${item.extras.join(", ")}</span>` : ""}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #333;text-align:right;white-space:nowrap;">
        $${item.total_price.toFixed(2)}
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border-radius:12px;border:1px solid #222;overflow:hidden;">
          <tr>
            <td style="background:#c9a03c;padding:20px 24px;text-align:center;">
              <h1 style="margin:0;font-size:22px;color:#0a0a0a;">🛒 ¡Nuevo Pedido!</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#0a0a0a;opacity:0.8;">Tacos Sinaloa</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:#c9a03c;font-size:14px;font-weight:600;">Cliente</td>
                  <td style="padding:6px 0;color:#eee;font-size:14px;text-align:right;">${body.customer_name}</td>
                </tr>
                ${
                  body.customer_phone
                    ? `<tr>
                  <td style="padding:6px 0;color:#c9a03c;font-size:14px;font-weight:600;">Teléfono</td>
                  <td style="padding:6px 0;color:#eee;font-size:14px;text-align:right;">${body.customer_phone}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:6px 0;color:#c9a03c;font-size:14px;font-weight:600;">Fecha / Hora</td>
                  <td style="padding:6px 0;color:#eee;font-size:14px;text-align:right;">${timestamp}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="background:#1a1a1a;padding:8px 12px;border-radius:6px 6px 0 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">
                    Items del pedido
                  </td>
                  <td style="background:#1a1a1a;padding:8px 12px;border-radius:6px 6px 0 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">
                    Total
                  </td>
                </tr>
                ${itemRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 0;border-top:2px solid #c9a03c;font-size:16px;font-weight:700;color:#eee;">
                    TOTAL
                  </td>
                  <td style="padding:12px 0;border-top:2px solid #c9a03c;font-size:18px;font-weight:700;color:#c9a03c;text-align:right;">
                    $${body.total.toFixed(2)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#0d0d0d;padding:12px 24px;text-align:center;border-top:1px solid #222;">
              <p style="margin:0;font-size:11px;color:#555;">
                Tacos Sinaloa · Notificación automática de pedido
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotifyBody = await request.json();

    if (!body.customer_name || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Nombre del cliente y al menos un item son requeridos" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString("es-MX", {
      timeZone: "America/Mexico_City",
      dateStyle: "full",
      timeStyle: "short",
    });

    // ── Email via Resend (if configured) ──
    let emailSent = false;

    if (RESEND_API_KEY) {
      try {
        const html = buildEmailHtml(body, timestamp);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Pedidos Tacos Sinaloa <onboarding@resend.dev>",
            to: ["efraying@gmail.com"],
            subject: `🛒 Nuevo pedido — ${body.customer_name} — $${body.total.toFixed(2)}`,
            html,
          }),
        });

        emailSent = res.ok;
        if (!emailSent) {
          const errText = await res.text();
          console.warn(`[notify] Resend error (${res.status}): ${errText}`);
        }
      } catch (err) {
        console.warn("[notify] Error al enviar email:", err);
      }
    } else {
      console.info(
        "[notify] RESEND_API_KEY no configurado. Email no enviado."
      );
    }

    return NextResponse.json({
      success: true,
      email_sent: emailSent,
      message: emailSent
        ? "Notificación enviada"
        : "Pedido registrado (email no configurado — agrega RESEND_API_KEY en .env.local)",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
