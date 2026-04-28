"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createVistaAction, type ForoActionState } from "@/lib/foroActions";
import { IconArrow } from "./Icons";

const initial: ForoActionState = { ok: false, message: "" };

const ESPECIES = ["perro", "gato", "otro"] as const;
const TIPOS = ["perdida", "encontrada", "avistamiento"] as const;
const RADIOS = [2, 5, 10, 25, 50];
const RECIENTES = [
  { v: 24, l: "24 h" },
  { v: 48, l: "48 h" },
  { v: 72, l: "72 h" },
  { v: 168, l: "7 d" },
];

export function NuevaVistaForm() {
  const [state, action] = useActionState(createVistaAction, initial);
  const [especies, setEspecies] = useState<string[]>([]);
  const [tipo, setTipo] = useState<string[]>([]);
  const [radio, setRadio] = useState<number | null>(null);
  const [reciente, setReciente] = useState<number | null>(null);

  const toggleArr = <T extends string>(arr: T[], v: T) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <form action={action} className="vc-card-glass !p-6 space-y-6">
      <div>
        <label className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">
          Nombre
        </label>
        <input
          name="nombre"
          required
          minLength={3}
          maxLength={60}
          placeholder="Ej. Perros perdidos cerca de mí"
          className="mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>

      <Group label="Especie">
        {ESPECIES.map((e) => (
          <Chip
            key={e}
            label={cap(e)}
            selected={especies.includes(e)}
            onClick={() => setEspecies((p) => toggleArr(p, e))}
          />
        ))}
        {especies.map((e) => (
          <input key={e} type="hidden" name="especies" value={e} />
        ))}
      </Group>

      <Group label="Tipo">
        {TIPOS.map((t) => (
          <Chip
            key={t}
            label={cap(t)}
            selected={tipo.includes(t)}
            onClick={() => setTipo((p) => toggleArr(p, t))}
          />
        ))}
        {tipo.map((t) => (
          <input key={t} type="hidden" name="tipo" value={t} />
        ))}
      </Group>

      <Group label="Radio (requiere ubicación)">
        <Chip
          label="Sin radio"
          selected={radio === null}
          onClick={() => setRadio(null)}
        />
        {RADIOS.map((r) => (
          <Chip
            key={r}
            label={`${r} km`}
            selected={radio === r}
            onClick={() => setRadio(r)}
          />
        ))}
        {radio !== null ? (
          <input type="hidden" name="radio_km" value={String(radio)} />
        ) : null}
      </Group>

      <Group label="Recientes">
        <Chip
          label="Cualquier fecha"
          selected={reciente === null}
          onClick={() => setReciente(null)}
        />
        {RECIENTES.map((r) => (
          <Chip
            key={r.v}
            label={r.l}
            selected={reciente === r.v}
            onClick={() => setReciente(r.v)}
          />
        ))}
        {reciente !== null ? (
          <input type="hidden" name="recientes_horas" value={String(reciente)} />
        ) : null}
      </Group>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="ciudad"
          placeholder="Ciudad"
          className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
        <input
          name="colonia"
          placeholder="Colonia (opcional)"
          className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm focus:border-[var(--brand)] focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3 pt-2 border-t border-[var(--line)]">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="solo_verificados" value="1" />
          <span className="text-sm">Solo de cuentas verificadas</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="publica" value="1" />
          <span className="text-sm">
            Compartir como pública (genera enlace de solo lectura)
          </span>
        </label>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p
          className={`text-sm ${
            state.ok ? "text-[var(--accent)]" : "text-[var(--brand-ink)]"
          }`}
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
    <button
      type="submit"
      disabled={pending}
      className="vc-btn vc-btn-primary text-sm !py-2.5 !px-5"
    >
      {pending ? "Creando…" : "Crear vista"} <IconArrow size={14} />
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">
        {label}
      </label>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
        selected
          ? "bg-[var(--brand-soft)] border-[var(--brand)] text-[var(--brand-ink)]"
          : "bg-white border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--brand)]"
      }`}
    >
      {label}
    </button>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
