"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitWaitlist, type ActionState } from "@/lib/actions";
import { CITIES } from "@/lib/site";
import { TextField, Select, Checkbox } from "./Field";
import { IconArrow, IconCheck } from "../Icons";

const initial: ActionState = { ok: false, message: "" };

export function WaitlistForm({
  dense = false,
  defaultRol = "",
}: {
  dense?: boolean;
  defaultRol?: string;
}) {
  const [state, formAction] = useActionState(submitWaitlist, initial);

  if (state.ok) {
    return (
      <div className="vc-card bg-[var(--accent-soft)] border-[var(--accent)]/30">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full bg-[var(--accent)] text-white inline-flex items-center justify-center">
            <IconCheck size={22} />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-[#0d6b52]">
              ¡Estás dentro!
            </h3>
            <p className="mt-1 text-[#0d6b52]/80">{state.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className={`space-y-4 ${dense ? "" : "vc-card"}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Nombre"
          name="nombre"
          required
          placeholder="Tu nombre"
          autoComplete="name"
          error={state.errors?.nombre}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          placeholder="tu@email.com"
          autoComplete="email"
          error={state.errors?.email}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <Select
          label="¿Cómo te sumas?"
          name="rol"
          required
          defaultValue={defaultRol}
          error={state.errors?.rol}
        >
          <option value="" disabled>
            Elige una opción
          </option>
          <option value="dueño">Perdí o busco a mi mascota</option>
          <option value="encontre">Encontré una mascota</option>
          <option value="voluntario">Quiero ayudar / ser voluntario</option>
          <option value="rescatista">Soy rescatista o refugio</option>
          <option value="veterinaria">Soy veterinaria o clínica</option>
          <option value="aliado">Aliado / patrocinador</option>
        </Select>
      </div>
      <Checkbox
        name="acepta"
        label="Acepto el aviso de privacidad y recibir notificaciones por email."
        error={state.errors?.acepta}
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
      {pending ? "Enviando…" : "Registrarme gratis"} <IconArrow size={18} />
    </button>
  );
}
