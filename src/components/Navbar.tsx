"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { IconPaw, IconMenu, IconX } from "./Icons";

const LINKS = [
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/para-quien-es", label: "Para quién es" },
  { href: "/casos-de-uso", label: "Casos" },
  { href: "/rescatistas", label: "Rescatistas" },
  { href: "/veterinarias", label: "Veterinarias" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? "bg-[rgba(255,250,245,0.85)] backdrop-blur-md border-b border-[var(--line)]"
          : "bg-transparent"
      }`}
    >
      <div className="vc-container flex items-center justify-between py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-[var(--ink)]"
          aria-label="Ir al inicio"
        >
          <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-[var(--brand)] text-white">
            <IconPaw size={20} />
          </span>
          <span className="text-lg tracking-tight">VuelveaCasa</span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-full hover:bg-[var(--bg-alt)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link href="/donar" className="vc-btn vc-btn-outline text-sm py-2.5 px-4">
            Donar
          </Link>
          <Link href="/registro" className="vc-btn vc-btn-primary text-sm py-2.5 px-4">
            Registrarme
          </Link>
        </div>

        <button
          className="lg:hidden inline-flex w-10 h-10 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconX size={20} /> : <IconMenu size={20} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 top-[64px] bg-[var(--bg)] z-40 overflow-y-auto">
          <nav
            aria-label="Móvil"
            className="vc-container py-6 flex flex-col gap-1"
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 px-4 rounded-xl text-base font-medium text-[var(--ink)] hover:bg-[var(--bg-alt)]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/donar"
              onClick={() => setOpen(false)}
              className="py-3 px-4 rounded-xl text-base font-medium text-[var(--ink)] hover:bg-[var(--bg-alt)]"
            >
              Donar
            </Link>
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="py-3 px-4 rounded-xl text-base font-medium text-[var(--ink)] hover:bg-[var(--bg-alt)]"
            >
              Contacto
            </Link>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/registro"
                onClick={() => setOpen(false)}
                className="vc-btn vc-btn-primary"
              >
                Registrarme gratis
              </Link>
              <Link
                href="/donar"
                onClick={() => setOpen(false)}
                className="vc-btn vc-btn-outline"
              >
                Apoyar con una donación
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
