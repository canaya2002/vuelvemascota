import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { AllyForm } from "@/components/forms/AllyForm";
import { CTA } from "@/components/CTA";
import { IconShield, IconMoney, IconHeart, IconSpark, IconCheck } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Para rescatistas y refugios — Tecnología y red que apoya lo que ya haces",
  description:
    "Rescatistas, colectivos y refugios: publica casos, recibe apoyo económico verificable, coordina traslados y accede a una comunidad activa en México.",
  alternates: { canonical: "/rescatistas" },
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Rescatistas y refugios"
        title={<>Tecnología y red para lo que ya haces <span className="text-[var(--brand)]">todos los días</span>.</>}
        subtitle="VuelveaCasa nace con y para la comunidad de rescate. Queremos darles infraestructura, visibilidad y apoyo económico transparente."
        imageSeed={30}
        primary={{ href: "#postular", label: "Sumar mi operación" }}
        secondary={{ href: "/contacto?tema=rescate", label: "Hablar con el equipo" }}
      />

      <Section eyebrow="Qué incluye" title="Infraestructura sin costo para rescatistas verificados">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard icon={<IconShield size={22} />} title="Perfil verificado" body="Aparece como aliado en el directorio. Los dueños y voluntarios te pueden encontrar y contactar." />
          <FeatureCard icon={<IconMoney size={22} />} title="Donaciones por caso" body="Cada caso publicado puede recibir apoyo económico con trazabilidad completa." tint="accent" />
          <FeatureCard icon={<IconHeart size={22} />} title="Red de voluntarios" body="Conéctate con vecinos y voluntarios de tu zona para avistamientos, traslados y difusión." />
          <FeatureCard icon={<IconSpark size={22} />} title="Herramientas simples" body="Gestión de casos desde el celular. Nada de sistemas complicados." tint="ink" />
          <FeatureCard icon={<IconCheck size={22} />} title="Verificaciones básicas" body="Acompañamos el proceso para que el perfil aliado genere confianza sin fricción innecesaria." />
          <FeatureCard icon={<IconHeart size={22} />} title="Comunidad local" body="Colaboramos con otros aliados para empujar los casos más difíciles." tint="accent" />
        </div>
      </Section>

      <section id="postular" className="py-20 md:py-24">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="vc-eyebrow">Postular como aliado</span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">Cuéntanos qué hacen y dónde operan.</h2>
            <p className="mt-5 text-lg text-[var(--ink-soft)] leading-relaxed">
              Revisamos cada postulación con un proceso básico de verificación. Es la manera de construir una red en la que la gente confíe.
            </p>
            <ul className="mt-6 space-y-3 text-[var(--ink-soft)]">
              <li className="flex gap-2"><span className="text-[var(--accent)]"><IconCheck size={18} /></span>Sin costo mientras operemos en fase inicial.</li>
              <li className="flex gap-2"><span className="text-[var(--accent)]"><IconCheck size={18} /></span>Respondemos en días hábiles.</li>
              <li className="flex gap-2"><span className="text-[var(--accent)]"><IconCheck size={18} /></span>Al sumarte puedes publicar casos y recibir apoyo.</li>
            </ul>
          </div>
          <AllyForm kind="rescatistas" />
        </div>
      </section>

      <CTA seed={33} title="¿Eres veterinaria o tienes clínica?" subtitle="Tenemos un flujo específico de aliados para el sector veterinario." primaryHref="/veterinarias" primaryLabel="Ver para veterinarias" secondaryHref="/contacto?tema=rescate" secondaryLabel="Escribirnos" />
    </>
  );
}
