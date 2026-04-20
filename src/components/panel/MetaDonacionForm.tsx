"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateMetaAction, type CasoActionState } from "@/lib/casoActions";
import { IconArrow } from "../Icons";

const initial: CasoActionState = { ok: false, message: "" };

export function MetaDonacionForm({
  slug,
  meta,
}: {
  slug: string;
  meta: number | null;
}) {
  const [state, formAction] = useActionState(updateMetaAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />
      <label className="text-sm font-semibold">
        Meta de donación (MXN)
      </label>
      <input
        type="number"
        name="meta_donacion"
        min={0}
        defaultValue={meta ?? ""}
        placeholder="Ej. 5000"
        className="vc-input"
      />
      <div className="flex items-center justify-between">
        <p
          className={`text-xs ${state.ok ? "text-[#0d6b52]" : "text-[var(--brand-ink)]"}`}
        >
          {state.message}
        </p>
        <Submit />
      </div>
      <p className="text-xs text-[var(--muted)]">
        Define una meta para que la comunidad vea el progreso. Deja vacío si no quieres mostrarla.
      </p>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="vc-btn vc-btn-outline text-sm py-2 px-3"
    >
      {pending ? "Guardando…" : "Guardar"} <IconArrow size={12} />
    </button>
  );
}
