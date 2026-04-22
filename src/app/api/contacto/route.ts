import { NextResponse } from "next/server";
import { validateContact } from "@/lib/validations";
import { db } from "@/lib/db";
import { sendEmail, contactNotify } from "@/lib/email";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const result = validateContact(form);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 400 }
    );
  }

  await db.insertContact(result.data);

  const teamEmail = process.env.CONTACT_INBOX || SITE.contact.email;
  const tmpl = contactNotify(teamEmail, {
    nombre: result.data.nombre,
    email: result.data.email,
    telefono: result.data.telefono,
    tema: result.data.tema,
    mensaje: result.data.mensaje,
  });
  sendEmail({
    to: tmpl.to,
    subject: tmpl.subject,
    html: tmpl.html,
    replyTo: tmpl.replyTo,
    tag: "contacto",
  }).catch(() => {
    /* fire-and-forget */
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ service: "contacto", status: "ready" });
}
