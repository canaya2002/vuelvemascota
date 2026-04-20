import { NextResponse } from "next/server";
import { stripeEnabled } from "@/lib/stripe";
import { getStripe } from "@/lib/stripeClient";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { ok: true, skipped: "stripe-not-configured" },
      { status: 200 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const raw = await req.text();

  try {
    const stripe = await getStripe();
    const event = stripe.webhooks.constructEvent(
      raw,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    type SessionLike = {
      id: string;
      amount_total?: number;
      currency?: string;
      mode?: string;
      metadata?: Record<string, string>;
      customer_details?: { email?: string };
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = (event as unknown as { data: { object: SessionLike } }).data.object;
        await db.insertDonation({
          stripe_session_id: session.id,
          amount: Math.round((session.amount_total || 0) / 100),
          currency: session.currency || "mxn",
          causa: (session.metadata?.causa as string) || "fondo",
          recurrente: session.mode === "subscription",
          email: session.customer_details?.email,
          status: "completed",
          caso_id: session.metadata?.caso_id || null,
        });
        break;
      }
      case "invoice.paid":
      case "customer.subscription.deleted":
        // TODO: reconcile recurring donations when needed.
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
