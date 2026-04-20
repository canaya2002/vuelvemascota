import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { CTA } from "@/components/CTA";
import { ImageMosaic } from "@/components/ImageMosaic";
import {
  IconSearch,
  IconBell,
  IconHeart,
  IconHome,
  IconShield,
  IconCheck,
  IconStethoscope,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Cómo funciona VuelveaCasa — Reportes, alertas y ayuda real",
  description:
    "Descubre cómo VuelveaCasa organiza reportes de mascotas perdidas, avistamientos, alertas por zona, hogar temporal y donaciones rastreables en México.",
  alternates: { canonical: "/como-funciona" },
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Cómo funciona"
        title={<>De la angustia a la acción, <span className="text-[var(--brand)]">en minutos</span>.</>}
        subtitle="VuelveaCasa no es solo un lugar para publicar. Es una red conectada de vecinos, rescatistas y veterinarias aliadas que se activan cuando algo pasa."
        imageSeed={5}
        primary={{ href: "/registro", label: "Registrarme gratis" }}
        secondary={{ href: "/casos-de-uso", label: "Ver casos de uso" }}
      />

      <Section eyebrow="Paso a paso" title="Así funciona para cualquier persona">
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <li key={s.t} className="vc-card flex flex-col">
              <span className="text-sm font-semibold text-[var(--brand)]">
                Paso {i + 1}
              </span>
              <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
              <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">{s.b}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        tone="alt"
        eyebrow="Funciones"
        title="Todo lo que puedes hacer en VuelveaCasa"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard icon={<IconSearch size={22} />} title="Reportes con ubicación" body="Zona de extravío, fotos y señas. Tu caso queda con ficha, seguimiento y difusión local." />
          <FeatureCard icon={<IconBell size={22} />} title="Alertas por zona" body="Avisos inmediatos en tu colonia o radio seleccionado. Nada de spam, solo lo cercano." tint="accent" />
          <FeatureCard icon={<IconHome size={22} />} title="Hogar temporal" body="Conecta con familias dispuestas a resguardar mientras aparece su familia o encuentra hogar." />
          <FeatureCard icon={<IconStethoscope size={22} />} title="Red veterinaria" body="Veterinarias aliadas reciben casos y apoyan con primera revisión, lector de chip y contención." tint="ink" />
          <FeatureCard icon={<IconHeart size={22} />} title="Donaciones por caso" body="Apoya económicamente a casos validados. Cada donación se documenta y concilia." tint="accent" />
          <FeatureCard icon={<IconShield size={22} />} title="Aliados verificados" body="Perfiles con validación básica para rescatistas, refugios y veterinarias." />
        </div>
      </Section>

      <section className="py-20 md:py-28">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="vc-eyebrow vc-eyebrow-accent">Diseñado para moverse rápido</span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">Menos fricción, más probabilidades de reencuentro.</h2>
            <p className="mt-5 text-lg text-[var(--ink-soft)] leading-relaxed">
              Cada funcionalidad existe porque responde a una realidad: cuando una mascota se pierde, las primeras 24 horas son críticas. Todo está pensado para que puedas actuar desde el celular, sin crear cuentas complicadas y sin depender de la suerte de que alguien vea un post.
            </p>
            <ul className="mt-6 space-y-3">
              {beneficios.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-1 text-[var(--accent)]"><IconCheck size={18} /></span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <ImageMosaic count={6} offset={10} />
        </div>
      </section>

      <CTA seed={11} />
    </>
  );
}

const steps = [
  { t: "Creas tu reporte", b: "Subes fotos, descripción, señas y última ubicación. Menos de 2 minutos desde el celular." },
  { t: "Se difunde en tu zona", b: "Activamos a la red local: vecinos, rescatistas y veterinarias aliadas del área." },
  { t: "Recibes pistas", b: "Avistamientos, fotos y llamadas entran al caso. Organizamos la información para que no se pierda." },
  { t: "Se coordina el reencuentro", b: "Traslados, hogar temporal, atención veterinaria y verificaciones, todo guiado." },
];

const beneficios = [
  "Actualización de caso en tiempo real, compartible por WhatsApp",
  "Canal directo con vecinos de tu zona que activen alertas",
  "Priorización de casos urgentes cuando hay riesgo médico",
  "Directorio público de veterinarias y refugios aliados",
  "Enlace corto por caso para volantes físicos y posts",
];
