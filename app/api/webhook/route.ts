import { type NextRequest, NextResponse } from "next/server";

const MERCADO_PAGO_ACCESS_TOKEN =
  "APP_USR-2303516479543987-062014-1b953593c2522bfea92a27092a437f59-334838550";

export async function POST(request: NextRequest) {
  try {
    console.log("=== WEBHOOK RECEBIDO ===");

    const body = await request.json();
    console.log("Webhook body:", body);

    // Verificar se é uma notificação de pagamento
    if (body.type === "payment") {
      const paymentId = body.data.id;
      console.log("Payment ID:", paymentId);

      // Buscar detalhes do pagamento
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      });

      if (response.ok) {
        const payment = await response.json();
        console.log("Pagamento encontrado:", {
          id: payment.id,
          status: payment.status,
          external_reference: payment.external_reference,
          amount: payment.transaction_amount,
        });

        // Processar pagamento aprovado
        if (payment.status === "approved") {
          console.log("🎉 PAGAMENTO APROVADO!");
          // Aqui você pode enviar email de confirmação, atualizar banco de dados, etc.
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "✅ Webhook funcionando!",
    timestamp: new Date().toISOString(),
  });
}
