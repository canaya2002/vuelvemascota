"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changeStateAction, type CasoActionState } from "@/lib/casoActions";

const initial: CasoActionState = { ok: false, message: "" };

const OPTIONS: { v: string; t: string; tone: string }[] = [
  { v: "activo", t: "Activo", tone: "bg-[var(--brand)] text-white" },
  { v: "reencontrado", t: "Reencontrado", tone: "bg-[var(--accent)] text-white" },
  { v: "cerrado", t: "Cerrado", tone: "bg-[var(--ink)] text-white" },
  { v: "archivado", t: "Archivado", tone: "bg-[#6a7a8c] text-white" },
];

export function CasoStateForm({ slug, estado }: { slug: string; estado: string }) {
  const [state, formAction] = useActionState(changeStateAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((o) => (
          <StateButton
            key={o.v}
            value={o.v}
            label={o.t}
            active={estado === o.v}
            tone={o.tone}
          />
        ))}
      </div>
      {state.message && (
        <p
          className={`text-sm ${state.ok ? "text-[#0d6b52]" : "text-[var(--brand-ink)]"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

function StateButton({
  value,
  label,
  active,
  tone,
}: {
  value: string;
  label: string;
  active: boolean;
  tone: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="estado"
      value={value}
      disabled={pending || active}
      className={`rounded-xl px-3 py-2 text-sm font-semibold border transition-colors ${
        active
          ? tone + " border-transparent cursor-default"
          : "bg-white border-[var(--line-strong)] hover:border-[var(--ink)]"
      }`}
    >
      {label}
    </button>
  );
}
