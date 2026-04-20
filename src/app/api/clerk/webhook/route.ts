import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Clerk webhook — mantiene la tabla `usuarios` sincronizada con Clerk.
 * Config en Clerk Dashboard → Webhooks → Add endpoint.
 * Secret va en CLERK_WEBHOOK_SECRET.
 *
 * Eventos escuchados: user.created, user.updated, user.deleted.
 */
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: true, skipped: "clerk-webhook-not-configured" },
      { status: 200 }
    );
  }

  const h = await headers();
  const svixId = h.get("svix-id");
  const svixTimestamp = h.get("svix-timestamp");
  const svixSignature = h.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();

  type ClerkEmailAddress = { id: string; email_address: string };
  type ClerkUserData = {
    id: string;
    email_addresses?: ClerkEmailAddress[];
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    public_metadata?: { ciudad?: string; rol?: string };
  };
  type ClerkEvent = { type: string; data: ClerkUserData };

  let evt: ClerkEvent;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("[clerk-webhook:verify:error]", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const user = evt.data;
      const primary =
        user.email_addresses?.find(
          (e) => e.id === user.primary_email_address_id
        ) || user.email_addresses?.[0];
      const email = primary?.email_address;
      if (!email) {
        return NextResponse.json({ ok: true, skipped: "no-email" });
      }
      const nombre =
        [user.first_name, user.last_name].filter(Boolean).join(" ") || null;

      await db.upsertUser({
        clerk_user_id: user.id,
        email,
        nombre,
        ciudad: user.public_metadata?.ciudad ?? null,
        rol: user.public_metadata?.rol ?? null,
      });
    }

    if (evt.type === "user.deleted" && db.raw) {
      const user = evt.data;
      await db.raw`delete from usuarios where clerk_user_id = ${user.id}`;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[clerk-webhook:handle:error]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
