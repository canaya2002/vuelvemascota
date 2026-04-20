import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { ContactForm } from "@/components/forms/ContactForm";
import { SITE } from "@/lib/site";
import { IconChat, IconShield, IconHeart } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Contacto — VuelveaCasa",
  description:
    "¿Necesitas ayuda, eres aliado o tienes una propuesta? Contáctanos. Respondemos en menos de 48h hábiles.",
  alternates: { canonical: "/contacto" },
};

type SearchParams = Promise<{ tema?: string }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { tema } = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title={<>Hablamos <span className="text-[var(--brand)]">contigo</span>.</>}
        subtitle="Soporte general, postulaciones de aliados, propuestas de marca, prensa o temas urgentes."
        imageSeed={24}
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <ContactForm defaultTema={tema} />
          </div>
          <div className="lg:col-span-2">
            <div className="vc-card bg-[var(--bg-alt)]">
              <span className="inline-flex w-10 h-10 rounded-full bg-[var(--brand)] text-white items-center justify-center">
                <IconChat size={20} />
              </span>
              <h3 className="mt-4 text-xl font-semibold">Canales directos</h3>
              <ul className="mt-3 space-y-3 text-[var(--ink-soft)]">
                <li>
                  <span className="block text-sm text-[var(--muted)]">General</span>
                  <a className="font-semibold text-[var(--ink)] hover:text-[var(--brand-ink)]" href={`mailto:${SITE.contact.email}`}>
                    {SITE.contact.email}
                  </a>
                </li>
                <li>
                  <span className="block text-sm text-[var(--muted)]">Soporte urgente</span>
                  <a className="font-semibold text-[var(--ink)] hover:text-[var(--brand-ink)]" href={`mailto:${SITE.contact.ayuda}`}>
                    {SITE.contact.ayuda}
                  </a>
                </li>
                <li>
                  <span className="block text-sm text-[var(--muted)]">Prensa y comunicación</span>
                  <a className="font-semibold text-[var(--ink)] hover:text-[var(--brand-ink)]" href={`mailto:${SITE.contact.prensa}`}>
                    {SITE.contact.prensa}
                  </a>
                </li>
              </ul>
            </div>

            <div className="vc-card mt-5">
              <span className="inline-flex w-10 h-10 rounded-full bg-[var(--accent)] text-white items-center justify-center">
                <IconShield size={20} />
              </span>
              <h3 className="mt-4 text-xl font-semibold">Emergencias</h3>
              <p className="mt-3 text-[var(--ink-soft)]">
                Si hay una emergencia veterinaria real, lo más importante es llevar a la mascota a una clínica de urgencia. VuelveaCasa es una red de apoyo, no un servicio médico.
              </p>
            </div>

            <div className="vc-card mt-5">
              <span className="inline-flex w-10 h-10 rounded-full bg-[#0b1f33] text-white items-center justify-center">
                <IconHeart size={20} />
              </span>
              <h3 className="mt-4 text-xl font-semibold">¿Prefieres ayudar?</h3>
              <p className="mt-3 text-[var(--ink-soft)]">
                Si no buscas soporte sino sumarte, puedes registrarte en segundos o apoyar con una donación.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
