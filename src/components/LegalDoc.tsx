"use client";
import * as React from "react";
import Link from "next/link";
import { IconShield, IconCheck, IconArrow } from "./Icons";

export type LegalSection = {
  id: string;
  title: string;
  /** Children rendered inside the section's content area. */
  body: React.ReactNode;
};

/**
 * Premium document layout with sticky TOC, anchored sections, refined
 * typography. Replaces broken `prose` classes — no Tailwind typography plugin
 * is installed, so styling has to live here. Uses scroll-spy to highlight the
 * active section in the TOC.
 */
export function LegalDoc({
  sections,
  lastUpdated,
  intro,
  contactHref = "/contacto",
  contactTema,
}: {
  sections: LegalSection[];
  lastUpdated: string;
  intro?: React.ReactNode;
  contactHref?: string;
  contactTema?: string;
}) {
  const [active, setActive] = React.useState<string>(sections[0]?.id ?? "");

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.5, 1] }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const contactUrl = contactTema
    ? `${contactHref}?tema=${encodeURIComponent(contactTema)}`
    : contactHref;

  return (
    <div className="vc-container py-14 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Sticky TOC */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-[var(--line)] bg-white/70 backdrop-blur-md p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-semibold mb-4">
                <span className="inline-flex w-7 h-7 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center">
                  <IconShield size={14} />
                </span>
                Índice
              </div>
              <ol className="space-y-1 text-sm">
                {sections.map((s, i) => {
                  const isActive = active === s.id;
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`group flex items-baseline gap-3 rounded-lg px-3 py-2 transition-colors ${
                          isActive
                            ? "bg-[var(--brand-soft)] text-[var(--brand-ink)] font-semibold"
                            : "text-[var(--ink-soft)] hover:bg-[var(--bg-alt)] hover:text-[var(--ink)]"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-mono tabular-nums ${
                            isActive
                              ? "text-[var(--brand-ink)]"
                              : "text-[var(--muted)]"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="leading-snug">{s.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-5 pt-5 border-t border-[var(--line)] text-xs text-[var(--muted)] space-y-1">
                <p className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  Última actualización
                </p>
                <p className="font-medium text-[var(--ink-soft)]">{lastUpdated}</p>
              </div>
              <Link
                href={contactUrl}
                className="mt-5 w-full vc-btn vc-btn-outline text-sm !py-2.5 !px-4"
              >
                Contactar al responsable
                <IconArrow size={14} />
              </Link>
            </div>
          </div>
        </aside>

        {/* Body */}
        <article className="lg:col-span-9 max-w-3xl">
          {intro && (
            <div className="mb-12 p-6 md:p-8 rounded-3xl border border-[var(--line)] bg-gradient-to-br from-[var(--brand-soft)]/40 to-transparent">
              <div className="text-[var(--ink-soft)] leading-relaxed text-base md:text-lg">
                {intro}
              </div>
            </div>
          )}

          <div className="space-y-16">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 group/sec"
              >
                <div className="flex items-baseline gap-4 mb-5">
                  <span className="text-xs font-mono tabular-nums tracking-widest text-[var(--brand)] font-bold">
                    §{String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-2xl md:text-[2rem] font-semibold leading-tight tracking-tight text-[var(--ink)]">
                    {s.title}
                  </h2>
                </div>
                <div className="legal-body">{s.body}</div>
                <a
                  href="#top"
                  className="mt-8 inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                >
                  <span aria-hidden>↑</span> Volver al inicio
                </a>
              </section>
            ))}
          </div>

          <div className="mt-20 pt-10 border-t border-[var(--line)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-[var(--muted)]">
              Versión vigente al {lastUpdated}.
            </p>
            <Link
              href={contactUrl}
              className="vc-btn vc-btn-primary text-sm !py-2.5 !px-5"
            >
              ¿Dudas? Escríbenos
              <IconArrow size={14} />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

/** Micro-utility used inside legal section body for compact bullet lists. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-3 mt-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-1.5 text-[var(--brand)] shrink-0">
            <IconCheck size={16} />
          </span>
          <span className="text-[var(--ink-soft)] leading-relaxed">{it}</span>
        </li>
      ))}
    </ul>
  );
}
