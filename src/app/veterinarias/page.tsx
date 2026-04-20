import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { AllyForm } from "@/components/forms/AllyForm";
import { CTA } from "@/components/CTA";
import { IconStethoscope, IconShield, IconSpark, IconHeart, IconCheck } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Para veterinarias y aliados — Red de atención veterinaria VuelveaCasa",
  description:
    "Veterinarias y clínicas en México: súmate a la red de aliados de VuelveaCasa. Directorio, flujo de casos aliados y primera atención a mascotas rescatadas.",
  alternates: { canonical: "/veterinarias" },
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Veterinarias y aliados"
        title={<>Red de atención para mascotas que <span className="text-[var(--brand)]">lo necesitan</span>.</>}
        subtitle="Activamos clínicas y hospitales veterinarios como aliados. Reciben casos de rescate, aparecen en el directorio y contribuyen a cerrar el ciclo de reencuentro o adopción."
        imageSeed={34}
        primary={{ href: "#postular", label: "Sumar mi clínica" }}
        secondary={{ href: "/contacto?tema=vet", label: "Hablar con el equipo" }}
      />

      <Section eyebrow="Beneficios" title="Qué ganas al ser aliado verificado">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard icon={<IconStethoscope size={22} />} title="Directorio público" body="Aparece como aliado verificado en tu ciudad. Más visibilidad ante una comunidad que necesita servicios de calidad." />
          <FeatureCard icon={<IconShield size={22} />} title="Casos aliados" body="Recibe avisos cuando llega una mascota sin dueño cerca. Primera atención coordinada con la red." tint="accent" />
          <FeatureCard icon={<IconSpark size={22} />} title="Comunidad activa" body="Colabora con rescatistas y voluntarios. Conviertes tu clínica en parte visible del cuidado animal local." tint="ink" />
          <FeatureCard icon={<IconHeart size={22} />} title="Posicionamiento local" body="SEO orgánico, menciones y content partnerships con VuelveaCasa para crecer tu marca." />
          <FeatureCard icon={<IconCheck size={22} />} title="Sin letras chiquitas" body="No hay costo de suscripción en fase inicial. Entras si cumples con estándares básicos de calidad." />
          <FeatureCard icon={<IconStethoscope size={22} />} title="Impacto medible" body="Compartimos reportes del impacto de la red en reencuentros, rescates y donaciones." tint="accent" />
        </div>
      </Section>

      <section id="postular" className="py-20 md:py-24">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="vc-eyebrow">Postular como clínica aliada</span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">Regístrate para validar tu clínica.</h2>
            <p className="mt-5 text-lg text-[var(--ink-soft)] leading-relaxed">
              Revisamos tu información básica y te contactamos. Queremos que cada clínica aliada genere confianza real en su zona.
            </p>
          </div>
          <AllyForm kind="veterinarias" />
        </div>
      </section>

      <CTA seed={36} title="¿Quieres proponer una alianza de marca?" subtitle="Si representas una empresa, medio o institución, escríbenos y te mandamos los formatos disponibles." primaryHref="/contacto?tema=aliados" primaryLabel="Proponer alianza" secondaryHref="/rescatistas" secondaryLabel="Ver para rescatistas" />
    </>
  );
}
