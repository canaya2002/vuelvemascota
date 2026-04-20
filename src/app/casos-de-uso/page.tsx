import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTA } from "@/components/CTA";
import { pickImage } from "@/lib/images";
import { IconArrow } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Casos de uso — Qué puedes resolver con VuelveaCasa",
  description:
    "Ejemplos reales de cómo VuelveaCasa ayuda: perros perdidos, gatos encontrados, rescate en la calle, hogar temporal, casos veterinarios de emergencia y más.",
  alternates: { canonical: "/casos-de-uso" },
};

const cases = [
  {
    t: "Perro perdido en la colonia",
    b: "Tu perro se salió por la puerta. Creas el caso, activas tu zona y en minutos vecinos y rescatistas reciben la alerta con fotos y ubicación.",
    chips: ["Reporte", "Alertas por zona", "Comunidad"],
  },
  {
    t: "Gato perdido por ruidos",
    b: "Un gato salió asustado en pirotecnia. Publicas el caso, sumas avistamientos de vecinos y coordinas visitas con hogar temporal y veterinaria aliada.",
    chips: ["Reporte", "Avistamientos", "Veterinarias"],
  },
  {
    t: "Perro encontrado sin collar",
    b: "Lo recoges de la calle pero no puedes quedártelo. Subes el caso, activas resguardo temporal y coordinas con la red hasta que aparezca su familia.",
    chips: ["Encontrada", "Hogar temporal"],
  },
  {
    t: "Rescate de emergencia",
    b: "Una mascota herida necesita atención urgente. El caso se prioriza, una veterinaria aliada la recibe y la red comunitaria apoya con donaciones.",
    chips: ["Emergencia", "Veterinarias", "Donaciones"],
  },
  {
    t: "Camada rescatada",
    b: "Un refugio encuentra una camada. Publican el caso, activan hogares temporales y abren donaciones verificadas para alimento y atención.",
    chips: ["Refugio", "Hogar temporal", "Donaciones"],
  },
  {
    t: "Mascota en tránsito",
    b: "Necesita traslado entre ciudades para encontrar a su familia o a su adoptante. VuelveaCasa conecta voluntarios y logística entre zonas.",
    chips: ["Traslados", "Aliados"],
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Casos de uso"
        title={<>Para resolver lo que ya está pasando en la <span className="text-[var(--brand)]">calle</span>.</>}
        subtitle="VuelveaCasa se diseñó mirando casos reales de México. Estas son algunas situaciones típicas donde la plataforma hace la diferencia."
        imageSeed={13}
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <article key={c.t} className="vc-card overflow-hidden !p-0 flex flex-col">
              <div className="relative aspect-[4/3]">
                <Image src={pickImage(25 + i)} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">{c.t}</h3>
                <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">{c.b}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {c.chips.map((ch) => (
                    <li key={ch} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                      {ch}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 flex gap-3 flex-wrap">
          <Link href="/registro" className="vc-btn vc-btn-primary">
            Sumarme a la red <IconArrow size={18} />
          </Link>
          <Link href="/donar" className="vc-btn vc-btn-outline">
            Apoyar con donación
          </Link>
        </div>
      </Section>

      <CTA seed={28} />
    </>
  );
}
