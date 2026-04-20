import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTA } from "@/components/CTA";
import { pickImage } from "@/lib/images";
import { IconArrow } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Para quién es VuelveaCasa — Dueños, rescatistas, veterinarias y aliados",
  description:
    "VuelveaCasa es para dueños que buscan a su mascota, personas que encontraron una, rescatistas, refugios, veterinarias y aliados que quieren sumar a una red comunitaria.",
  alternates: { canonical: "/para-quien-es" },
};

const audiences = [
  {
    id: "dueños",
    t: "Perdiste a tu mascota",
    b: "Creas tu caso en minutos, activas tu zona y recibes pistas organizadas. Nadie tiene que buscarte en grupos: la red te encuentra a ti.",
    cta: { href: "/mascota-perdida", label: "Reportar mascota perdida" },
  },
  {
    id: "rescataste",
    t: "Encontraste a una mascota",
    b: "Súbela con fotos y ubicación. Le avisamos a quien la está buscando y te acompañamos si necesitas resguardo temporal o vet.",
    cta: { href: "/mascota-encontrada", label: "Reportar mascota encontrada" },
  },
  {
    id: "ayudar",
    t: "Quieres ayudar",
    b: "Suma tu colonia a las alertas, ofrece hogar temporal, comparte casos o dona a rescates reales. Poco es mucho cuando somos muchos.",
    cta: { href: "/registro?rol=voluntario", label: "Sumarme como voluntario" },
  },
  {
    id: "rescatistas",
    t: "Eres rescatista o refugio",
    b: "Publica casos, recibe apoyo económico verificable, coordina traslados y accede a una red activa de voluntarios y aliados.",
    cta: { href: "/rescatistas", label: "Sumar mi operación" },
  },
  {
    id: "veterinarias",
    t: "Eres clínica o hospital veterinario",
    b: "Recibe avisos cuando llega una mascota sin dueño, aparece en el directorio aliado y activa atención para casos de rescate.",
    cta: { href: "/veterinarias", label: "Sumar mi clínica" },
  },
  {
    id: "aliados",
    t: "Eres marca, empresa o patrocinador",
    b: "Asocia tu marca a impacto medible, local y transparente. Tenemos formatos de alianza claros para comunidades, empresas y medios.",
    cta: { href: "/contacto?tema=aliados", label: "Proponer alianza" },
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Para quién es"
        title={<>Una red que le habla a <span className="text-[var(--brand)]">todos los lados</span> de la historia.</>}
        subtitle="Dueños, rescatistas, vecinos, clínicas y aliados. Cada pieza suma para que una mascota perdida vuelva a casa."
        imageSeed={8}
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {audiences.map((a, i) => (
            <div key={a.id} id={a.id} className="grid grid-cols-1 sm:grid-cols-5 gap-5 items-start">
              <div className="relative aspect-square rounded-3xl overflow-hidden sm:col-span-2">
                <Image src={pickImage(20 + i)} alt="" fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" />
              </div>
              <div className="sm:col-span-3">
                <h3 className="text-2xl font-semibold">{a.t}</h3>
                <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">{a.b}</p>
                <Link href={a.cta.href} className="mt-5 inline-flex items-center gap-2 font-semibold text-[var(--brand-ink)]">
                  {a.cta.label} <IconArrow size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CTA seed={19} />
    </>
  );
}
