"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addUpdateAction, type CasoActionState } from "@/lib/casoActions";
import { TextArea } from "../forms/Field";
import { IconArrow } from "../Icons";

const initial: CasoActionState = { ok: false, message: "" };

export function UpdateForm({ casoId, slug }: { casoId: string; slug: string }) {
  const [state, formAction] = useActionState(addUpdateAction, initial);
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="caso_id" value={casoId} />
      <input type="hidden" name="slug" value={slug} />
      <TextArea
        label="Nueva actualización"
        name="mensaje"
        rows={3}
        placeholder="Ej: 'Lo vieron cerca del mercado ayer a las 7pm, seguimos buscando.'"
        required
      />
      <div className="flex items-center justify-between">
        <p
          className={`text-sm ${state.ok ? "text-[#0d6b52]" : "text-[var(--brand-ink)]"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
        <Submit />
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="vc-btn vc-btn-primary text-sm py-2 px-3">
      {pending ? "Publicando…" : "Publicar actualización"} <IconArrow size={14} />
    </button>
  );
}
