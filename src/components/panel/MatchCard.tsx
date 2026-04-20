"use client";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { matchStateAction, type CasoActionState } from "@/lib/casoActions";
import { IconCheck, IconX, IconArrow, IconPaw } from "../Icons";

const initial: CasoActionState = { ok: false, message: "" };

export type MatchProps = {
  id: string;
  other_slug: string;
  other_tipo: string;
  other_ciudad: string;
  other_color: string | null;
  other_nombre: string | null;
  other_foto: string | null;
  score: number;
  razones: Record<string, unknown> | null;
  estado: "sugerido" | "confirmado" | "descartado";
};

export function MatchCard({
  match,
  slug,
}: {
  match: MatchProps;
  slug: string;
}) {
  const [state, formAction] = useActionState(matchStateAction, initial);
  const scorePct = Math.round(match.score * 100);
  return (
    <div className="vc-card flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[var(--bg-alt)] shrink-0">
          {match.other_foto ? (
            <Image
              src={match.other_foto}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
              <IconPaw size={24} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--brand-ink)]">
            {match.other_tipo} · coincidencia {scorePct}%
          </span>
          <h4 className="font-semibold truncate">
            {match.other_nombre ||
              `${match.other_tipo} en ${match.other_ciudad}`}
          </h4>
          <p className="text-xs text-[var(--muted)]">
            {match.other_ciudad}
            {match.other_color ? ` · ${match.other_color}` : ""}
          </p>
          <RazonesBar razones={match.razones} />
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          href={`/casos/${match.other_slug}`}
          className="text-sm font-semibold text-[var(--brand-ink)] inline-flex items-center gap-1"
          target="_blank"
        >
          Ver caso <IconArrow size={14} />
        </Link>
        {match.estado === "sugerido" ? (
          <form action={formAction} className="flex gap-2">
            <input type="hidden" name="match_id" value={match.id} />
            <input type="hidden" name="slug" value={slug} />
            <StateBtn estado="descartado" label="Descartar" variant="outline" />
            <StateBtn estado="confirmado" label="Es este" variant="primary" />
          </form>
        ) : (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--accent-soft)] text-[#0d6b52]">
            {match.estado === "confirmado" ? "Confirmado" : "Descartado"}
          </span>
        )}
      </div>
      {state.message && (
        <p
          className={`text-xs ${state.ok ? "text-[#0d6b52]" : "text-[var(--brand-ink)]"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

function StateBtn({
  estado,
  label,
  variant,
}: {
  estado: string;
  label: string;
  variant: "primary" | "outline";
}) {
  const { pending } = useFormStatus();
  const cls = variant === "primary" ? "vc-btn-primary" : "vc-btn-outline";
  const Icon = estado === "confirmado" ? IconCheck : IconX;
  return (
    <button
      type="submit"
      name="estado"
      value={estado}
      disabled={pending}
      className={`vc-btn ${cls} text-xs py-1.5 px-3`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

function RazonesBar({ razones }: { razones: Record<string, unknown> | null }) {
  if (!razones) return null;
  const chips: string[] = [];
  if (razones.distancia_km != null)
    chips.push(`${razones.distancia_km} km`);
  else if (razones.ciudad_match) chips.push("misma ciudad");
  if (razones.dias_diff != null)
    chips.push(`${razones.dias_diff} días`);
  if (typeof razones.color === "number" && razones.color > 0)
    chips.push("color ✓");
  if (typeof razones.raza === "number" && razones.raza > 0)
    chips.push("raza ✓");
  if (razones.tamano) chips.push("tamaño ✓");
  if (chips.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {chips.map((c) => (
        <span
          key={c}
          className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)] bg-[var(--bg-alt)] rounded-full px-2 py-0.5"
        >
          {c}
        </span>
      ))}
    </div>
  );
}
