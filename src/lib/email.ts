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
        <p><a href="${SITE.url}/donar" style="display:inline-block; background:#e11d48; color:#fff; padding:12px 18px; border-radius:999px; text-decoration:none; font-weight:600;">Apoyar con una donación</a></p>
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

export function avistamientoNotify(
  ownerEmail: string,
  data: {
    ownerNombre: string | null;
    casoSlug: string;
    casoTitle: string;
    avistamiento: {
      descripcion: string;
      fecha_avistado: string;
      autor_nombre: string | null;
      autor_contacto: string | null;
    };
  }
) {
  return {
    to: ownerEmail,
    subject: `Nuevo avistamiento en tu caso "${data.casoTitle}"`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Inter, sans-serif; color:#0b1f33; max-width:560px; margin:0 auto;">
        <h2 style="margin:0 0 12px;">Hola${data.ownerNombre ? ", " + escapeHtml(data.ownerNombre) : ""} 👋</h2>
        <p>Alguien reportó haber visto a tu mascota:</p>
        <div style="background:#fff3e8;border:1px solid #d6cabb;border-radius:14px;padding:16px;margin:14px 0;">
          <p style="margin:0 0 8px;font-size:13px;color:#6a7a8c;">${escapeHtml(new Date(data.avistamiento.fecha_avistado).toLocaleString("es-MX"))}</p>
          <p style="margin:0;white-space:pre-wrap;">${escapeHtml(data.avistamiento.descripcion)}</p>
          ${data.avistamiento.autor_nombre || data.avistamiento.autor_contacto ? `<p style="margin-top:10px;font-size:13px;">Contacto: <strong>${escapeHtml(data.avistamiento.autor_nombre ?? "")}${data.avistamiento.autor_contacto ? " · " + escapeHtml(data.avistamiento.autor_contacto) : ""}</strong></p>` : ""}
        </div>
        <p><a href="${SITE.url}/casos/${data.casoSlug}" style="display:inline-block;background:#e11d48;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600;">Ver caso</a></p>
        <p style="color:#6a7a8c;font-size:13px;margin-top:24px;">Este es un aviso automático de VuelveaCasa.</p>
      </div>
    `,
    text: `Nuevo avistamiento en tu caso: ${data.avistamiento.descripcion}\n\n${SITE.url}/casos/${data.casoSlug}`,
  };
}

export function matchConfirmadoNotify(
  toEmail: string,
  data: {
    ownNombre: string | null;
    otherCaso: {
      slug: string;
      tipo: string;
      ciudad: string;
      nombre: string | null;
      especie: string;
      contacto_nombre: string | null;
      contacto_telefono: string | null;
      contacto_whatsapp: string | null;
      contacto_email: string | null;
    };
  }
) {
  const { otherCaso } = data;
  const tituloOther =
    otherCaso.tipo === "perdida"
      ? "mascota perdida"
      : otherCaso.tipo === "encontrada"
      ? "mascota encontrada"
      : "avistamiento";
  const contactoLines: string[] = [];
  if (otherCaso.contacto_nombre)
    contactoLines.push(
      `<p>Contacto: <strong>${escapeHtml(otherCaso.contacto_nombre)}</strong></p>`
    );
  if (otherCaso.contacto_whatsapp)
    contactoLines.push(
      `<p>WhatsApp: <a href="https://wa.me/${otherCaso.contacto_whatsapp.replace(/\D/g, "")}">${escapeHtml(otherCaso.contacto_whatsapp)}</a></p>`
    );
  if (otherCaso.contacto_telefono)
    contactoLines.push(
      `<p>Teléfono: <a href="tel:${escapeHtml(otherCaso.contacto_telefono)}">${escapeHtml(otherCaso.contacto_telefono)}</a></p>`
    );
  if (otherCaso.contacto_email)
    contactoLines.push(
      `<p>Email: <a href="mailto:${escapeHtml(otherCaso.contacto_email)}">${escapeHtml(otherCaso.contacto_email)}</a></p>`
    );

  return {
    to: toEmail,
    subject: `Posible reencuentro: coincidencia en ${otherCaso.ciudad}`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Inter, sans-serif; color:#0b1f33; max-width:560px; margin:0 auto;">
        <p style="text-transform:uppercase;letter-spacing:0.05em;font-size:12px;color:#18a37a;font-weight:700;margin:0;">Match confirmado</p>
        <h2 style="margin:6px 0 12px;">Hola${data.ownNombre ? ", " + escapeHtml(data.ownNombre) : ""} 🙏</h2>
        <p>El dueño del otro caso confirmó que tu reporte podría ser la misma mascota. Estos son sus datos para que se contacten:</p>
        <div style="background:#fff3e8;border:1px solid #d6cabb;border-radius:14px;padding:16px;margin:14px 0;">
          <p style="margin:0;font-weight:700;">${escapeHtml(tituloOther)} en ${escapeHtml(otherCaso.ciudad)}</p>
          ${otherCaso.nombre ? `<p style="margin:4px 0 10px;">${escapeHtml(otherCaso.nombre)}</p>` : ""}
          ${contactoLines.join("")}
        </div>
        <p style="margin-top:18px;">
          <a href="${SITE.url}/casos/${otherCaso.slug}" style="display:inline-block;background:#e11d48;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600;">Ver el otro caso</a>
        </p>
        <p style="color:#6a7a8c;font-size:13px;margin-top:24px;">Cuando confirmen que sí es la misma mascota, no olvides marcar el caso como reencontrado para cerrar el ciclo.</p>
      </div>
    `,
    text: `Coincidencia confirmada en ${otherCaso.ciudad}. Contacto: ${otherCaso.contacto_nombre ?? ""} ${otherCaso.contacto_whatsapp ?? otherCaso.contacto_telefono ?? otherCaso.contacto_email ?? ""}`,
  };
}

