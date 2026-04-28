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

    type InvoiceLike = {
      id: string;
      amount_paid?: number;
      currency?: string;
      customer_email?: string | null;
      subscription?: string | null;
      subscription_details?: { metadata?: Record<string, string> };
      lines?: {
        data?: Array<{ metadata?: Record<string, string> }>;
      };
    };

    type SubscriptionLike = {
      id: string;
      status?: string;
      metadata?: Record<string, string>;
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = (event as unknown as { data: { object: SessionLike } })
          .data.object;
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

      case "invoice.paid": {
        // Recurring subscription renewal. Record each charge as its own
        // donation row keyed by the invoice id so retries stay idempotent.
        const invoice = (event as unknown as { data: { object: InvoiceLike } })
          .data.object;
        const lineMeta = invoice.lines?.data?.[0]?.metadata ?? {};
        const subMeta = invoice.subscription_details?.metadata ?? {};
        const causa = lineMeta.causa || subMeta.causa || "fondo";
        const caso_id = lineMeta.caso_id || subMeta.caso_id || null;
        await db.insertDonation({
          stripe_session_id: invoice.id,
          amount: Math.round((invoice.amount_paid || 0) / 100),
          currency: invoice.currency || "mxn",
          causa,
          recurrente: true,
          email: invoice.customer_email ?? undefined,
          status: "completed",
          caso_id,
        });
        break;
      }

      case "customer.subscription.deleted": {
        // Cancellation. We don't insert a new donation; the last paid invoice
        // already landed via invoice.paid. If a row exists for the subscription
        // session id, leave it as-is — it represents the active-period donation.
        // Future work: persist a cancellation record once we add a subscriptions table.
        const sub = (event as unknown as { data: { object: SubscriptionLike } })
          .data.object;
        void sub; // intentionally no DB write in the current schema
        break;
      }

      case "charge.refunded": {
        // Devolución completa o parcial. Marca la donación como refunded para
        // que no cuente en reportes de transparencia.
        const charge = (event as unknown as {
          data: {
            object: {
              id: string;
              payment_intent?: string | null;
              amount_refunded?: number;
              amount?: number;
            };
          };
        }).data.object;
        await db.updateDonationStatus({
          stripe_session_id: charge.payment_intent ?? charge.id,
          status: "refunded",
        });
        break;
      }

      case "payment_intent.payment_failed": {
        // El cobro falló (tarjeta declinada, autenticación 3DS rechazada, etc.).
        // Marcamos la donación como failed si existe en DB.
        const pi = (event as unknown as {
          data: { object: { id: string } };
        }).data.object;
        await db.updateDonationStatus({
          stripe_session_id: pi.id,
          status: "failed",
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
