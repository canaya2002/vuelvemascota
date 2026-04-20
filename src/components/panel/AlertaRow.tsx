"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteAlertaAction,
  toggleAlertaAction,
  type CasoActionState,
} from "@/lib/casoActions";
import { IconBell, IconX } from "../Icons";

const initial: CasoActionState = { ok: false, message: "" };

type Alerta = {
  id: string;
  ciudad: string | null;
  colonia: string | null;
  lat: number | string | null;
  lng: number | string | null;
  radio_m: number;
  especies: string[];
  canales: string[];
  activa: boolean;
  created_at: string;
};

export function AlertaRowCard({ alerta }: { alerta: Alerta }) {
  const [toggleState, toggleAction] = useActionState(toggleAlertaAction, initial);
  const [deleteState, deleteAction] = useActionState(deleteAlertaAction, initial);
  const zona = alerta.ciudad
    ? alerta.ciudad + (alerta.colonia ? ` · ${alerta.colonia}` : "")
    : alerta.lat && alerta.lng
    ? `Punto (${Number(alerta.lat).toFixed(3)}, ${Number(alerta.lng).toFixed(3)})`
    : "Ciudad no especificada";

  return (
    <li className="vc-card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex w-8 h-8 rounded-full items-center justify-center ${
                alerta.activa ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]" : "bg-[var(--bg-alt)] text-[var(--muted)]"
              }`}
            >
              <IconBell size={16} />
            </span>
            <h3 className="font-semibold">{zona}</h3>
          </div>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            Radio {(alerta.radio_m / 1000).toFixed(1)} km · Especies:{" "}
            {alerta.especies.join(", ")} · Canales: {alerta.canales.join(", ")}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            Creada {new Date(alerta.created_at).toLocaleDateString("es-MX")}
          </p>
        </div>
        <form action={deleteAction}>
          <input type="hidden" name="alerta_id" value={alerta.id} />
          <DeleteButton />
        </form>
      </div>
      <form action={toggleAction} className="flex items-center gap-3">
        <input type="hidden" name="alerta_id" value={alerta.id} />
        <input type="hidden" name="activa" value={(!alerta.activa).toString()} />
        <ToggleButton activa={alerta.activa} />
        {(toggleState.message || deleteState.message) && (
          <p
            className={`text-xs ${
              toggleState.ok || deleteState.ok
                ? "text-[#0d6b52]"
                : "text-[var(--brand-ink)]"
            }`}
          >
            {toggleState.message || deleteState.message}
          </p>
        )}
      </form>
    </li>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Eliminar alerta"
      className="inline-flex w-8 h-8 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white hover:border-[var(--brand)] hover:text-[var(--brand)]"
    >
      <IconX size={14} />
    </button>
  );
}

function ToggleButton({ activa }: { activa: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        activa
          ? "border-[var(--line-strong)] bg-white text-[var(--ink-soft)] hover:border-[var(--ink)]"
          : "bg-[var(--accent)] text-white border-[var(--accent)]"
      }`}
    >
      {activa ? "Pausar" : "Activar"}
    </button>
  );
}
