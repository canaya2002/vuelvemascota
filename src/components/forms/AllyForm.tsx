"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitAlly, type ActionState } from "@/lib/actions";
import { CITIES } from "@/lib/site";
import { TextField, TextArea, Select, Checkbox } from "./Field";
import { IconArrow, IconCheck } from "../Icons";

const initial: ActionState = { ok: false, message: "" };

export function AllyForm({
  kind,
}: {
  kind: "rescatistas" | "veterinarias" | "aliados";
}) {
  const [state, formAction] = useActionState(submitAlly, initial);

  const copy = {
    rescatistas: {
      org: "Nombre del colectivo, refugio o persona responsable",
      hint:
        "Si trabajas de forma independiente, puedes poner tu nombre y ‘rescate independiente’.",
      submit: "Enviar postulación",
      success:
        "Gracias por sumarte. Te contactaremos en los próximos días hábiles para validar tu perfil como aliado.",
    },
    veterinarias: {
      org: "Nombre de la clínica u hospital veterinario",
      hint: "Esto aparecerá en el directorio de aliados verificados.",
      submit: "Sumar mi clínica",
      success:
        "Gracias. Revisaremos tu registro y te daremos acceso al directorio y al flujo de casos aliados.",
    },
    aliados: {
      org: "Nombre de la marca u organización",
      hint: "Cuéntanos brevemente qué tipo de alianza te interesa.",
      submit: "Proponer alianza",
      success:
        "Gracias. Te responderemos con los formatos de alianza disponibles.",
    },
  }[kind];

  if (state.ok) {
    return (
      <div className="vc-card bg-[var(--accent-soft)] border-[var(--accent)]/30">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-[var(--accent)] text-white inline-flex items-center justify-center">
            <IconCheck size={22} />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-[#0d6b52]">Recibido</h3>
            <p className="mt-1 text-[#0d6b52]/80">{copy.success}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 vc-card">
      <input type="hidden" name="tipo" value={kind} />
      <TextField
        label={copy.org}
        name="organizacion"
        required
        error={state.errors?.organizacion}
        hint={copy.hint}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Persona responsable"
          name="responsable"
          required
          autoComplete="name"
          error={state.errors?.responsable}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          error={state.errors?.email}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Teléfono"
          name="telefono"
          required
          autoComplete="tel"
          placeholder="55 0000 0000"
          error={state.errors?.telefono}
        />
        <Select label="Ciudad" name="ciudad" required error={state.errors?.ciudad}>
          <option value="" disabled>
            Elige tu ciudad
          </option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}, {c.state}
            </option>
          ))}
          <option value="Otra">Otra / No aparece</option>
        </Select>
      </div>
      <TextField
        label="Sitio web, Instagram o WhatsApp (opcional)"
        name="sitio"
        placeholder="https://..."
      />
      <TextArea
        label="Cuéntanos brevemente a qué se dedican"
        name="notas"
        rows={4}
        placeholder="Tamaño del equipo, zonas donde operan, tipo de casos que manejan…"
      />
      <Checkbox
        name="acepta"
        label="Acepto el aviso de privacidad y el proceso de verificación básica."
        error={state.errors?.acepta}
      />
      <SubmitRow label={copy.submit} />
      {!state.ok && state.message && (
        <p className="text-sm text-[var(--brand-ink)]" aria-live="polite">
          {state.message}
        </p>
      )}
    </form>
  );
}

function SubmitRow({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="vc-btn vc-btn-primary w-full sm:w-auto"
    >
      {pending ? "Enviando…" : label} <IconArrow size={18} />
    </button>
  );
}
