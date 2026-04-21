import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { AllyForm } from "@/components/forms/AllyForm";
import { CTA } from "@/components/CTA";
import { PhotoMarquee } from "@/components/PhotoMarquee";
import {
  IconShield,
  IconMoney,
  IconHeart,
  IconSpark,
  IconCheck,
  IconPaw,
} from "@/components/Icons";
import { pickRange } from "@/lib/images";
import { SITE, CITIES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rescatistas y refugios en México — Tecnología para lo que ya haces",
  description:
    "Rescatistas, colectivos y refugios en México: publica casos, recibe apoyo económico trazable, coordina traslados y accede a una comunidad activa con VuelveaCasa.",
  alternates: { canonical: "/rescatistas" },
  keywords: [
    "rescatistas México",
    "refugios mascotas México",
    "red rescate animal CDMX",
    "plataforma rescatistas",
    "colectivos rescate mascotas",
    "ayuda refugio perros",
    "donaciones rescate transparente",
    "voluntariado mascotas México",
  ],
};

// Rango dedicado de 14 fotos únicas para que el carrusel (marquee) tenga
// suficiente contenido para que nunca se vea la misma foto dos veces en
// pantalla, incluso en monitores anchos. Evita seeds reservados:
// hero=30, accents=6,7 (30+23 mod 47), CTA=33.
const GALLERY = pickRange(8, 14); // 8..21 — 14 imágenes únicas

