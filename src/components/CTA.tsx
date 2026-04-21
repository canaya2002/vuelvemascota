import Link from "next/link";
import Image from "next/image";
import { pickImage } from "@/lib/images";

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
    <section className="py-20 md:py-24">
      <div className="vc-container">
        <div className="relative overflow-hidden rounded-[28px] bg-[#0b1f33] text-white px-6 md:px-14 py-14 md:py-20 vc-shine">
          <Image
            src={pickImage(seed)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30"
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, rgba(11,31,51,0.95) 30%, rgba(11,31,51,0.70) 60%, rgba(225,29,72,0.55) 100%)",
            }}
            aria-hidden
          />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold !text-white">{title}</h2>
            <p className="mt-5 text-lg md:text-xl text-white/85 leading-relaxed">
              {subtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href={primaryHref} className="vc-btn vc-btn-primary">
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
