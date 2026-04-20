"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ActionState } from "@/lib/actions";
import { TextField, TextArea, Select } from "./Field";
import { IconArrow, IconCheck } from "../Icons";

const initial: ActionState = { ok: false, message: "" };

export function ContactForm({ defaultTema }: { defaultTema?: string }) {
  const [state, formAction] = useActionState(submitContact, initial);

  if (state.ok) {
    return (
      <div className="vc-card bg-[var(--accent-soft)] border-[var(--accent)]/30">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-[var(--accent)] text-white inline-flex items-center justify-center">
            <IconCheck size={22} />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-[#0d6b52]">Recibido</h3>
            <p className="mt-1 text-[#0d6b52]/80">{state.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 vc-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Nombre"
          name="nombre"
          required
          autoComplete="name"
          placeholder="Tu nombre"
          error={state.errors?.nombre}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          error={state.errors?.email}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Teléfono (opcional)"
          name="telefono"
          autoComplete="tel"
          placeholder="55 0000 0000"
          error={state.errors?.telefono}
        />
        <Select
          label="Tema"
          name="tema"
          required
          defaultValue={defaultTema || ""}
          error={state.errors?.tema}
        >
          <option value="" disabled>
            Elige un tema
          </option>
          <option value="soporte">Soporte general</option>
          <option value="reportar">Reportar un caso urgente</option>
          <option value="aliados">Alianza / patrocinio</option>
          <option value="rescate">Rescatistas y refugios</option>
          <option value="vet">Veterinarias</option>
          <option value="prensa">Prensa / comunicación</option>
          <option value="otro">Otro</option>
        </Select>
      </div>
      <TextArea
        label="Mensaje"
        name="mensaje"
        required
        rows={5}
        placeholder="Cuéntanos en qué podemos ayudarte"
        error={state.errors?.mensaje}
      />
      <SubmitRow />
      {!state.ok && state.message && (
        <p className="text-sm text-[var(--brand-ink)]" aria-live="polite">
          {state.message}
        </p>
      )}
    </form>
  );
}

function SubmitRow() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="vc-btn vc-btn-primary w-full sm:w-auto"
    >
      {pending ? "Enviando…" : "Enviar mensaje"} <IconArrow size={18} />
    </button>
  );
}
