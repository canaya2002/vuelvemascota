import * as React from "react";

type Props = {
  icon: React.ReactNode;
  title: string;
  body: string;
  tint?: "brand" | "accent" | "ink";
  /** Reserved for future use; currently identical to default styling. */
  elevated?: boolean;
};

/**
 * Tarjeta minimalista para grids de features. La paleta es restrictiva:
 * el icono usa un fondo neutro con outline, y solo cambia a tono de marca
 * cuando se pide explícitamente. Sin gradientes ni sombras dramáticas.
 */
export function FeatureCard({ icon, title, body, tint = "brand" }: Props) {
  const iconStyle =
    tint === "accent"
      ? "bg-[var(--success-soft)] text-[var(--success)] ring-1 ring-[var(--success)]/15"
      : tint === "ink"
      ? "bg-[var(--ink)] text-white"
      : "bg-[var(--brand-soft)] text-[var(--brand-ink)] ring-1 ring-[var(--brand)]/10";

  return (
    <div className="vc-card flex flex-col h-full group relative">
      <span
        className={`inline-flex w-11 h-11 rounded-xl items-center justify-center ${iconStyle} transition-transform group-hover:scale-105`}
        aria-hidden
      >
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2.5 text-[15px] text-[var(--ink-soft)] leading-relaxed flex-1">
        {body}
      </p>
    </div>
  );
}
