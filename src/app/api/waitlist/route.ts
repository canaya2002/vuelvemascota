import { NextResponse } from "next/server";
import { validateWaitlist } from "@/lib/validations";
import { db } from "@/lib/db";
import { sendEmail, waitlistWelcome } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const result = validateWaitlist(form);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 400 }
    );
  }

  await db.insertWaitlist(result.data);

  const tmpl = waitlistWelcome(result.data.nombre);
  sendEmail({
    to: result.data.email,
    subject: tmpl.subject,
    html: tmpl.html,
    text: tmpl.text,
    tag: "waitlist-welcome",
  }).catch(() => {
    /* fire-and-forget: email failure must not block the response */
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ service: "waitlist", status: "ready" });
}
