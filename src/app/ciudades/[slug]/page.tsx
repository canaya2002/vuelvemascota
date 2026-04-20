import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { CTA } from "@/components/CTA";
import { ImageMosaic } from "@/components/ImageMosaic";
import { CITIES } from "@/lib/site";
import { IconSearch, IconBell, IconHeart, IconShield, IconArrow } from "@/components/Icons";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Mascotas perdidas y encontradas en ${city.name} | VuelveaCasa`,
    description: `Reporta mascotas perdidas, avistamientos y casos de rescate en ${city.name}, ${city.state}. Red comunitaria con alertas por zona y aliados locales.`,
    alternates: { canonical: `/ciudades/${city.slug}` },
    openGraph: {
      title: `Mascotas perdidas y encontradas en ${city.name}`,
      description: `Red comunitaria para mascotas en ${city.name}, ${city.state}.`,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return notFound();

  const idx = CITIES.findIndex((c) => c.slug === slug);

  const ldCity = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${city.name}, ${city.state}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: "MX",
    },
    url: `${SITE.url}/ciudades/${city.slug}`,
  };

  return (
    <>
      <Script id={`ld-city-${city.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldCity) }} />

      <PageHero
        eyebrow={`Ciudad · ${city.state}`}
        title={<><span className="text-[var(--brand)]">{city.name}</span>: red comunitaria para mascotas.</>}
        subtitle={`Reporta mascotas perdidas y encontradas en ${city.name}, recibe alertas por colonia y conecta con rescatistas y veterinarias aliadas de tu zona.`}
        imageSeed={idx + 10}
        primary={{ href: `/registro?rol=dueño`, label: `Sumarme en ${city.short}` }}
        secondary={{ href: "/donar", label: "Apoyar con donación" }}
      />

      <Section eyebrow={`¿Qué pasa en ${city.name}?`} title={`Una red local pensada para ${city.name}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard icon={<IconSearch size={22} />} title="Reportes con geolocalización" body={`Zonas y colonias de ${city.short} ya mapeadas para difusión eficiente.`} />
          <FeatureCard icon={<IconBell size={22} />} title="Alertas hiperlocales" body="Recibe solo lo de tu colonia o radio seleccionado. Sin ruido." tint="accent" />
          <FeatureCard icon={<IconHeart size={22} />} title="Hogar temporal local" body={`Red de resguardo en ${city.name} para mascotas en tránsito.`} />
          <FeatureCard icon={<IconShield size={22} />} title="Aliados locales" body="Rescatistas, refugios y veterinarias verificadas de tu ciudad." tint="ink" />
        </div>
      </Section>

      <section className="py-16 bg-[var(--bg-alt)]">
        <div className="vc-container">
          <h2 className="text-3xl md:text-4xl font-bold">Búsquedas comunes en {city.name}</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: `Perro perdido en ${city.name}`, href: "/perro-perdido" },
              { label: `Gato perdido en ${city.name}`, href: "/gato-perdido" },
              { label: `Encontré un perro en ${city.short}`, href: "/encontre-un-perro" },
              { label: `Encontré un gato en ${city.short}`, href: "/encontre-un-gato" },
              { label: `Rescate animal ${city.name}`, href: "/ayuda-rescate" },
              { label: `Veterinarias aliadas en ${city.name}`, href: "/veterinarias" },
              { label: `Hogar temporal en ${city.name}`, href: "/hogar-temporal" },
              { label: `Donar para rescates en ${city.name}`, href: "/donar" },
            ].map((l) => (
              <Link key={l.label} href={l.href} className="vc-card flex items-center justify-between">
                <span className="font-semibold">{l.label}</span>
                <span className="text-[var(--brand-ink)]"><IconArrow size={18} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section eyebrow="Comunidad" title={`Así se ve la comunidad en ${city.name}`}>
        <ImageMosaic count={6} offset={idx * 3} />
      </Section>

      <CTA seed={idx + 25} title={`¿Tu mascota se perdió en ${city.name}?`} subtitle="Publica tu caso y activa la red local. Es gratis y toma 2 minutos desde el celular." primaryHref="/registro?rol=dueño" primaryLabel={`Reportar en ${city.short}`} secondaryHref="/donar" secondaryLabel="Apoyar a la red" />
    </>
  );
}
