"use server";

import {
  validateAlly,
  validateContact,
  validateWaitlist,
  type FieldErrors,
} from "./validations";
import { db } from "./db";
import { contactNotify, sendEmail, waitlistWelcome } from "./email";
import { SITE } from "./site";

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: FieldErrors;
};

export async function submitWaitlist(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = validateWaitlist(formData);
  if (!result.ok) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      errors: result.errors,
    };
  }

  try {
    await db.insertWaitlist(result.data);
    const tpl = waitlistWelcome(result.data.nombre);
    await sendEmail({
      to: result.data.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      tag: "waitlist-welcome",
    });
  } catch (err) {
    console.error("[waitlist:error]", err);
    return {
      ok: false,
      message: "Ocurrió un error al guardar. Inténtalo de nuevo.",
    };
  }

  return {
    ok: true,
    message:
      "¡Listo! Te avisaremos cuando VuelveaCasa se active en tu zona. Revisa tu correo.",
  };
}

export async function submitContact(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = validateContact(formData);
  if (!result.ok) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      errors: result.errors,
    };
  }

  try {
    await db.insertContact(result.data);
    const tpl = contactNotify(SITE.contact.email, result.data);
    await sendEmail({
      to: tpl.to,
      subject: tpl.subject,
      html: tpl.html,
      replyTo: tpl.replyTo,
      tag: "contact",
    });
  } catch (err) {
    console.error("[contact:error]", err);
    return {
      ok: false,
      message: "No pudimos enviar tu mensaje. Inténtalo de nuevo.",
    };
  }

  return {
    ok: true,
    message: "Mensaje recibido. Te respondemos en menos de 48h hábiles.",
  };
}

export async function submitAlly(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = validateAlly(formData);
  if (!result.ok) {
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      errors: result.errors,
    };
  }

  const tipo = (formData.get("tipo") as string) || "aliado";

  try {
    await db.insertAlly({ ...result.data, tipo });
    await sendEmail({
      to: SITE.contact.email,
      subject: `[Aliado · ${tipo}] ${result.data.organizacion}`,
      html: `
        <h2>Nueva postulación de aliado</h2>
        <p><strong>Tipo:</strong> ${tipo}</p>
        <p><strong>Organización:</strong> ${result.data.organizacion}</p>
        <p><strong>Responsable:</strong> ${result.data.responsable}</p>
        <p><strong>Email:</strong> ${result.data.email}</p>
        <p><strong>Teléfono:</strong> ${result.data.telefono}</p>
        <p><strong>Ciudad:</strong> ${result.data.ciudad}</p>
        <p><strong>Sitio:</strong> ${result.data.sitio || "—"}</p>
        <p><strong>Notas:</strong> ${result.data.notas || "—"}</p>
      `,
      replyTo: result.data.email,
      tag: `ally-${tipo}`,
    });
  } catch (err) {
    console.error("[ally:error]", err);
    return {
      ok: false,
      message: "No pudimos registrar tu postulación. Inténtalo de nuevo.",
    };
  }

  return {
    ok: true,
    message:
      "Gracias. Revisaremos la información y te contactaremos en los próximos días hábiles.",
  };
}
