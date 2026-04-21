import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { CTA } from "@/components/CTA";
import { PhotoMarquee } from "@/components/PhotoMarquee";
import {
  IconSearch,
  IconBell,
  IconHeart,
  IconHome,
  IconShield,
  IconCheck,
  IconStethoscope,
  IconArrow,
  IconPaw,
} from "@/components/Icons";
import { pickRange } from "@/lib/images";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cómo funciona VuelveaCasa — Guía paso a paso para reencontrar mascotas",
  description:
    "Guía detallada de cómo opera VuelveaCasa en México: reportes con geolocalización, alertas por zona, hogar temporal, donaciones rastreables y red de veterinarias aliadas. Cada paso explicado.",
  alternates: { canonical: "/como-funciona" },
  keywords: [
    "cómo funciona VuelveaCasa",
    "paso a paso mascota perdida México",
    "reportar mascota México",
    "alertas mascota colonia",
    "hogar temporal mascota cómo",
    "red rescate comunitaria México",
  ],
};

const HERO_IMGS = pickRange(10, 4); // 10..13 (imageSeed=5)
const FLOW_IMGS = pickRange(14, 4); // 14..17
const DETAIL_IMGS = pickRange(18, 6); // 18..23

export default function Page() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cómo funciona",
        item: `${SITE.url}/como-funciona`,
      },
    ],
  };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Cómo usar VuelveaCasa para reencontrar a tu mascota",
    inLanguage: "es-MX",
    totalTime: "PT3M",
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.t,
      text: s.b,
    })),
  };
  return (
    <>
      <Script
        id="ld-como-funciona"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, howTo]) }}
      />
      <PageHero
        eyebrow="Cómo funciona"
        title={
          <>
            De la angustia a la acción, <span className="vc-gradient-text">en minutos</span>.
          </>
        }
        subtitle="VuelveaCasa no es solo un lugar para publicar. Es una red conectada de vecinos, rescatistas y veterinarias aliadas que se activa cuando algo pasa."
        imageSeed={5}
        primary={{ href: "/registro", label: "Registrarme gratis" }}
        secondary={{ href: "/casos-de-uso", label: "Ver casos de uso" }}
      />

      {/* Carrusel emocional */}
      <section className="py-8 bg-white border-b border-[var(--line)]">
        <PhotoMarquee
          images={[...HERO_IMGS, ...FLOW_IMGS]}
          size="sm"
          rounded="2xl"
          label="Historias que nos mueven"
        />
      </section>

      {/* Pasos grandes con foto */}
      <Section
        eyebrow="4 pasos"
        title="Así funciona para cualquier persona"
        subtitle="Cada paso está pensado para que puedas actuar desde el celular, sin crear cuentas complicadas y sin depender de que un post se viralice."
      >
        <ol className="space-y-8">
          {steps.map((s, i) => {
            const flipped = i % 2 === 1;
            return (
              <li
                key={s.t}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                  flipped ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="lg:col-span-5">
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden ring-1 ring-[var(--line)] shadow-sm vc-tilt">
                    <Image
                      src={FLOW_IMGS[i]}
                      alt=""
                      fill
                      sizes="(max-width:1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <span className="absolute top-4 left-4 vc-glass-strong !text-[var(--ink)] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                      Paso {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <h3 className="text-2xl md:text-4xl font-bold">{s.t}</h3>
                  <p className="mt-4 text-[var(--ink-soft)] text-lg leading-relaxed">
                    {s.b}
                  </p>
                  <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {s.details.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-2 text-sm text-[var(--ink)]"
                      >
                        <span className="mt-0.5 text-[var(--accent)]">
                          <IconCheck size={16} />
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link
                      href={s.href}
                      className="vc-btn vc-btn-primary text-sm !py-2.5 !px-4"
                    >
                      {s.cta} <IconArrow size={14} />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      {/* Funciones */}
      <Section
        tone="alt"
        eyebrow="Funciones"
        title="Todo lo que puedes hacer en VuelveaCasa"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={<IconSearch size={22} />}
            title="Reportes con ubicación"
            body="Zona de extravío, fotos y señas. Tu caso queda con ficha, seguimiento y difusión local automatizada."
          />
          <FeatureCard
            icon={<IconBell size={22} />}
            title="Alertas por zona"
            body="Avisos inmediatos en tu colonia o radio seleccionado. Nada de spam, solo lo cercano a ti."
            tint="accent"
          />
          <FeatureCard
            icon={<IconHome size={22} />}
            title="Hogar temporal"
            body="Conecta con familias dispuestas a resguardar mientras aparece su familia o encuentra hogar definitivo."
          />
          <FeatureCard
            icon={<IconStethoscope size={22} />}
            title="Red veterinaria"
            body="Veterinarias aliadas reciben casos y apoyan con primera revisión, lector de chip y contención."
            tint="ink"
          />
          <FeatureCard
            icon={<IconHeart size={22} />}
            title="Donaciones por caso"
            body="Apoya económicamente a casos validados. Cada donación se documenta y concilia con Stripe."
            tint="accent"
          />
          <FeatureCard
            icon={<IconShield size={22} />}
            title="Aliados verificados"
            body="Perfiles con validación básica para rescatistas, refugios y veterinarias. Se ven en el mapa."
          />
        </div>
      </Section>

      {/* Bloque detallado mosaico */}
      <section className="py-20 md:py-28">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="vc-eyebrow vc-eyebrow-accent">
              Diseñado para moverse rápido
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">
              Menos fricción, más probabilidades de reencuentro.
            </h2>
            <p className="mt-5 text-lg text-[var(--ink-soft)] leading-relaxed">
              Cada funcionalidad existe porque responde a una realidad: cuando
              una mascota se pierde, las primeras 24 horas son críticas. Todo
              está pensado para que puedas actuar desde el celular, sin crear
              cuentas complicadas y sin depender de la suerte de que alguien vea
              un post.
            </p>
            <ul className="mt-6 space-y-3">
              {beneficios.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-1 text-[var(--accent)]">
                    <IconCheck size={18} />
                  </span>
                  <span className="text-[var(--ink)]">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link href="/registro" className="vc-btn vc-btn-primary">
                Crear mi cuenta gratis <IconArrow size={16} />
              </Link>
              <Link href="/reportar-mascota" className="vc-btn vc-btn-outline">
                Publicar un caso
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DETAIL_IMGS.map((src, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl ring-1 ring-[var(--line)] ${
                  i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width:1024px) 33vw, 16vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline "primeras 24h" */}
      <Section
        tone="alt"
        eyebrow="Las primeras 24 horas"
        title="La ventana crítica: cómo te acompañamos minuto a minuto"
        subtitle="Los estudios muestran que el 60% de los reencuentros ocurren en las primeras 24 horas. Así es el flujo ideal."
      >
        <ol className="relative border-l-2 border-[var(--brand-soft)] ml-4 space-y-8">
          {[
            {
              t: "0 – 15 min",
              h: "Creas el caso y respiras",
              b: "Con 3 fotos claras, señas y ubicación. Te enviamos email de confirmación con enlace corto para WhatsApp.",
            },
            {
              t: "15 – 60 min",
              h: "Red local activa",
              b: "Vecinos registrados, rescatistas y veterinarias aliadas de tu zona reciben la alerta por email y push.",
            },
            {
              t: "1 – 6 horas",
              h: "Primeros avistamientos",
              b: "Las pistas entran al caso. Cada avistamiento aparece en el mapa para que puedas ir al lugar rápido.",
            },
            {
              t: "6 – 24 horas",
              h: "Expansión por colonias cercanas",
              b: "Si no aparece, la alerta se extiende a un radio mayor. Compartimos en ciudades aliadas si es perro viajero.",
            },
          ].map((s, i) => (
            <li key={i} className="pl-6 relative">
              <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-[var(--brand)] ring-4 ring-[var(--brand-soft)]" />
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-ink)]">
                {s.t}
              </p>
              <h3 className="mt-1 text-xl font-semibold">{s.h}</h3>
              <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">
                {s.b}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Métricas de impacto */}
      <Section eyebrow="Impacto medible" title="Números que nos mueven a seguir">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { big: "60%", small: "reencuentros en las primeras 24 h (meta)" },
            { big: "3 km", small: "radio promedio de alerta" },
            { big: "2 min", small: "para publicar un caso desde el celular" },
            { big: "10+", small: "ciudades MX con cobertura activa" },
          ].map((m) => (
            <div
              key={m.big}
              className="vc-card-glass text-center !p-5"
            >
              <p className="text-3xl md:text-4xl font-bold vc-gradient-text inline-block">
                {m.big}
              </p>
              <p className="mt-2 text-sm text-[var(--ink-soft)] leading-snug">
                {m.small}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Comparativa rápida */}
      <Section
        tone="alt"
        eyebrow="Por qué no solo Facebook / WhatsApp"
        title="Aquí vs. un post perdido en un grupo"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-[var(--line)]">
                <th className="py-3 px-4 text-[var(--muted)] font-semibold">
                  Característica
                </th>
                <th className="py-3 px-4 text-[var(--brand-ink)] font-bold">
                  VuelveaCasa
                </th>
                <th className="py-3 px-4 text-[var(--muted)] font-semibold">
                  Post en grupo
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Ficha estructurada", "Sí · geolocalizada", "No, texto suelto"],
                ["Alertas a vecinos por zona", "Automático", "Depende de quién vea"],
                ["Matching perdidas ↔ encontradas", "Sí, automático", "Manual"],
                ["Historial del caso", "Timeline completo", "Se pierde en el feed"],
                ["Veterinarias aliadas avisadas", "Sí", "No"],
                ["Donaciones trazables", "Stripe + reportes", "Venmo/PayPal sin trazabilidad"],
                ["Enlace compartible con foto", "Sí, corto", "Sí, pero se pierde"],
              ].map((row, i) => (
                <tr key={i} className="border-b border-[var(--line)]/60">
                  <td className="py-3 px-4 text-[var(--ink-soft)]">{row[0]}</td>
                  <td className="py-3 px-4 text-[var(--ink)] font-semibold">
                    {row[1]}
                  </td>
                  <td className="py-3 px-4 text-[var(--muted)]">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ corta */}
      <Section eyebrow="Preguntas frecuentes" title="Dudas comunes antes de empezar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {miniFaq.map((q) => (
            <div key={q.q} className="vc-card !p-5">
              <h3 className="text-base font-semibold flex gap-2 items-start">
                <span className="text-[var(--brand)]">
                  <IconPaw size={18} />
                </span>
                {q.q}
              </h3>
              <p className="mt-2 text-sm text-[var(--ink-soft)] leading-relaxed">
                {q.a}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/faq" className="vc-btn vc-btn-outline">
            Ver todas las preguntas
          </Link>
        </div>
      </Section>

      <CTA
        seed={24}
        title="Listos para acompañarte en el caso que más te importa."
        subtitle="Empieza gratis. Si tu mascota se pierde mañana, agradecerás tener la red ya activa."
      />
    </>
  );
}

const steps = [
  {
    t: "Creas tu reporte en minutos",
    b: "Subes fotos, descripción, señas y última ubicación. Menos de 2 minutos desde el celular, sin apps.",
    details: [
      "Geolocalización automática del punto de extravío",
      "Hasta 6 fotos con compresión inteligente",
      "Enlace corto para compartir por WhatsApp",
      "Tu caso queda buscable en el mapa público",
    ],
    href: "/reportar-mascota",
    cta: "Reportar ahora",
  },
  {
    t: "Se difunde en tu zona",
    b: "Activamos a la red local: vecinos registrados, rescatistas y veterinarias aliadas del área reciben el caso por email y push.",
    details: [
      "Radio configurable de 1 a 10 km",
      "Notificación a aliados verificados",
      "Compartición fluida en redes sociales",
      "Priorización de casos urgentes",
    ],
    href: "/alertas",
    cta: "Ver alertas",
  },
  {
    t: "Recibes pistas organizadas",
    b: "Avistamientos, fotos y llamadas entran al caso. Cada pista queda documentada con fecha, ubicación y autor.",
    details: [
      "Ficha pública con timeline",
      "Moderación de avistamientos",
      "Matching con casos encontrados",
      "Mapa con todos los avistamientos",
    ],
    href: "/casos",
    cta: "Explorar casos",
  },
  {
    t: "Se coordina el reencuentro",
    b: "Traslados, hogar temporal, atención veterinaria y verificaciones, todo guiado por la plataforma y la comunidad.",
    details: [
      "Conexión con veterinarias aliadas",
      "Hogar temporal activado si se requiere",
      "Soporte directo del equipo ante dudas",
      "Reportamos cuando el caso se resuelve",
    ],
    href: "/hogar-temporal",
    cta: "Ver hogar temporal",
  },
];

const beneficios = [
  "Actualización de caso en tiempo real, compartible por WhatsApp",
  "Canal directo con vecinos de tu zona que activen alertas",
  "Priorización de casos urgentes cuando hay riesgo médico",
  "Directorio público de veterinarias y refugios aliados",
  "Enlace corto por caso para volantes físicos y posts",
  "Reportes de transparencia sobre donaciones",
];

const miniFaq = [
  {
    q: "¿Es realmente gratis publicar un caso?",
    a: "Sí, 100% gratis. Sin anuncios invasivos ni costos ocultos. Las donaciones son opcionales y apoyan la infraestructura.",
  },
  {
    q: "¿Mi dirección exacta se muestra?",
    a: "No. Guardamos el punto con precisión, pero solo se muestra la colonia o zona amplia para proteger tu privacidad.",
  },
  {
    q: "¿Qué pasa si no estoy en una de las ciudades cubiertas?",
    a: "Puedes publicar igual: tu caso queda en la red nacional. Te avisamos cuando activemos alertas en tu zona.",
  },
  {
    q: "¿Las veterinarias aliadas cobran por recibir casos?",
    a: "No. Las clínicas aliadas se suman voluntariamente y ofrecen primera atención coordinada sin que sea un cobro por venir aquí.",
  },
];
