// Lightweight, zero-dependency validators tailored for our forms.
// We avoid adding Zod to keep the bundle small and install-free for fase 1;
// the signatures are compatible enough to swap later without refactoring call sites.

export type FieldErrors = Record<string, string>;

export type ValidateResult<T> =
  | { ok: true; data: T; errors: null }
  | { ok: false; data: null; errors: FieldErrors };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+()\-\s\d]{8,}$/;

function must(value: unknown, field: string, errors: FieldErrors, msg = "Este campo es obligatorio") {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors[field] = msg;
    return null;
  }
  return value.trim();
}

function email(value: unknown, field: string, errors: FieldErrors) {
  const v = must(value, field, errors, "Ingresa un email válido");
  if (v && !emailRe.test(v)) {
    errors[field] = "Ingresa un email válido";
    return null;
  }
  return v;
}

function phone(value: unknown, field: string, errors: FieldErrors, required = false) {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    if (required) errors[field] = "Ingresa un teléfono válido";
    return null;
  }
  const v = String(value).trim();
  if (!phoneRe.test(v)) {
    errors[field] = "Ingresa un teléfono válido";
    return null;
  }
  return v;
}

export type WaitlistInput = {
  nombre: string;
  email: string;
  ciudad: string;
  rol: string;
  acepta: boolean;
};
export function validateWaitlist(form: FormData): ValidateResult<WaitlistInput> {
  const errors: FieldErrors = {};
  const nombre = must(form.get("nombre"), "nombre", errors);
  const em = email(form.get("email"), "email", errors);
  const ciudad = must(form.get("ciudad"), "ciudad", errors, "Selecciona una ciudad");
  const rol = must(form.get("rol"), "rol", errors, "Elige una opción");
  const acepta = form.get("acepta") === "on" || form.get("acepta") === "true";
  if (!acepta) errors.acepta = "Debes aceptar el aviso para continuar";
  if (Object.keys(errors).length > 0) return { ok: false, data: null, errors };
  return {
    ok: true,
    errors: null,
    data: { nombre: nombre!, email: em!, ciudad: ciudad!, rol: rol!, acepta },
  };
}

export type ContactInput = {
  nombre: string;
  email: string;
  telefono: string | null;
  tema: string;
  mensaje: string;
};
export function validateContact(form: FormData): ValidateResult<ContactInput> {
  const errors: FieldErrors = {};
  const nombre = must(form.get("nombre"), "nombre", errors);
  const em = email(form.get("email"), "email", errors);
  const tel = phone(form.get("telefono"), "telefono", errors);
  const tema = must(form.get("tema"), "tema", errors, "Elige un tema");
  const mensaje = must(form.get("mensaje"), "mensaje", errors, "Escribe un mensaje");
  if (mensaje && mensaje.length < 10) errors.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres)";
  if (Object.keys(errors).length > 0) return { ok: false, data: null, errors };
  return {
    ok: true,
    errors: null,
    data: { nombre: nombre!, email: em!, telefono: tel, tema: tema!, mensaje: mensaje! },
  };
}

export type AllyInput = {
  organizacion: string;
  responsable: string;
  email: string;
  telefono: string;
  ciudad: string;
  sitio?: string | null;
  notas?: string | null;
  acepta: boolean;
};
export function validateAlly(form: FormData): ValidateResult<AllyInput> {
  const errors: FieldErrors = {};
  const organizacion = must(form.get("organizacion"), "organizacion", errors);
  const responsable = must(form.get("responsable"), "responsable", errors);
  const em = email(form.get("email"), "email", errors);
  const tel = phone(form.get("telefono"), "telefono", errors, true);
  const ciudad = must(form.get("ciudad"), "ciudad", errors, "Selecciona una ciudad");
  const sitio = (form.get("sitio") as string | null) || null;
  const notas = (form.get("notas") as string | null) || null;
  const acepta = form.get("acepta") === "on" || form.get("acepta") === "true";
  if (!acepta) errors.acepta = "Debes aceptar el aviso para continuar";
  if (Object.keys(errors).length > 0) return { ok: false, data: null, errors };
  return {
    ok: true,
    errors: null,
    data: {
      organizacion: organizacion!,
      responsable: responsable!,
      email: em!,
      telefono: tel!,
      ciudad: ciudad!,
      sitio,
      notas,
      acepta,
    },
  };
}
