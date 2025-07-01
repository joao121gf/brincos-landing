import { type NextRequest, NextResponse } from "next/server";

const MERCADO_PAGO_ACCESS_TOKEN =
  "APP_USR-2303516479543987-062014-1b953593c2522bfea92a27092a437f59-334838550";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, payer, external_reference } = body;

    const preference = {
      items: [
        {
          title: description,
          quantity: 1,
          unit_price: amount,
          currency_id: "BRL",
        },
      ],
      payer: {
        name: payer.name,
        email: payer.email,
        phone: {
          number: payer.phone,
        },
      },
      payment_methods: {
        excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }],
        excluded_payment_methods: [],
        installments: 1,
      },
      external_reference: external_reference,
      notification_url: `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://brincos-landing.vercel.app/"
      }/api/webhook`,
      back_urls: {
        success: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://brincos-landing.vercel.app/"
        }/success`,
        failure: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://brincos-landing.vercel.app/"
        }/failure`,
        pending: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://brincos-landing.vercel.app/"
        }/pending`,
      },
      auto_return: "approved",
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      throw new Error(`Mercado Pago API error: ${response.status}`);
    }

    const data = await response.json();

    // Criar pagamento PIX específico
    const pixPayment = {
      transaction_amount: amount,
      description: description,
      payment_method_id: "pix",
      payer: {
        email: payer.email,
        first_name: payer.name.split(" ")[0],
        last_name: payer.name.split(" ").slice(1).join(" ") || payer.name.split(" ")[0],
      },
      external_reference: external_reference,
    };

    const pixResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pixPayment),
    });

    if (!pixResponse.ok) {
      throw new Error(`PIX payment error: ${pixResponse.status}`);
    }

    const pixData = await pixResponse.json();

    return NextResponse.json({
      success: true,
      preference_id: data.id,
      init_point: data.init_point,
      pix_qr_code: pixData.point_of_interaction?.transaction_data?.qr_code,
      pix_qr_code_base64: pixData.point_of_interaction?.transaction_data?.qr_code_base64,
      payment_id: pixData.id,
      ticket_url: pixData.point_of_interaction?.transaction_data?.ticket_url,
    });
  } catch (error) {
    console.error("Error creating PIX payment:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar pagamento PIX" },
      { status: 500 }
    );
  }
}
