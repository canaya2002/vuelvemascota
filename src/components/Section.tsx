import * as React from "react";
import { Reveal } from "@/components/motion";

type SectionProps = {
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  tone?: "default" | "alt" | "dark";
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Disable the scroll reveal wrapper (e.g., forms that must render instantly). */
  noReveal?: boolean;
};

export function Section({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "default",
  id,
  className = "",
  children,
  noReveal = false,
}: SectionProps) {
  const toneClass =
    tone === "alt"
      ? "bg-[var(--bg-alt)]"
      : tone === "dark"
      ? "relative overflow-hidden bg-[#0b1f33] text-white"
      : "";

  const header = (eyebrow || title || subtitle) && (
    <div
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} mb-12`}
    >
      {eyebrow && (
        <span
          className={`vc-eyebrow ${
            tone === "dark" ? "!bg-white/14 !text-white !border !border-white/20" : ""
          }`}
        >
          {eyebrow}
        </span>
      )}
      {title && (
        <h2
          className={`mt-5 text-3xl md:text-5xl font-bold ${
            tone === "dark" ? "!text-white" : ""
          }`}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className={`mt-5 text-lg md:text-xl leading-relaxed ${
            tone === "dark" ? "text-white/80" : "text-[var(--ink-soft)]"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  return (
    <section id={id} className={`py-20 md:py-28 ${toneClass} ${className}`}>
      {tone === "dark" && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background:
              "radial-gradient(700px 380px at 15% 10%, rgba(225,29,72,0.22), transparent 60%), radial-gradient(600px 380px at 90% 90%, rgba(14,165,233,0.18), transparent 60%)",
          }}
        />
      )}
      <div className="relative vc-container">
        {header ? (
          noReveal ? (
            header
          ) : (
            <Reveal direction="up" distance={14}>
              {header}
            </Reveal>
          )
        ) : null}
        {noReveal ? children : <Reveal direction="up" distance={14} delay={80}>{children}</Reveal>}
      </div>
    </section>
  );
}
