"use client";
import dynamic from "next/dynamic";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createAlertaAction, type CasoActionState } from "@/lib/casoActions";
import { CITIES } from "@/lib/site";
import { Select, TextField } from "../forms/Field";
import { IconArrow } from "../Icons";

const MapPicker = dynamic(() => import("../MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-[var(--line-strong)] h-[280px] bg-[var(--bg-alt)] animate-pulse" />
  ),
});

const initial: CasoActionState = { ok: false, message: "" };

const RADIOS = [1000, 2000, 3000, 5000, 10000];

export function AlertaForm() {
  const [state, formAction] = useActionState(createAlertaAction, initial);
  const [ubic, setUbic] = useState<{ lat: number; lng: number } | null>(null);
  const [radio, setRadio] = useState(3000);

  return (
    <form action={formAction} className="vc-card space-y-5">
      <h3 className="text-xl font-semibold">Nueva alerta</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Ciudad" name="ciudad" defaultValue="">
          <option value="">Cualquier ciudad</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}, {c.state}
            </option>
          ))}
        </Select>
        <TextField label="Colonia / zona (opcional)" name="colonia" />
      </div>

      <fieldset>
        <legend className="vc-label">Especies</legend>
        <div className="flex flex-wrap gap-3">
          {[
            { v: "perro", t: "Perros" },
            { v: "gato", t: "Gatos" },
            { v: "otro", t: "Otros" },
          ].map((e) => (
            <label key={e.v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="especies"
                value={e.v}
                defaultChecked
                className="w-4 h-4 accent-[var(--brand)]"
              />
              <span className="text-sm">{e.t}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="vc-label">Radio de alerta</label>
        <div className="flex flex-wrap gap-2">
          {RADIOS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadio(r)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                radio === r
                  ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                  : "bg-white border-[var(--line-strong)] hover:border-[var(--ink)]"
              }`}
            >
              {(r / 1000).toFixed(r % 1000 === 0 ? 0 : 1)} km
            </button>
          ))}
        </div>
        <input type="hidden" name="radio_m" value={radio} />
      </div>

      <div>
        <label className="vc-label">Punto central (opcional)</label>
        <MapPicker value={ubic} onChange={(v) => setUbic(v)} height={280} />
        <input type="hidden" name="lat" value={ubic?.lat ?? ""} />
        <input type="hidden" name="lng" value={ubic?.lng ?? ""} />
        <p className="vc-hint">
          Si no marcas un punto, recibes avisos de toda la ciudad elegida.
        </p>
      </div>

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
    <button type="submit" disabled={pending} className="vc-btn vc-btn-primary">
      {pending ? "Creando…" : "Crear alerta"} <IconArrow size={16} />
    </button>
  );
}
