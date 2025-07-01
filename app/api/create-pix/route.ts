import { type NextRequest, NextResponse } from "next/server"

const MERCADO_PAGO_ACCESS_TOKEN = "APP_USR-2303516479543987-062014-1b953593c2522bfea92a27092a437f59-334838550"

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIANDO CRIAÇÃO PIX ===")

    const body = await request.json()
    console.log("Body recebido:", body)

    const { amount, description, payer, external_reference } = body

    // Validar dados obrigatórios
    if (!amount || !description || !payer || !external_reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados obrigatórios faltando",
          received: { amount, description, payer: !!payer, external_reference },
        },
        { status: 400 },
      )
    }

    // Criar pagamento PIX
    const pixPayment = {
      transaction_amount: Number(amount),
      description: String(description),
      payment_method_id: "pix",
      payer: {
        email: payer.email || "cliente@exemplo.com",
        first_name: payer.name?.split(" ")[0] || "Cliente",
        last_name: payer.name?.split(" ").slice(1).join(" ") || "Brincos",
      },
      external_reference: String(external_reference),
    }

    console.log("Payload para Mercado Pago:", JSON.stringify(pixPayment, null, 2))

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": String(external_reference),
      },
      body: JSON.stringify(pixPayment),
    })

    const responseText = await response.text()
    console.log("Status Mercado Pago:", response.status)
    console.log("Resposta Mercado Pago:", responseText)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Erro Mercado Pago: ${response.status}`,
          details: responseText,
        },
        { status: 500 },
      )
    }

    const pixData = JSON.parse(responseText)
    console.log("PIX criado com sucesso:", pixData.id)

    return NextResponse.json({
      success: true,
      payment_id: pixData.id,
      status: pixData.status,
      pix_qr_code: pixData.point_of_interaction?.transaction_data?.qr_code,
      pix_qr_code_base64: pixData.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: pixData.point_of_interaction?.transaction_data?.ticket_url,
    })
  } catch (error) {
    console.error("=== ERRO NA API ===", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

// Método GET para teste
export async function GET() {
  return NextResponse.json({
    message: "✅ API PIX funcionando!",
    timestamp: new Date().toISOString(),
    url: "https://brincos-landing.vercel.app",
    mercado_pago_configured: !!MERCADO_PAGO_ACCESS_TOKEN,
  })
}
