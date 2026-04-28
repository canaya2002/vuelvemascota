import { NextResponse } from "next/server";
import { validateContact } from "@/lib/validations";
import { db } from "@/lib/db";
import { sendEmail, contactNotify } from "@/lib/email";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Heurística anti-spam SEO: rechazamos mensajes que tienen patrones típicos
 * de bots de "register your site in 1000 search engines" sin caer en
 * legitimate SEO talk de un cliente real.
 *
 * Ojo: la lista la mantenemos chica y conservadora — preferimos que pase un
 * spam ocasional que rechazar a un usuario real. El resultado se loggea para
 * tunear el filtro.
 */
const SPAM_PATTERNS: RegExp[] = [
  /search\s*register/i,
  /searchregister\.info/i,
  /googlesearchindex/i,
  /submit\s+(your\s+)?(site|website|url)\b/i,
  /seo\s+services?\b.*website/i,
  /backlinks? (for|to) your/i,
  /get\s+(your\s+)?(website|site)\s+ranked/i,
  /\bdomains?@\w+\.\w+/i, // emails tipo "domains@search-xxx.com" — bots SEO
];

function looksLikeSpam(payload: {
  email: string;
  mensaje: string;
  nombre: string;
}): boolean {
  const haystack = `${payload.email} ${payload.mensaje} ${payload.nombre}`;
  return SPAM_PATTERNS.some((p) => p.test(haystack));
}

export async function POST(req: Request) {
  const form = await req.formData();
  const result = validateContact(form);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 400 }
    );
  }

  // Spam detection — devolvemos OK aparente para no dar feedback al bot
  // (silent drop). Loggeamos para revisar falsos positivos.
  if (looksLikeSpam(result.data)) {
    console.warn("[contacto:spam-dropped]", {
      email: result.data.email,
      sample: result.data.mensaje.slice(0, 80),
    });
    return NextResponse.json({ ok: true, dropped: true });
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
