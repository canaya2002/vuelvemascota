"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { IconPaw, IconMenu, IconX, IconHeart, IconBell, IconSearch } from "./Icons";
import { FLAGS } from "@/lib/flags";

const LINKS = [
  { href: "/casos", label: "Casos", icon: IconSearch },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/alertas", label: "Alertas", icon: IconBell },
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
          ? "vc-glass-strong border-b border-[var(--glass-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="vc-container flex items-center justify-between py-3">
        <Link
          href="/"
          className="vc-logo text-[var(--ink)]"
          aria-label="VuelveaCasa — Inicio"
        >
          <span className="vc-logo-mark">
            <IconPaw size={22} />
          </span>
          <span className="text-lg sm:text-xl">VuelveaCasa</span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:flex items-center gap-0.5">
          {LINKS.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-full hover:bg-white/60 transition-colors"
              >
                {Icon && <Icon size={15} />}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link href="/donar" className="vc-btn vc-btn-glass text-sm !py-2.5 !px-4">
            <IconHeart size={15} /> Donar
          </Link>
          {FLAGS.auth ? (
            <AuthActionsDesktop />
          ) : (
            <Link href="/registro" className="vc-btn vc-btn-primary text-sm !py-2.5 !px-4">
              Registrarme
            </Link>
          )}
        </div>

        <button
          className="lg:hidden inline-flex w-10 h-10 items-center justify-center rounded-full vc-glass-strong"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconX size={20} /> : <IconMenu size={20} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 top-[64px] z-40 overflow-y-auto vc-glass-strong">
          <nav aria-label="Móvil" className="vc-container py-6 flex flex-col gap-1">
            {LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-3.5 px-4 rounded-xl text-base font-semibold text-[var(--ink)] hover:bg-white flex items-center gap-3 transition-colors"
                >
                  {Icon && (
                    <span className="text-[var(--brand)]">
                      <Icon size={18} />
                    </span>
                  )}
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/donar"
              onClick={() => setOpen(false)}
              className="py-3.5 px-4 rounded-xl text-base font-semibold text-[var(--ink)] hover:bg-white flex items-center gap-3"
            >
              <span className="text-[var(--brand)]">
                <IconHeart size={18} />
              </span>
              Donar
            </Link>
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="py-3.5 px-4 rounded-xl text-base font-semibold text-[var(--ink)] hover:bg-white"
            >
              Contacto
            </Link>

            {FLAGS.auth ? (
              <AuthActionsMobile onNavigate={() => setOpen(false)} />
            ) : (
              <div className="mt-5 flex flex-col gap-3">
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
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function AuthActionsDesktop() {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) {
    return <div className="w-9 h-9 rounded-full bg-[var(--bg-alt)] animate-pulse" />;
  }
  if (isSignedIn) {
    return (
      <>
        <Link
          href="/panel"
          className="text-sm font-semibold text-[var(--ink)] hover:text-[var(--brand-ink)] px-3"
        >
          Panel
        </Link>
        <UserButton
          appearance={{ elements: { avatarBox: "w-9 h-9" } }}
        />
      </>
    );
  }
  return (
    <>
      <Link
        href="/entrar"
        className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] px-3"
      >
        Entrar
      </Link>
      <Link
        href="/crear-cuenta"
        className="vc-btn vc-btn-primary text-sm !py-2.5 !px-4"
      >
        Crear cuenta
      </Link>
    </>
  );
}

function AuthActionsMobile({ onNavigate }: { onNavigate: () => void }) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;
  if (isSignedIn) {
    return (
      <div className="mt-5 flex flex-col gap-3">
        <Link
          href="/panel"
          onClick={onNavigate}
          className="vc-btn vc-btn-primary"
        >
          Ir a mi panel
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-5 flex flex-col gap-3">
      <Link
        href="/crear-cuenta"
        onClick={onNavigate}
        className="vc-btn vc-btn-primary"
      >
        Crear cuenta gratis
      </Link>
      <Link href="/entrar" onClick={onNavigate} className="vc-btn vc-btn-outline">
        Entrar
      </Link>
    </div>
  );
}
