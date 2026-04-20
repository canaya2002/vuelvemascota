"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  moderateAvistamientoAction,
  type CasoActionState,
} from "@/lib/casoActions";
import { IconCheck, IconX } from "../Icons";

const initial: CasoActionState = { ok: false, message: "" };

type Avistamiento = {
  id: string;
  autor_nombre: string | null;
  fecha_avistado: string;
  descripcion: string;
  estado: string;
};

export function AvistamientoModerar({ a }: { a: Avistamiento }) {
  const [state, formAction] = useActionState(
    moderateAvistamientoAction,
    initial
  );
  return (
    <li className="vc-card">
      <p className="text-xs text-[var(--muted)]">
        {new Date(a.fecha_avistado).toLocaleString("es-MX")}
        {a.autor_nombre ? ` · ${a.autor_nombre}` : ""}
      </p>
      <p className="mt-1 text-[var(--ink)] whitespace-pre-wrap">
        {a.descripcion}
      </p>
      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <span
          className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
            a.estado === "confirmado"
              ? "bg-[var(--accent-soft)] text-[#0d6b52]"
              : a.estado === "descartado"
              ? "bg-[#e4e9ef] text-[#0b1f33]"
              : "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
          }`}
        >
          {a.estado}
        </span>
        {a.estado === "pendiente" && (
          <form action={formAction} className="flex gap-2">
            <input type="hidden" name="avistamiento_id" value={a.id} />
            <Btn estado="descartado" label="Descartar" variant="outline" />
            <Btn estado="confirmado" label="Confirmar" variant="primary" />
          </form>
        )}
      </div>
      {state.message && (
        <p
          className={`mt-2 text-xs ${
            state.ok ? "text-[#0d6b52]" : "text-[var(--brand-ink)]"
          }`}
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </li>
  );
}

function Btn({
  estado,
  label,
  variant,
}: {
  estado: string;
  label: string;
  variant: "primary" | "outline";
}) {
  const { pending } = useFormStatus();
  const Icon = estado === "confirmado" ? IconCheck : IconX;
  return (
    <button
      type="submit"
      name="estado"
      value={estado}
      disabled={pending}
      className={`vc-btn ${variant === "primary" ? "vc-btn-primary" : "vc-btn-outline"} text-xs py-1.5 px-3`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}