export default function Page() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Rescatistas",
        item: `${SITE.url}/rescatistas`,
      },
    ],
  };
  return (
    <>
      <Script
        id="ld-rescatistas"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <PageHero
        eyebrow="Rescatistas y refugios"
        title={
          <>
            Tecnología y red para lo que ya haces{" "}
            <span className="vc-gradient-text">todos los días</span>.
          </>
        }
        subtitle="VuelveaCasa nace con y para la comunidad de rescate en México. Queremos darles infraestructura, visibilidad y apoyo económico transparente."
        imageSeed={30}
        primary={{ href: "#postular", label: "Sumar mi operación" }}
        secondary={{ href: "#como-ayuda", label: "Ver cómo ayuda" }}
      />

      {/* Banda de fotos */}
      <section className="py-8 bg-white border-b border-[var(--line)]">
        <PhotoMarquee
          images={GALLERY}
          size="sm"
          rounded="2xl"
          label="Carrusel de rescates de la comunidad"
        />
      </section>

      {/* Qué incluye */}
      <Section
        id="como-ayuda"
        eyebrow="Qué incluye"
        title="Infraestructura sin costo para rescatistas verificados"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={<IconShield size={22} />}
            title="Perfil verificado"
            body="Aparece como aliado en el directorio y mapa. Los dueños y voluntarios te pueden encontrar y contactar directo."
          />
          <FeatureCard
            icon={<IconMoney size={22} />}
            title="Donaciones por caso"
            body="Cada caso publicado puede recibir apoyo económico con trazabilidad completa vía Stripe."
            tint="accent"
          />
          <FeatureCard
            icon={<IconHeart size={22} />}
            title="Red de voluntarios"
            body="Conéctate con vecinos y voluntarios de tu zona para avistamientos, traslados y difusión."
          />
          <FeatureCard
            icon={<IconSpark size={22} />}
            title="Herramientas simples"
            body="Gestión de casos desde el celular. Fotos, ubicación, actualizaciones. Sin sistemas complicados."
            tint="ink"
          />
          <FeatureCard
            icon={<IconCheck size={22} />}
            title="Verificaciones básicas"
            body="Acompañamos el proceso para que el perfil aliado genere confianza sin fricción innecesaria."
          />
          <FeatureCard
            icon={<IconHeart size={22} />}
            title="Comunidad local"
            body="Colaboramos con otras organizaciones y veterinarias aliadas para empujar los casos más difíciles."
            tint="accent"
          />
        </div>
      </Section>

      {/* Proceso */}
      <Section
        tone="alt"
        eyebrow="Cómo operamos contigo"
        title="Una red práctica, no burocrática"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            {
              n: "01",
              t: "Postulas tu operación",
              b: "Nos dices desde cuándo operan, cuántos casos manejan al mes, ciudades y referencias.",
            },
            {
              n: "02",
              t: "Verificamos básico",
              b: "Documentos simples + una llamada corta. No pedimos constitución legal ni RFC si no existen.",
            },
            {
              n: "03",
              t: "Aparecen públicamente",
              b: "Su perfil queda visible en el directorio, mapa y páginas de ciudad. Reciben casos cercanos.",
            },
            {
              n: "04",
              t: "Activan donaciones",
              b: "Sus casos pueden recibir apoyo con trazabilidad. Nosotros cuidamos del sistema de pagos.",
            },
          ].map((s) => (
            <div key={s.n} className="vc-card-glass">
              <span className="text-sm font-bold text-[var(--brand)] tracking-wider">
                {s.n}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-[var(--ink-soft)] text-sm leading-relaxed">
                {s.b}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Galería de apoyos + testimonios */}
      <Section
        eyebrow="Historias reales"
        title="Trabajo comunitario, impacto medible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <blockquote className="vc-card !p-6 lg:col-span-2">
            <p className="text-lg leading-relaxed text-[var(--ink)]">
              &ldquo;Por fin una herramienta hecha con rescatistas en mente. Los
              casos ya no se nos pierden en WhatsApp y la gente puede donar
              directo al caso que le movió.&rdquo;
            </p>
            <footer className="mt-5 flex items-center gap-3 text-sm text-[var(--ink-soft)]">
              <span className="w-10 h-10 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] inline-flex items-center justify-center">
                <IconPaw size={18} />
              </span>
              <span>
                <strong className="block text-[var(--ink)]">
                  Patitas en la Calle · CDMX
                </strong>
                Colectivo de rescate desde 2018
              </span>
            </footer>
          </blockquote>
          {GALLERY.slice(0, 3).map((src, i) => (
            <div
              key={i}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-[var(--line)] vc-tilt"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width:1024px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Formulario visible */}
      <section id="postular" className="py-20 md:py-24 bg-white">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2">
            <span className="vc-eyebrow">Postular como aliado</span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">
              Cuéntanos qué hacen y dónde operan.
            </h2>
            <p className="mt-5 text-lg text-[var(--ink-soft)] leading-relaxed">
              Revisamos cada postulación con un proceso básico de verificación.
              Es la manera de construir una red en la que la gente confíe.
            </p>
            <ul className="mt-6 space-y-3 text-[var(--ink)]">
              <li className="flex gap-2 items-start">
                <span className="mt-0.5 text-[var(--accent)]">
                  <IconCheck size={18} />
                </span>
                Sin costo mientras operemos en fase inicial.
              </li>
              <li className="flex gap-2 items-start">
                <span className="mt-0.5 text-[var(--accent)]">
                  <IconCheck size={18} />
                </span>
                Respondemos en días hábiles.
              </li>
              <li className="flex gap-2 items-start">
                <span className="mt-0.5 text-[var(--accent)]">
                  <IconCheck size={18} />
                </span>
                Al sumarte puedes publicar casos y recibir apoyo.
              </li>
              <li className="flex gap-2 items-start">
                <span className="mt-0.5 text-[var(--accent)]">
                  <IconCheck size={18} />
                </span>
                Perfil en mapa público y páginas de ciudad.
              </li>
            </ul>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {GALLERY.slice(3, 7).map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-[var(--line)]"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width:1024px) 50vw, 160px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="vc-card !p-6 md:!p-8">
              <AllyForm kind="rescatistas" />
            </div>
          </div>
        </div>
      </section>

      {/* Ciudades */}
      <Section eyebrow="Cobertura" title="Empezamos por estas ciudades">
        <div className="flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/ciudades/${c.slug}`}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-[var(--brand-soft)] border border-[var(--line)] text-sm !text-[var(--ink)] hover:!text-[var(--brand-ink)] transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </Section>

      <CTA
        seed={33}
        title="¿Eres veterinaria o tienes clínica?"
        subtitle="Tenemos un flujo específico para el sector veterinario, con mapa público y casos directos."
        primaryHref="/veterinarias"
        primaryLabel="Ver para veterinarias"
        secondaryHref="/contacto?tema=rescate"
        secondaryLabel="Escribirnos"
      />
    </>
  );
}
