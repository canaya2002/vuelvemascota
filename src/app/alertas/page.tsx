import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { CTA } from "@/components/CTA";
import { IconBell, IconShield, IconSpark, IconHeart } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Alertas por zona — VuelveaCasa",
  description:
    "Activa alertas hiperlocales para saber al instante cuándo una mascota se pierde o se encuentra cerca de ti, sin spam.",
  alternates: { canonical: "/alertas" },
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Alertas hiperlocales"
        title={<>Tu colonia, tu <span className="text-[var(--brand)]">radar</span>.</>}
        subtitle="Define tu zona y recibe avisos inmediatos cuando una mascota se pierde o se encuentra cerca. Nada de ruido, solo lo que importa."
        imageSeed={21}
      />

      <Section eyebrow="Cómo funciona" title="Sin apps complicadas, sin spam">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard icon={<IconBell size={22} />} title="Elige tu radio" body="Tu colonia, tu código postal o un radio alrededor de tu casa." />
          <FeatureCard icon={<IconShield size={22} />} title="Solo lo verificado" body="Filtros básicos para evitar falsos positivos o duplicados." tint="accent" />
          <FeatureCard icon={<IconSpark size={22} />} title="Llega al canal que usas" body="Email, web y pronto WhatsApp. Tú decides el formato." />
          <FeatureCard icon={<IconHeart size={22} />} title="Puedes desuscribirte" body="Con un clic. Siempre. Sin letra chiquita." tint="ink" />
        </div>
      </Section>

      <section className="py-16 md:py-20 bg-[var(--bg-alt)]">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <span className="vc-eyebrow">Registro anticipado</span>
            <h2 className="mt-5 text-3xl md:text-4xl font-bold">Activamos zona por zona.</h2>
            <p className="mt-4 text-lg text-[var(--ink-soft)]">Te avisamos apenas tu colonia esté lista para recibir alertas en tiempo real.</p>
          </div>
          <div className="lg:col-span-3">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <CTA seed={26} />
    </>
  );
}
