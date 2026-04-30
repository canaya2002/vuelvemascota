"use client";
import { useState } from "react";

export type FAQItem = { q: string; a: string };

export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-white/60 backdrop-blur-sm overflow-hidden divide-y divide-[var(--line)]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`group transition-colors ${
              isOpen ? "bg-[var(--brand-soft)]/30" : "hover:bg-[var(--bg-alt)]/60"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-start justify-between gap-6 text-left px-5 py-5 md:px-7 md:py-6 cursor-pointer"
            >
              <span
                className={`text-base md:text-lg font-semibold leading-snug pr-2 transition-colors ${
                  isOpen ? "text-[var(--brand-ink)]" : "text-[var(--ink)]"
                }`}
              >
                {it.q}
              </span>
              <span
                aria-hidden
                className={`relative shrink-0 inline-flex w-8 h-8 rounded-full items-center justify-center border transition-all duration-200 ${
                  isOpen
                    ? "bg-[var(--brand)] border-[var(--brand)] text-white rotate-180"
                    : "bg-white border-[var(--line-strong)] text-[var(--ink-soft)] group-hover:border-[var(--ink)]"
                }`}
              >
                <PlusMinusIcon open={isOpen} />
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-6 md:px-7 md:pb-7 text-[var(--ink-soft)] leading-relaxed max-w-3xl">
                  {it.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="2" y1="7" x2="12" y2="7" />
      <line
        x1="7"
        y1="2"
        x2="7"
        y2="12"
        className={`origin-center transition-transform duration-200 ${
          open ? "scale-y-0" : "scale-y-100"
        }`}
      />
    </svg>
  );
}
