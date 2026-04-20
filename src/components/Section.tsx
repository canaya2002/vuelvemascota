import * as React from "react";

type SectionProps = {
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  tone?: "default" | "alt" | "dark";
  id?: string;
  className?: string;
  children: React.ReactNode;
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
}: SectionProps) {
  const toneClass =
    tone === "alt"
      ? "bg-[var(--bg-alt)]"
      : tone === "dark"
      ? "bg-[#0b1f33] text-white"
      : "";
  return (
    <section id={id} className={`py-20 md:py-28 ${toneClass} ${className}`}>
      <div className="vc-container">
        {(eyebrow || title || subtitle) && (
          <div
            className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} mb-12`}
          >
            {eyebrow && (
              <span
                className={`vc-eyebrow ${tone === "dark" ? "!bg-white/10 !text-white" : ""}`}
              >
                {eyebrow}
              </span>
            )}
            {title && (
              <h2
                className={`mt-5 text-3xl md:text-5xl font-bold ${
                  tone === "dark" ? "text-white" : ""
                }`}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={`mt-5 text-lg md:text-xl leading-relaxed ${
                  tone === "dark" ? "text-white/75" : "text-[var(--ink-soft)]"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
