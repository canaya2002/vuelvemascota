import { NextResponse } from "next/server";
import { STRIPE_CONFIG, stripeEnabled } from "@/lib/stripe";
import { getStripe } from "@/lib/stripeClient";

export const dynamic = "force-dynamic";

type Body = {
  amount?: number;
  recurrente?: boolean;
  causa?: string;
  currency?: string;
};

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const amount = Math.round(Number(body.amount || 0));
  const recurrente = !!body.recurrente;
  const causa = ["fondo", "emergencia", "rescate"].includes(body.causa || "")
    ? (body.causa as string)
    : "fondo";

  if (!amount || amount < STRIPE_CONFIG.minAmount) {
    return NextResponse.json(
      { error: `El monto mínimo es $${STRIPE_CONFIG.minAmount} MXN.` },
      { status: 400 }
    );
  }

  // If Stripe is not configured yet, return a soft, production-safe response.
  if (!stripeEnabled()) {
    return NextResponse.json(
      {
        ok: true,
        preview: true,
        message:
          "Estamos finalizando la conexión con Stripe. Te avisaremos por correo apenas podamos procesar tu donación.",
      },
      { status: 200 }
    );
  }

  // Live path — activated when STRIPE_SECRET_KEY is set and `stripe` is installed.
  try {
    const stripe = await getStripe();

    const successUrl = `${STRIPE_CONFIG.publicSiteUrl}/donar/gracias?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${STRIPE_CONFIG.publicSiteUrl}/donar?canceled=1`;

    const session = await stripe.checkout.sessions.create({
      mode: recurrente ? "subscription" : "payment",
      currency: STRIPE_CONFIG.currency,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: false,
      metadata: { causa },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: STRIPE_CONFIG.currency,
            unit_amount: amount * 100,
            product_data: {
              name: STRIPE_CONFIG.productName(causa),
              description: recurrente
                ? "Donación mensual a VuelveaCasa"
                : "Donación única a VuelveaCasa",
            },
            recurring: recurrente ? { interval: "month" } : undefined,
          },
        },
      ],
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "No pudimos iniciar el pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
