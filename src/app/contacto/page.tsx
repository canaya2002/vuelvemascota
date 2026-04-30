import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { ContactForm } from "@/components/forms/ContactForm";
import {
  IconChat,
  IconShield,
  IconHeart,
  IconBell,
  IconArrow,
} from "@/components/Icons";

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
        title={
          <>
            Hablamos <span className="text-[var(--brand)]">contigo</span>.
          </>
        }
        subtitle="Soporte general, postulaciones de aliados, propuestas de marca, prensa o temas urgentes."
        imageSeed={24}
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <ContactForm defaultTema={tema} />
          </div>

          <aside className="lg:col-span-2 space-y-5">
            {/* Tiempo de respuesta — destacado primero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--ink)] to-[#1a2640] text-white p-7 shadow-lg">
              <div
                aria-hidden
                className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[var(--brand)]/30 blur-3xl"
              />
              <div className="relative">
                <span className="inline-flex w-11 h-11 rounded-2xl bg-white/12 border border-white/20 items-center justify-center backdrop-blur-md">
                  <IconChat size={20} />
                </span>
                <h3 className="mt-5 text-xl font-semibold">
                  Respondemos en menos de 48 h
                </h3>
                <p className="mt-3 text-sm text-white/80 leading-relaxed">
                  Llena el formulario eligiendo el tema. Atendemos primero
                  asuntos urgentes —rescate, ARCO de privacidad o seguridad de
                  la comunidad—.
                </p>
                <div className="mt-5 flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                    Equipo activo · México
                  </span>
                </div>
              </div>
            </div>

            <ContactCard
              icon={<IconShield size={18} />}
              title="¿Es una emergencia veterinaria?"
              tone="warn"
              body="Acude a una clínica veterinaria de urgencia primero. VuelveaCasa es una red de apoyo, no un servicio médico."
            />

            <ContactCard
              icon={<IconBell size={18} />}
              title="Reporte de privacidad (ARCO)"
              body="Para acceso, rectificación, cancelación u oposición de tus datos, indica el tema «privacidad» en el formulario."
              cta={{ href: "/privacidad", label: "Ver aviso de privacidad" }}
            />

            <ContactCard
              icon={<IconHeart size={18} />}
              title="¿Prefieres ayudar?"
              tone="accent"
              body="Si no buscas soporte sino sumarte, puedes registrarte en segundos o apoyar con una donación."
              cta={{ href: "/donar", label: "Apoyar con una donación" }}
            />
          </aside>
        </div>
      </Section>
    </>
  );
}

function ContactCard({
  icon,
  title,
  body,
  tone = "neutral",
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone?: "neutral" | "accent" | "warn";
  cta?: { href: string; label: string };
}) {
  const iconStyle =
    tone === "accent"
      ? "bg-[var(--brand-soft)] text-[var(--brand-ink)] border-transparent"
      : tone === "warn"
      ? "bg-[var(--warn-soft)] text-[var(--warn)] border-transparent"
      : "bg-white text-[var(--ink)] border-[var(--line)]";

  return (
    <div className="rounded-3xl border border-[var(--line)] bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-md hover:border-[var(--line-strong)] transition-all">
      <div className="flex items-start gap-4">
        <span
          className={`shrink-0 inline-flex w-10 h-10 rounded-2xl items-center justify-center border ${iconStyle}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[var(--ink)] leading-snug">
            {title}
          </h3>
          <p className="mt-2 text-sm text-[var(--ink-soft)] leading-relaxed">
            {body}
          </p>
          {cta && (
            <Link
              href={cta.href}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-ink)] hover:text-[var(--brand)] transition-colors"
            >
              {cta.label} <IconArrow size={13} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
