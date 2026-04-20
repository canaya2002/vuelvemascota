"use client";
import { useState, useTransition } from "react";
import { IconHeart } from "./Icons";

const PRESETS = [100, 250, 500, 1000, 2500];

export type DonationWidgetProps = {
  casoId?: string;
  casoSlug?: string;
  casoTitulo?: string;
  compact?: boolean;
  defaultCausa?: "fondo" | "emergencia" | "rescate";
};

export function DonationWidget({
  casoId,
  casoSlug,
  casoTitulo,
  compact,
  defaultCausa = "fondo",
}: DonationWidgetProps) {
  const [amount, setAmount] = useState<number>(250);
  const [custom, setCustom] = useState<string>("");
  const [recurrente, setRecurrente] = useState(false);
  const [causa, setCausa] = useState<string>(casoId ? "rescate" : defaultCausa);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const effective = custom ? Number(custom) : amount;
  const isForCaso = !!casoId;

  function submit() {
    setError(null);
    const value = Number(effective);
    if (!value || value < 20) {
      setError("El monto mínimo es $20 MXN.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/donar/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: value,
            recurrente,
            causa,
            currency: "mxn",
            caso_id: casoId,
            caso_slug: casoSlug,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "No pudimos iniciar el pago. Intenta de nuevo.");
          return;
        }
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        setError(
          data?.message ||
            "Estamos activando el cobro. Déjanos tu contacto en /contacto y te avisamos apenas esté disponible."
        );
      } catch {
        setError("Hubo un problema de conexión. Intenta de nuevo.");
      }
    });
  }

  return (
    <div className="vc-card">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-[var(--brand)] text-white inline-flex items-center justify-center">
          <IconHeart size={22} />
        </span>
        <div>
          <h3 className="text-xl font-semibold">
            {isForCaso ? "Apoyar este caso" : "Hacer una donación"}
          </h3>
          <p className="text-sm text-[var(--ink-soft)]">
            {isForCaso && casoTitulo
              ? `Para ${casoTitulo}`
              : "Pago seguro con Stripe · MXN"}
          </p>
        </div>
      </div>

      {!isForCaso && (
        <fieldset className="mt-6">
          <legend className="vc-label">Destino</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { v: "fondo", t: "Fondo comunitario" },
              { v: "emergencia", t: "Emergencias veterinarias" },
              { v: "rescate", t: "Rescatistas aliados" },
            ].map((o) => (
              <label
                key={o.v}
                className={`cursor-pointer px-3 py-3 rounded-xl border text-sm text-center transition-colors ${
                  causa === o.v
                    ? "bg-[var(--brand-soft)] border-[var(--brand)] text-[var(--brand-ink)] font-semibold"
                    : "border-[var(--line-strong)] bg-white hover:border-[var(--ink)]"
                }`}
              >
                <input
                  type="radio"
                  name="causa"
                  value={o.v}
                  checked={causa === o.v}
                  onChange={() => setCausa(o.v)}
                  className="sr-only"
                />
                {o.t}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="mt-6">
        <legend className="vc-label">Monto (MXN)</legend>
        <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-5"}`}>
          {PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setAmount(n);
                setCustom("");
              }}
              className={`px-3 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                !custom && amount === n
                  ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                  : "border-[var(--line-strong)] bg-white hover:border-[var(--ink)]"
              }`}
            >
              ${n}
            </button>
          ))}
        </div>
        <input
          type="number"
          inputMode="numeric"
          min={20}
          placeholder="Otro monto"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="vc-input mt-3"
        />
      </fieldset>

      {!isForCaso && (
        <label className="mt-5 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={recurrente}
            onChange={(e) => setRecurrente(e.target.checked)}
            className="mt-1 w-5 h-5 accent-[var(--brand)]"
          />
          <span className="text-sm text-[var(--ink-soft)]">
            Hacerla <strong>mensual</strong> para sostener la operación comunitaria.
          </span>
        </label>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="vc-btn vc-btn-primary w-full mt-6"
      >
        {pending ? "Redirigiendo…" : `Donar $${Number(effective) || 0} MXN`}
      </button>

      {error && (
        <p className="mt-3 text-sm text-[var(--brand-ink)]" aria-live="polite">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-[var(--muted)]">
        Pago procesado por Stripe. No guardamos datos de tu tarjeta.
        {isForCaso ? " Este monto se registra en la transparencia del caso." : ""}
      </p>
    </div>
  );
}
