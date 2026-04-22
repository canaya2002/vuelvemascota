import { NextResponse } from "next/server";
import { validateAlly } from "@/lib/validations";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const ALLOWED_TIPOS = new Set(["rescatistas", "veterinarias", "aliados"]);

export async function POST(req: Request) {
  const form = await req.formData();
  const result = validateAlly(form);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 400 }
    );
  }

  const rawTipo = String(form.get("tipo") ?? "").toLowerCase();
  const tipo = ALLOWED_TIPOS.has(rawTipo) ? rawTipo : "aliados";

  await db.insertAlly({ ...result.data, tipo });

  // Onboarding email al responsable — sólo si Resend está configurado.
  sendEmail({
    to: result.data.email,
    subject: `Gracias por sumarte a la red de ${SITE.name}`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Inter, sans-serif; color:#0b1f33; max-width:560px; margin:0 auto;">
        <h2>¡Gracias, ${escapeHtml(result.data.responsable)}!</h2>
        <p>Recibimos la alta de <strong>${escapeHtml(result.data.organizacion)}</strong> como aliado en <strong>${escapeHtml(result.data.ciudad)}</strong>.</p>
        <p>Vamos a revisar tu información y te escribimos en las próximas 48h para completar el onboarding y activar tu perfil público.</p>
        <p>Si tienes dudas, responde a este correo o escribe a <a href="mailto:${SITE.contact.email}">${SITE.contact.email}</a>.</p>
        <p style="color:#6a7a8c;font-size:13px;margin-top:24px;">Equipo ${SITE.name}</p>
      </div>
    `,
    replyTo: SITE.contact.email,
    tag: "aliados-onboarding",
  }).catch(() => {
    /* fire-and-forget */
  });

  // Ping interno al inbox del equipo para que sepan que hay un alta nueva.
  const teamInbox = process.env.ALIADOS_INBOX || SITE.contact.email;
  sendEmail({
    to: teamInbox,
    subject: `[Aliados · ${tipo}] ${result.data.organizacion} (${result.data.ciudad})`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Inter, sans-serif; color:#0b1f33;">
        <h3>Nueva alta de aliado</h3>
        <p><strong>Tipo:</strong> ${escapeHtml(tipo)}</p>
        <p><strong>Organización:</strong> ${escapeHtml(result.data.organizacion)}</p>
        <p><strong>Responsable:</strong> ${escapeHtml(result.data.responsable)}</p>
        <p><strong>Email:</strong> ${escapeHtml(result.data.email)}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(result.data.telefono)}</p>
        <p><strong>Ciudad:</strong> ${escapeHtml(result.data.ciudad)}</p>
        ${result.data.sitio ? `<p><strong>Sitio:</strong> ${escapeHtml(result.data.sitio)}</p>` : ""}
        ${result.data.notas ? `<hr /><p style="white-space:pre-wrap;">${escapeHtml(result.data.notas)}</p>` : ""}
      </div>
    `,
    replyTo: result.data.email,
    tag: "aliados-new",
  }).catch(() => {
    /* fire-and-forget */
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ service: "aliados", status: "ready" });
}

function escapeHtml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
