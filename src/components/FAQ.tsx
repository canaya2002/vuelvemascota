"use client";
import { useState } from "react";
import { IconArrow } from "./Icons";

export type FAQItem = { q: string; a: string };

export function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="py-5">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-6 text-left"
            >
              <span className="text-lg md:text-xl font-semibold">{it.q}</span>
              <span
                className={`inline-flex w-9 h-9 rounded-full items-center justify-center border border-[var(--line-strong)] bg-white transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
                aria-hidden
              >
                <IconArrow size={18} />
              </span>
            </button>
            {isOpen && (
              <p className="mt-4 text-[var(--ink-soft)] leading-relaxed max-w-3xl">
                {it.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
