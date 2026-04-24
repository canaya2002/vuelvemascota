"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  IconMenu,
  IconX,
  IconHeart,
  IconBell,
  IconSearch,
} from "./Icons";
import { FLAGS } from "@/lib/flags";

const LINKS = [
  { href: "/casos", label: "Casos", icon: IconSearch },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/alertas", label: "Alertas", icon: IconBell },
  { href: "/foros", label: "Foros" },
  { href: "/chat", label: "Chat" },
  { href: "/rescatistas", label: "Rescatistas" },
  { href: "/veterinarias", label: "Veterinarias" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar el drawer al navegar (Link suave + back/forward). Evita que el
  // menú quede abierto tapando contenido en la siguiente pantalla.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquea scroll del body solo cuando el drawer está abierto. En iOS
  // Safari, tocar `overflow` del body dispara un repaint que descoloca la
  // vista — por eso fijamos también la posición y la restauramos al cerrar.
  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      document.body.style.overflow = prev.overflow;
      window.scrollTo(0, y);
    };
  }, [open]);

  // Escape cierra el drawer (accesibilidad teclado).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors ${
          scrolled
            ? "vc-glass-strong border-b border-[var(--glass-border)]"
            : "bg-white/85 backdrop-blur-md"
        }`}
      >
        <div className="vc-container flex items-center justify-between py-3">
          <Link
            href="/"
            className="vc-logo text-[var(--ink)]"
            aria-label="VuelveaCasa — Inicio"
          >
            <span className="vc-logo-mark" aria-hidden>
              <Image
                src="/icon.png"
                alt=""
                width={36}
                height={36}
                priority
                sizes="36px"
              />
            </span>
            <span className="text-lg sm:text-xl">VuelveaCasa</span>
          </Link>

          <nav
            aria-label="Principal"
            className="hidden lg:flex items-center gap-0.5"
          >
            {LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-full hover:bg-white/70 transition-colors"
                >
                  {Icon && <Icon size={15} />}
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/donar"
              className="vc-btn vc-btn-glass text-sm !py-2.5 !px-4"
            >
              <IconHeart size={15} /> Donar
            </Link>
            {FLAGS.auth ? (
              <AuthActionsDesktop />
            ) : (
              <Link
                href="/registro"
                className="vc-btn vc-btn-primary text-sm !py-2.5 !px-4"
              >
                Registrarme
              </Link>
            )}
          </div>

          {/* Hamburger. Sin backdrop-filter anidado (rompía hit-testing en
              iOS Safari cuando el header ya tenía su propio blur). Bg sólido,
              touch-action manipulation para eliminar el delay de 300ms y
              z-index alto para garantizar que sea la capa top-most. */}
          <button
            type="button"
            onClick={toggle}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="lg:hidden relative z-[60] inline-flex w-11 h-11 items-center justify-center rounded-full bg-white text-[var(--ink)] border border-[var(--line-strong)] shadow-sm active:scale-95 transition-transform"
            style={{ touchAction: "manipulation" }}
          >
            {open ? <IconX size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </header>

      {/* Drawer + backdrop fuera del <header> sticky para no heredar su
          contexto de apilamiento/backdrop-filter. Backdrop clickeable cierra
          el menú. z-50 queda sobre todo el contenido de la página. */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={close}
            className="lg:hidden fixed inset-0 z-40 bg-black/30"
            style={{ touchAction: "manipulation" }}
          />
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="lg:hidden fixed inset-x-0 top-[64px] bottom-0 z-50 overflow-y-auto bg-white border-t border-[var(--line)]"
          >
            <nav
              aria-label="Móvil"
              className="vc-container py-6 flex flex-col gap-1"
            >
              {LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={close}
                    className="py-3.5 px-4 rounded-xl text-base font-semibold text-[var(--ink)] hover:bg-[var(--bg-alt)] flex items-center gap-3 transition-colors"
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
                onClick={close}
                className="py-3.5 px-4 rounded-xl text-base font-semibold text-[var(--ink)] hover:bg-[var(--bg-alt)] flex items-center gap-3"
              >
                <span className="text-[var(--brand)]">
                  <IconHeart size={18} />
                </span>
                Donar
              </Link>
              <Link
                href="/contacto"
                onClick={close}
                className="py-3.5 px-4 rounded-xl text-base font-semibold text-[var(--ink)] hover:bg-[var(--bg-alt)]"
              >
                Contacto
              </Link>

              {FLAGS.auth ? (
                <AuthActionsMobile onNavigate={close} />
              ) : (
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href="/registro"
                    onClick={close}
                    className="vc-btn vc-btn-primary"
                  >
                    Registrarme gratis
                  </Link>
                  <Link
                    href="/donar"
                    onClick={close}
                    className="vc-btn vc-btn-outline"
                  >
                    Apoyar con una donación
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </>
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
        <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
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
        <Link href="/panel" onClick={onNavigate} className="vc-btn vc-btn-primary">
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
