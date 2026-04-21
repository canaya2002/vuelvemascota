import Image from "next/image";
import Link from "next/link";
import { pickImage } from "@/lib/images";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  imageSeed = 3,
  primary,
  secondary,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  imageSeed?: number;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  // Offset primo grande para que las fotos flotantes no choquen con los
  // rangos de las secciones siguientes. Más información en la tabla en
  // /src/lib/images.ts.
  const accentSeed = imageSeed + 23;
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px 400px at 12% 10%, rgba(225,29,72,0.10), transparent 60%), radial-gradient(600px 400px at 95% 90%, rgba(14,165,233,0.12), transparent 60%)",
        }}
      />
      <div className="relative vc-container py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          {eyebrow && (
            <span className="vc-eyebrow vc-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-[1.05] vc-fade-up vc-fade-up-delay-1">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 text-lg md:text-xl text-[var(--ink-soft)] max-w-2xl leading-relaxed vc-fade-up vc-fade-up-delay-2">
              {subtitle}
            </p>
          )}
          {(primary || secondary) && (
            <div className="mt-8 flex flex-col sm:flex-row gap-3 vc-fade-up vc-fade-up-delay-3">
              {primary && (
                <Link
                  href={primary.href}
                  className="vc-btn vc-btn-primary vc-shine"
                >
                  {primary.label}
                </Link>
              )}
              {secondary && (
                <Link
                  href={secondary.href}
                  className="vc-btn vc-btn-outline"
                >
                  {secondary.label}
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[5/6] rounded-[32px] overflow-hidden shadow-lg ring-1 ring-[var(--line)] vc-tilt">
            <Image
              src={pickImage(imageSeed)}
              alt=""
              fill
              priority
              sizes="(max-width:1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
            />
          </div>
          {/* Foto flotante (solo desktop) para dar movimiento */}
          <div className="hidden md:block absolute -bottom-6 -left-6 w-[160px] h-[160px] rounded-full overflow-hidden ring-4 ring-white shadow-xl vc-float">
            <Image
              src={pickImage(accentSeed)}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
          <div className="hidden md:block absolute -top-5 -right-5 rounded-2xl overflow-hidden ring-1 ring-white/60 shadow-lg w-[120px] h-[150px] vc-float" style={{ animationDelay: "1.2s" }}>
            <Image
              src={pickImage(accentSeed + 1)}
              alt=""
              fill
              sizes="120px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
