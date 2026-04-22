import * as React from "react";

type Props = {
  icon: React.ReactNode;
  title: string;
  body: string;
  tint?: "brand" | "accent" | "ink";
  /** Optional gradient ring on hover for extra delight. */
  elevated?: boolean;
};

export function FeatureCard({ icon, title, body, tint = "brand", elevated = false }: Props) {
  const bg =
    tint === "accent"
      ? "bg-[var(--accent-soft)] text-[#0d6b52]"
      : tint === "ink"
      ? "bg-[#0b1f33] text-white"
      : "bg-[var(--brand-soft)] text-[var(--brand-ink)]";
  const base = elevated ? "vc-card-glass" : "vc-card";
  return (
    <div
      className={`${base} flex flex-col h-full group relative transition-all hover:-translate-y-1 hover:shadow-[0_18px_36px_-18px_rgba(10,26,43,0.25)]`}
    >
      <span
        className={`inline-flex w-12 h-12 rounded-2xl items-center justify-center ${bg} transition-transform group-hover:scale-105`}
        aria-hidden
      >
        {icon}
      </span>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-[var(--ink-soft)] leading-relaxed flex-1">{body}</p>
    </div>
  );
}
