import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTA } from "@/components/CTA";
import { CITIES } from "@/lib/site";
import { pickImage } from "@/lib/images";
import { IconArrow } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Ciudades con cobertura — VuelveaCasa México",
  description:
    "Consulta las ciudades de México donde VuelveaCasa está activando su red comunitaria de mascotas perdidas, encontradas y rescate.",
  alternates: { canonical: "/ciudades" },
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Ciudades"
        title={<>Crecemos <span className="text-[var(--brand)]">ciudad por ciudad</span>.</>}
        subtitle="Empezamos por zonas con alta demanda y vamos abriendo nuevas. Si no está la tuya, regístrate y te avisamos cuando se active."
        imageSeed={2}
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CITIES.map((c, i) => (
            <Link
              key={c.slug}
              href={`/ciudades/${c.slug}`}
              className="group vc-card !p-0 overflow-hidden"
            >
              <div className="relative aspect-[5/4]">
                <Image src={pickImage(i + 30)} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f33]/80 to-transparent" />
                <div className="absolute left-4 bottom-4 text-white">
                  <p className="text-xs uppercase tracking-wider opacity-80">{c.state}</p>
                  <h3 className="text-2xl font-bold">{c.name}</h3>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <span className="text-sm text-[var(--ink-soft)]">Ver cobertura</span>
                <span className="text-[var(--brand-ink)]"><IconArrow size={18} /></span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <CTA seed={14} title="¿Tu ciudad no está todavía?" subtitle="Regístrate y te avisamos cuando tu zona se active. Mientras tanto, tu reporte queda visible en la red nacional." primaryHref="/registro" primaryLabel="Quiero avisos de mi ciudad" secondaryHref="/contacto?tema=otro" secondaryLabel="Escribirnos" />
    </>
  );
}
