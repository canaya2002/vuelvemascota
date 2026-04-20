import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTA } from "@/components/CTA";
import { DonationWidget } from "@/components/DonationWidget";
import { FeatureCard } from "@/components/FeatureCard";
import {
  IconHeart,
  IconShield,
  IconMoney,
  IconStethoscope,
  IconHome,
  IconCheck,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Donar a VuelveaCasa — Apoya rescates y mascotas en riesgo en México",
  description:
    "Dona para apoyar casos verificados de mascotas en riesgo: veterinaria, alimento, transporte, rescate. Pago seguro con Stripe. Transparente, rastreable y 100% México.",
  alternates: { canonical: "/donar" },
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Donar · Apoyar"
        title={<>Cada donación se convierte en <span className="text-[var(--brand)]">ayuda real</span>.</>}
        subtitle="Apoyas veterinaria de emergencia, alimento, traslados y rescate de mascotas en riesgo. Transparente y rastreable desde el primer peso."
        imageSeed={16}
      />

      <section className="py-16 md:py-20">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <span className="vc-eyebrow vc-eyebrow-accent">Cómo se usa tu donación</span>
            <h2 className="mt-5 text-3xl md:text-4xl font-bold">
              Tu apoyo activa la red cuando más urge.
            </h2>
            <p className="mt-4 text-lg text-[var(--ink-soft)] leading-relaxed">
              Puedes elegir un destino específico o donar al fondo comunitario, que se asigna a los casos más críticos.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard icon={<IconStethoscope size={22} />} title="Veterinaria de emergencia" body="Cirugías, hospitalización y atención urgente para casos de rescate." />
              <FeatureCard icon={<IconHome size={22} />} title="Hogar temporal y alimento" body="Apoyo a familias de resguardo con alimento y kits básicos." tint="accent" />
              <FeatureCard icon={<IconShield size={22} />} title="Rescatistas aliados" body="Recursos para rescatistas y refugios verificados que operan todos los días." tint="ink" />
              <FeatureCard icon={<IconMoney size={22} />} title="Operación y logística" body="Traslados, capturas seguras y sostenimiento de la plataforma." />
            </div>

            <h3 id="transparencia" className="mt-14 text-2xl font-semibold">
              Transparencia
            </h3>
            <ul className="mt-4 space-y-3">
              {trans.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 text-[var(--accent)]"><IconCheck size={18} /></span>
                  <span className="text-[var(--ink-soft)]">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <DonationWidget />
            </div>
          </div>
        </div>
      </section>

      <Section
        tone="alt"
        eyebrow="Formas de apoyar"
        title="No solo es dinero"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard icon={<IconHeart size={22} />} title="Difunde casos" body="Compartir un caso en tu red puede ser la diferencia entre que aparezca o no." />
          <FeatureCard icon={<IconHome size={22} />} title="Ofrece resguardo" body="Un hogar temporal puede salvar vidas mientras se encuentra dueño o adoptante." tint="accent" />
          <FeatureCard icon={<IconShield size={22} />} title="Únete como aliado" body="Si representas una marca u organización, tenemos formatos de alianza." tint="ink" />
        </div>
      </Section>

      <CTA
        seed={22}
        title="¿Tu empresa quiere activar una alianza?"
        subtitle="Tenemos formatos de patrocinio transparentes con impacto medible y local."
        primaryHref="/contacto?tema=aliados"
        primaryLabel="Proponer alianza"
        secondaryHref="/rescatistas"
        secondaryLabel="Ver red de rescatistas"
      />
    </>
  );
}

const trans = [
  "Cada donación se procesa con Stripe — no guardamos datos de tu tarjeta.",
  "Publicamos reportes periódicos con el destino de los fondos.",
  "Los casos verificados pasan un proceso básico de validación con aliados.",
  "Puedes cancelar donaciones recurrentes cuando quieras, desde tu correo.",
  "Al principio operamos con fondos acotados; ampliamos cobertura conforme crece la comunidad.",
];
