import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { pickRange } from "@/lib/images";
import {
  IconHeart,
  IconCheck,
  IconArrow,
  IconShield,
  IconStethoscope,
  IconHome,
} from "@/components/Icons";
import { ShareButtons } from "@/components/ShareButtons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "¡Gracias por tu donación! — VuelveaCasa",
  description: "Gracias por apoyar a la red comunitaria VuelveaCasa.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/donar/gracias" },
};

const GRACIAS_IMGS = pickRange(44, 4);

export default function Page() {
  return (
    <>
      {/* Hero emocional con foto + halo de marca */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(900px 600px at 12% -5%, rgba(184,38,74,0.10), transparent 60%), radial-gradient(700px 500px at 88% 110%, rgba(21,122,85,0.08), transparent 55%)",
          }}
        />
        <div className="relative vc-container py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 vc-fade-up">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--success-soft)] text-[var(--success)] font-semibold text-xs uppercase tracking-[0.12em] border border-[color-mix(in_oklab,var(--success)_25%,transparent)]">
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[var(--success)]">
                <span className="absolute inset-0 rounded-full bg-[var(--success)] opacity-50 animate-ping" />
              </span>
              Donación confirmada
            </span>
            <h1 className="mt-6 text-[2.4rem] sm:text-5xl md:text-6xl lg:text-[4rem] font-semibold leading-[1.04] tracking-tight">
              Gracias.{" "}
              <span className="vc-gradient-text">De corazón.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[var(--ink-soft)] max-w-xl leading-relaxed">
              Tu donación se convierte en alimento, atención veterinaria,
              traslados y oxígeno para una red que opera todos los días en
              México. Acabas de empujar a esta comunidad un paso más cerca de
              cada mascota que está esperando volver a casa.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="/casos" className="vc-btn vc-btn-primary">
                Ver casos activos <IconArrow size={16} />
              </Link>
              <Link href="/" className="vc-btn vc-btn-outline">
                Volver al inicio
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-[var(--ink-soft)]">
              <IconHeart size={16} className="text-[var(--brand)]" />
              <span>Recibirás un correo con el resumen de tu apoyo.</span>
            </div>
          </div>

          {/* Foto principal con halo + thumb flotante */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-xl ring-1 ring-[var(--line)] vc-tilt">
              <Image
                src={GRACIAS_IMGS[0]}
                alt=""
                fill
                priority
                sizes="(max-width:1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
              />
              <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-xs font-semibold text-[var(--ink)]">
                <IconCheck size={14} className="text-[var(--success)]" />
                Apoyo aplicado al fondo común
              </div>
            </div>
            <div className="hidden md:block absolute -top-5 -left-5 w-[120px] h-[120px] rounded-full overflow-hidden ring-4 ring-white shadow-xl vc-float">
              <Image
                src={GRACIAS_IMGS[1]}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
            <div
              className="hidden md:block absolute -bottom-6 -right-6 w-[140px] h-[170px] rounded-3xl overflow-hidden ring-4 ring-white shadow-xl vc-float"
              style={{ animationDelay: "1.4s" }}
            >
              <Image
                src={GRACIAS_IMGS[2]}
                alt=""
                fill
                sizes="140px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* En qué se traduce concretamente */}
      <section className="py-20 md:py-24 bg-[var(--bg-alt)]">
        <div className="vc-container">
          <div className="max-w-2xl">
            <span className="vc-eyebrow vc-eyebrow-accent">
              En qué se traduce tu apoyo
            </span>
            <h2 className="mt-5 text-3xl md:text-4xl font-semibold leading-tight">
              Tu donación llega a los lugares correctos
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ImpactCard
              icon={<IconStethoscope size={20} />}
              title="Atención médica"
              body="Cirugías, hospitalización y revisión inicial para mascotas rescatadas."
            />
            <ImpactCard
              icon={<IconHome size={20} />}
              title="Hogar temporal"
              body="Alimento, arena y kits básicos para familias de resguardo."
            />
            <ImpactCard
              icon={<IconShield size={20} />}
              title="Rescatistas aliados"
              body="Apoyo a refugios y rescatistas verificados que operan diario."
            />
            <ImpactCard
              icon={<IconHeart size={20} />}
              title="Operación de la red"
              body="Servidores, alertas, moderación y coordinación logística."
            />
          </div>
        </div>
      </section>

      {/* Comparte + qué sigue */}
      <section className="py-20 md:py-24">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="vc-eyebrow">Comparte</span>
            <h2 className="mt-5 text-2xl md:text-3xl font-semibold leading-tight">
              Una invitación más vale por tres donaciones promedio
            </h2>
            <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">
              Si conoces a alguien que ame a las mascotas tanto como tú,
              compártele que VuelveaCasa existe. Ayudas más de lo que crees.
            </p>
            <div className="mt-6">
              <ShareButtons
                title="Apoya a las mascotas de México con VuelveaCasa"
                url={`${SITE.url}/donar`}
              />
            </div>
          </div>

          <div className="relative rounded-3xl border border-[var(--line)] bg-white p-7 md:p-9 shadow-sm">
            <h3 className="text-xl md:text-2xl font-semibold leading-snug">
              ¿Qué sigue?
            </h3>
            <ul className="mt-5 space-y-3.5">
              {[
                "Recibirás un correo con el resumen de tu apoyo en los próximos minutos.",
                "Publicamos reportes de transparencia mensuales con el destino de los fondos.",
                "Si donaste mensual, puedes pausar o cancelar desde tu correo cuando quieras.",
                "Si tienes preguntas, responde ese correo o escríbenos por contacto.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 text-[var(--success)] shrink-0">
                    <IconCheck size={16} />
                  </span>
                  <span className="text-[var(--ink-soft)] leading-relaxed">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/donar#transparencia" className="vc-btn vc-btn-outline text-sm">
                Ver transparencia
              </Link>
              <Link href="/contacto" className="vc-btn vc-btn-glass text-sm">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ImpactCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-[var(--line)] p-6 hover:border-[var(--line-strong)] hover:shadow-md transition-all">
      <span className="inline-flex w-11 h-11 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center group-hover:scale-105 transition-transform">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold text-[var(--ink)] leading-snug">
        {title}
      </h3>
      <p className="mt-2 text-sm text-[var(--ink-soft)] leading-relaxed">
        {body}
      </p>
    </div>
  );
}
