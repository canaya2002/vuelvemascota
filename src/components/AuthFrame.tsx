import Image from "next/image";
import Link from "next/link";
import { pickImage } from "@/lib/images";
import {
  IconHeart,
  IconShield,
  IconBell,
  IconCheck,
} from "@/components/Icons";

/**
 * Premium two-column auth shell: brand panel on the left (gradient + hero
 * image + value props), Clerk widget on the right. Used by both /entrar and
 * /crear-cuenta to give the auth flow a polished, on-brand feel.
 */
export function AuthFrame({
  mode,
  children,
  bottomNote,
}: {
  mode: "signin" | "signup";
  children: React.ReactNode;
  bottomNote?: React.ReactNode;
}) {
  const isSignIn = mode === "signin";
  const heroImg = pickImage(isSignIn ? 6 : 9);

  return (
    <section className="relative min-h-[88vh] grid grid-cols-1 lg:grid-cols-12">
      {/* Brand / story panel */}
      <aside className="lg:col-span-6 relative overflow-hidden bg-[var(--ink)] text-white">
        <Image
          src={heroImg}
          alt=""
          fill
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-cover opacity-65"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[var(--ink)]/80 via-[var(--ink)]/55 to-[var(--brand-deep)]/55"
        />
        <div
          aria-hidden
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[var(--brand)]/30 blur-[120px]"
        />
        <div
          aria-hidden
          className="absolute bottom-[-8rem] right-[-6rem] w-[28rem] h-[28rem] rounded-full bg-white/10 blur-[140px]"
        />

        <div className="relative h-full flex flex-col p-10 md:p-14 lg:p-16">
          <Link
            href="/"
            className="vc-logo text-white"
            aria-label="VuelveaCasa — Inicio"
          >
            <span className="vc-logo-mark vc-logo-mark-dark" aria-hidden>
              <Image src="/icon.png" alt="" width={36} height={36} sizes="36px" />
            </span>
            <span className="text-xl">VuelveaCasa</span>
          </Link>

          <div className="mt-auto pt-12">
            <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-white/12 border border-white/20 backdrop-blur-md text-xs uppercase tracking-[0.14em] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] vc-pulse-ring" />
              {isSignIn ? "Bienvenida de vuelta" : "Únete a la red"}
            </span>
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-[3.25rem] font-semibold leading-[1.04] tracking-tight">
              {isSignIn ? (
                <>
                  Tu red. Tu zona.{" "}
                  <span className="text-white/85">A un paso.</span>
                </>
              ) : (
                <>
                  Activa tu zona y{" "}
                  <span className="text-white/85">súmate a la red</span> en
                  segundos.
                </>
              )}
            </h1>
            <p className="mt-5 text-white/80 text-base md:text-lg leading-relaxed max-w-md">
              {isSignIn
                ? "Sigue tus casos, donaciones y alertas. Coordina con vecinos, rescatistas y veterinarias aliadas."
                : "Reporta, busca, ofrece hogar temporal o dona a casos verificados. Gratis siempre — sin letras chiquitas."}
            </p>

            <ul className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              <AuthFeature
                icon={<IconBell size={15} />}
                label="Alertas hiperlocales"
              />
              <AuthFeature
                icon={<IconShield size={15} />}
                label="Aliados verificados"
              />
              <AuthFeature
                icon={<IconHeart size={15} />}
                label="Donaciones rastreables"
              />
              <AuthFeature
                icon={<IconCheck size={15} />}
                label="100% gratis siempre"
              />
            </ul>
          </div>
        </div>
      </aside>

      {/* Auth form panel */}
      <div className="lg:col-span-6 relative bg-[var(--bg)] flex items-center justify-center py-16 px-6 md:px-10">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(700px 460px at 75% 10%, rgba(184,38,74,0.06), transparent 60%)",
          }}
        />
        <div className="relative w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link
              href="/"
              className="vc-logo text-[var(--ink)]"
              aria-label="VuelveaCasa — Inicio"
            >
              <span className="vc-logo-mark" aria-hidden>
                <Image src="/icon.png" alt="" width={36} height={36} sizes="36px" />
              </span>
              <span className="text-xl">VuelveaCasa</span>
            </Link>
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {isSignIn ? "Entra a tu cuenta" : "Crea tu cuenta"}
            </h2>
            <p className="mt-2 text-[var(--ink-soft)]">
              {isSignIn
                ? "Te tomará un segundo."
                : "Menos de un minuto. Gratis siempre."}
            </p>
          </div>

          <div className="mt-8">{children}</div>

          {bottomNote && (
            <div className="mt-8 text-center lg:text-left text-sm text-[var(--muted)]">
              {bottomNote}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AuthFeature({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2.5 rounded-full px-3.5 py-2 bg-white/10 backdrop-blur-md border border-white/18 text-sm text-white/90">
      <span className="text-[var(--brand)] shrink-0">{icon}</span>
      {label}
    </li>
  );
}
