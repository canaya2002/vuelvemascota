import * as React from "react";

type Props = {
  icon: React.ReactNode;
  title: string;
  body: string;
  tint?: "brand" | "accent" | "ink";
};

export function FeatureCard({ icon, title, body, tint = "brand" }: Props) {
  const bg =
    tint === "accent"
      ? "bg-[var(--accent-soft)] text-[#0d6b52]"
      : tint === "ink"
      ? "bg-[#0b1f33] text-white"
      : "bg-[var(--brand-soft)] text-[var(--brand-ink)]";
  return (
    <div className="vc-card flex flex-col h-full">
      <span
        className={`inline-flex w-12 h-12 rounded-2xl items-center justify-center ${bg}`}
        aria-hidden
      >
        {icon}
      </span>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">{body}</p>
    </div>
  );
}
