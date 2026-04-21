"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addAvistamientoAction, type CasoActionState } from "@/lib/casoActions";
import { TextField, TextArea } from "./Field";
import { IconArrow, IconCheck } from "../Icons";
import { DonationAppeal } from "../DonationAppeal";

const initial: CasoActionState = { ok: false, message: "" };

export function AvistamientoForm({ casoId }: { casoId: string }) {
  const [state, formAction] = useActionState(addAvistamientoAction, initial);

  if (state.ok) {
    return (
      <div className="space-y-4">
        <div className="vc-card bg-[var(--accent-soft)] border-[var(--accent)]/30">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-[var(--accent)] text-white inline-flex items-center justify-center">
              <IconCheck size={22} />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-[#0d6b52]">¡Gracias!</h3>
              <p className="mt-1 text-[#0d6b52]/80">{state.message}</p>
            </div>
          </div>
        </div>
        <DonationAppeal variant="avistamiento" compact />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 vc-card">
      <input type="hidden" name="caso_id" value={casoId} />
      <h3 className="text-lg font-semibold">Reportar avistamiento</h3>
      <p className="text-sm text-[var(--ink-soft)]">
        ¿Viste a esta mascota? Comparte lo que viste. Tu dato llega al dueño.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Tu nombre (opcional)" name="autor_nombre" placeholder="Tu nombre" />
        <TextField
          label="Contacto (WhatsApp o email)"
          name="autor_contacto"
          placeholder="Para que el dueño te pueda escribir"
        />
      </div>
      <TextField
        label="Fecha del avistamiento"
        name="fecha_avistado"
        type="datetime-local"
        required
      />
      <TextArea
        label="Describe qué viste"
        name="descripcion"
        required
        rows={4}
        placeholder="Lo vi cerca del parque de los Venados, venía en dirección sur, traía collar rojo..."
      />
      <Submit />
      {!state.ok && state.message && (
        <p className="text-sm text-[var(--brand-ink)]" aria-live="polite">
          {state.message}
        </p>
      )}
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="vc-btn vc-btn-primary">
      {pending ? "Enviando…" : "Enviar avistamiento"} <IconArrow size={18} />
    </button>
  );
}
