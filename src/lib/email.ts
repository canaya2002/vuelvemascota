/**
 * Email provider wrapper — activado cuando RESEND_API_KEY existe.
 *
 * En fase 1 no añadimos Resend como dependencia. Usamos su API HTTP directa
 * con fetch (corre en Node y Edge). Para usar otro provider (Postmark, SES,
 * SendGrid), reemplaza el body de `sendEmail`.
 */

import { SITE } from "./site";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  tag?: string;
};

export function emailEnabled() {
  return !!process.env.RESEND_API_KEY;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!emailEnabled()) {
    // Durante fase 1 simplemente loggeamos.
    console.log("[email:skipped]", {
      to: input.to,
      subject: input.subject,
      tag: input.tag,
    });
    return { ok: true, id: "dev-stub" };
  }

  try {
    const from =
      process.env.EMAIL_FROM ||
      `${SITE.name} <no-reply@${new URL(SITE.url).host}>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo || SITE.contact.email,
        tags: input.tag ? [{ name: "type", value: input.tag }] : undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[email:error]", err);
      return { ok: false, error: err };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "email error";
    return { ok: false, error: message };
  }
}

/* ------------------------------- templates ------------------------------- */

export function waitlistWelcome(name: string) {
  return {
    subject: `¡Bienvenida/o a ${SITE.name}!`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Inter, sans-serif; color:#0b1f33; max-width:560px; margin:0 auto;">
        <h1 style="margin:0 0 12px; font-size:28px;">Estás dentro, ${escapeHtml(name)}.</h1>
        <p>Gracias por sumarte a <strong>${SITE.name}</strong>. Te avisaremos apenas tu zona se active y podrás reportar, recibir alertas y apoyar casos reales.</p>
        <p>Mientras tanto, puedes apoyar a la comunidad:</p>
        <p><a href="${SITE.url}/donar" style="display:inline-block; background:#ff5a36; color:#fff; padding:12px 18px; border-radius:999px; text-decoration:none; font-weight:600;">Apoyar con una donación</a></p>
        <p style="color:#6a7a8c; font-size:13px; margin-top:24px;">Si no te registraste tú, ignora este correo.</p>
      </div>
    `,
    text: `Estás dentro, ${name}. Gracias por sumarte a ${SITE.name}. Te avisaremos apenas tu zona se active.`,
  };
}

export function contactNotify(
  teamEmail: string,
  payload: {
    nombre: string;
    email: string;
    telefono: string | null;
    tema: string;
    mensaje: string;
  }
) {
  return {
    to: teamEmail,
    subject: `[Contacto · ${payload.tema}] ${payload.nombre}`,
    replyTo: payload.email,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Inter, sans-serif; color:#0b1f33;">
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(payload.nombre)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(payload.telefono || "—")}</p>
        <p><strong>Tema:</strong> ${escapeHtml(payload.tema)}</p>
        <hr />
        <p style="white-space:pre-wrap;">${escapeHtml(payload.mensaje)}</p>
      </div>
    `,
  };
}

function escapeHtml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