export function reencuentroCelebrar(
  toEmail: string,
  data: {
    ownNombre: string | null;
    casoSlug: string;
    mascotaNombre: string | null;
    especie: string;
    ciudad: string;
  }
) {
  return {
    to: toEmail,
    subject: `¡${data.mascotaNombre ?? data.especie} volvió a casa! 🎉`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Inter, sans-serif; color:#0b1f33; max-width:560px; margin:0 auto;">
        <p style="text-transform:uppercase;letter-spacing:0.05em;font-size:12px;color:#18a37a;font-weight:700;margin:0;">Reencuentro</p>
        <h2 style="margin:6px 0 12px;">Qué alegría${data.ownNombre ? ", " + escapeHtml(data.ownNombre) : ""} 🎉</h2>
        <p>Cerraste el caso como <strong>reencontrado</strong>. Gracias por avisar — eso ayuda a que la comunidad siga confiando en la plataforma.</p>
        <p>Si alguien de los que te apoyó merece un reconocimiento, comparte el caso con el resultado en tus redes para cerrar el ciclo.</p>
        <p style="margin-top:18px;">
          <a href="${SITE.url}/casos/${data.casoSlug}" style="display:inline-block;background:#18a37a;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600;">Ver caso cerrado</a>
        </p>
        <p style="color:#6a7a8c;font-size:13px;margin-top:24px;">Si algún día pasas por una mascota en la calle, ya conoces el camino. VuelveaCasa te espera.</p>
      </div>
    `,
    text: `¡${data.mascotaNombre ?? data.especie} volvió a casa! Gracias por cerrar el caso. ${SITE.url}/casos/${data.casoSlug}`,
  };
}

export function alertaCasoNueva(
  suscriptorEmail: string,
  data: {
    suscriptorNombre: string | null;
    alertaId: string;
    caso: {
      slug: string;
      tipo: string;
      especie: string;
      nombre: string | null;
      ciudad: string;
      colonia: string | null;
      descripcion: string | null;
      foto: string | null;
    };
  }
) {
  const titulo =
    data.caso.tipo === "perdida"
      ? `Mascota perdida en ${data.caso.ciudad}`
      : data.caso.tipo === "encontrada"
      ? `Mascota encontrada en ${data.caso.ciudad}`
      : `Avistamiento en ${data.caso.ciudad}`;

  return {
    to: suscriptorEmail,
    subject: `[Alerta] ${titulo}${data.caso.nombre ? " · " + data.caso.nombre : ""}`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Inter, sans-serif; color:#0b1f33; max-width:560px; margin:0 auto;">
        <p style="text-transform:uppercase;letter-spacing:0.05em;font-size:12px;color:#e11d48;font-weight:700;margin:0;">Alerta de zona</p>
        <h2 style="margin:6px 0 10px;">${escapeHtml(titulo)}</h2>
        ${data.caso.foto ? `<img src="${data.caso.foto}" alt="" style="width:100%;max-width:520px;height:auto;border-radius:14px;margin-bottom:14px;"/>` : ""}
        <p>${escapeHtml(data.caso.especie)}${data.caso.colonia ? " · " + escapeHtml(data.caso.colonia) : ""}</p>
        ${data.caso.descripcion ? `<p style="white-space:pre-wrap;">${escapeHtml(data.caso.descripcion.slice(0, 280))}</p>` : ""}
        <p style="margin-top:18px;"><a href="${SITE.url}/casos/${data.caso.slug}" style="display:inline-block;background:#e11d48;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600;">Ver caso y ayudar</a></p>
        <p style="color:#6a7a8c;font-size:13px;margin-top:28px;">
          Recibes este correo porque tienes una alerta activa en tu zona.
          <a href="${SITE.url}/panel/alertas" style="color:#0b1f33;">Ajustar alertas</a>.
        </p>
      </div>
    `,
    text: `${titulo}. Ver caso: ${SITE.url}/casos/${data.caso.slug}`,
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
