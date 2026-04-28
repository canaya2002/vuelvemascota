import Link from "next/link";
import Image from "next/image";
import { pickImage } from "@/lib/images";

/**
 * Bloque de cierre uniforme. Diseño sobrio: foto + overlay neutro deep navy
 * (sin gradiente colorido) y CTAs duales. Los botones combinan brand sólido
 * + outline blanco para que el énfasis caiga en la imagen, no en el botón.
 */
export function CTA({
  title = "¿Listo para ayudar a que más mascotas vuelvan a casa?",
  subtitle = "Sumate gratis. Te avisamos cuando tu zona esté activa y cuando alguien necesite ayuda cerca de ti.",
  primaryHref = "/registro",
  primaryLabel = "Registrarme gratis",
  secondaryHref = "/donar",
  secondaryLabel = "Apoyar con una donación",
  seed = 7,
}: {
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  seed?: number;
}) {
  return (
    <section className="py-20 md:py-28">
      <div className="vc-container">
        <div className="relative overflow-hidden rounded-[24px] bg-[var(--bg-deep)] text-white px-6 md:px-16 py-16 md:py-24">
          <Image
            src={pickImage(seed)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,24,39,0.85) 0%, rgba(14,24,39,0.96) 100%)",
            }}
            aria-hidden
          />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-semibold !text-white tracking-tight">
              {title}
            </h2>
            <p className="mt-5 text-base md:text-lg text-white/75 leading-relaxed">
              {subtitle}
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link href={primaryHref} className="vc-btn vc-btn-brand">
                {primaryLabel}
              </Link>
              <Link href={secondaryHref} className="vc-btn vc-btn-ghost">
                {secondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
