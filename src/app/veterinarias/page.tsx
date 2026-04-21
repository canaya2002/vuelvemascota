import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { AllyForm } from "@/components/forms/AllyForm";
import { CTA } from "@/components/CTA";
import { MapboxMap } from "@/components/MapboxMap";
import {
  IconStethoscope,
  IconShield,
  IconSpark,
  IconHeart,
  IconCheck,
  IconPin,
} from "@/components/Icons";
import { pickRange } from "@/lib/images";
import { SITE, CITIES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Veterinarias aliadas en México · Indexa tu clínica · VuelveaCasa",
  description:
    "Directorio de veterinarias aliadas verificadas en México. Indexa tu clínica en el mapa interactivo de VuelveaCasa tras validación, recibe casos de rescate y aparece ante la comunidad.",
  alternates: { canonical: "/veterinarias" },
  keywords: [
    "veterinarias México",
    "veterinaria aliada rescate",
    "directorio veterinarias CDMX",
    "mapa veterinarias Guadalajara",
    "indexar clínica veterinaria",
    "veterinaria 24 horas México",
    "veterinaria mascota encontrada",
  ],
};

// PageHero usa 34 y accents 34+23=57%47=10, 58%47=11.
// Reservamos 39..42 para el strip y 43..45 para decoración.
const VET_IMGS = pickRange(39, 4);
const FORM_IMGS = pickRange(43, 3);

/**
 * Demo pins — en producción vienen de aliadosRepo.listVerificados({tipo:'veterinarias'}).
 * Mantenemos un set de ejemplo para que el mapa nunca luzca vacío en dev.
 */
const DEMO_VETS = [
  {
    id: "demo-vet-1",
    nombre: "Hospital Veterinario Roma Norte",
    ciudad: "Ciudad de México",
    lat: 19.4142,
    lng: -99.1631,
    url: "#",
  },
  {
    id: "demo-vet-2",
    nombre: "Clínica Patitas Felices",
    ciudad: "Guadalajara",
    lat: 20.6712,
    lng: -103.3918,
    url: "#",
  },
  {
    id: "demo-vet-3",
    nombre: "Centro Veterinario San Pedro",
    ciudad: "Monterrey",
    lat: 25.6608,
    lng: -100.4022,
    url: "#",
  },
  {
    id: "demo-vet-4",
    nombre: "Hospital de Mascotas Cholula",
    ciudad: "Puebla",
    lat: 19.0636,
    lng: -98.3063,
    url: "#",
  },
  {
    id: "demo-vet-5",
    nombre: "Clínica Veterinaria del Norte",
    ciudad: "Querétaro",
    lat: 20.5931,
    lng: -100.3926,
    url: "#",
  },
  {
    id: "demo-vet-6",
    nombre: "Veterinaria Merida Centro",
    ciudad: "Mérida",
    lat: 20.9674,
    lng: -89.5926,
    url: "#",
  },
];

export default function Page() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Veterinarias",
        item: `${SITE.url}/veterinarias`,
      },
    ],
  };
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Directorio de veterinarias aliadas",
    numberOfItems: DEMO_VETS.length,
    itemListElement: DEMO_VETS.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "VeterinaryCare",
        name: v.nombre,
        address: { "@type": "PostalAddress", addressLocality: v.ciudad, addressCountry: "MX" },
        geo: { "@type": "GeoCoordinates", latitude: v.lat, longitude: v.lng },
      },
    })),
  };

  return (
    <>
      <Script
        id="ld-veterinarias"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, ld]) }}
      />
      <PageHero
        eyebrow="Veterinarias y aliados"
        title={
          <>
            Red de atención para mascotas que{" "}
            <span className="vc-gradient-text">lo necesitan</span>.
          </>
        }
        subtitle="Activamos clínicas y hospitales veterinarios como aliados. Reciben casos de rescate, aparecen en el mapa público y contribuyen a cerrar el ciclo de reencuentro o adopción."
        imageSeed={34}
        primary={{ href: "#indexar", label: "Indexar mi clínica" }}
        secondary={{ href: "#mapa", label: "Ver mapa de aliados" }}
      />

      {/* Mapa */}
      <section id="mapa" className="py-16 md:py-20 bg-white">
        <div className="vc-container">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
            <div>
              <span className="vc-eyebrow vc-eyebrow-accent">
                <IconPin size={14} /> Mapa interactivo
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold">
                Veterinarias aliadas cerca de ti
              </h2>
              <p className="mt-2 text-[var(--ink-soft)] max-w-xl">
                Arrastra, haz zoom y toca cada punto para ver la clínica. El
                mapa se irá poblando conforme más clínicas validen su ingreso.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--ink-soft)] px-3 py-1.5 rounded-full bg-[var(--bg-alt)] border border-[var(--line)]">
                <span className="w-2 h-2 rounded-full bg-[var(--brand)]" />{" "}
                Aliadas verificadas
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--ink-soft)] px-3 py-1.5 rounded-full bg-[var(--bg-alt)] border border-[var(--line)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />{" "}
                En validación
              </span>
            </div>
          </div>
          <MapboxMap
            pins={DEMO_VETS.map((v) => ({
              id: v.id,
              lat: v.lat,
              lng: v.lng,
              title: v.nombre,
              subtitle: v.ciudad,
              color: "#e11d48",
            }))}
            height="520px"
            center={[-99.1332, 19.4326]}
            zoom={5}
            fitBoundsToPins
          />
          <div className="mt-4 text-xs text-[var(--muted)]">
            Puntos mostrados con fines ilustrativos. Las clínicas verificadas
            aparecen con halo rosa; las que están en proceso, en verde.
          </div>
        </div>
      </section>

      <Section eyebrow="Beneficios" title="Qué ganas al ser aliada verificada">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={<IconStethoscope size={22} />}
            title="Directorio público + mapa"
            body="Apareces en el directorio y en el mapa interactivo de VuelveaCasa con foto, dirección y horarios."
          />
          <FeatureCard
            icon={<IconShield size={22} />}
            title="Casos aliados"
            body="Recibe avisos cuando llega una mascota sin dueño cerca. Primera atención coordinada con la red."
            tint="accent"
          />
          <FeatureCard
            icon={<IconSpark size={22} />}
            title="Comunidad activa"
            body="Colabora con rescatistas y voluntarios. Conviertes tu clínica en parte visible del cuidado animal local."
            tint="ink"
          />
          <FeatureCard
            icon={<IconHeart size={22} />}
            title="Posicionamiento local (SEO)"
            body="Aparición en páginas de ciudad, schema.org VeterinaryCare y menciones en contenidos."
          />
          <FeatureCard
            icon={<IconCheck size={22} />}
            title="Sin letras chiquitas"
            body="No hay costo de suscripción en fase inicial. Entras si cumples con estándares básicos de calidad."
          />
          <FeatureCard
            icon={<IconStethoscope size={22} />}
            title="Impacto medible"
            body="Compartimos reportes del impacto de la red en reencuentros, rescates y donaciones."
            tint="accent"
          />
        </div>
      </Section>

      <Section tone="alt" eyebrow="Flujo de validación" title="Cómo funciona la alta">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            {
              n: "01",
              t: "Nos envías tu solicitud",
              b: "Completas el formulario con datos de la clínica, ubicación y horarios.",
            },
            {
              n: "02",
              t: "Verificamos documentos",
              b: "Confirmamos cédula profesional, permisos y referencias.",
            },
            {
              n: "03",
              t: "Aprobamos e indexamos",
              b: "Aparece tu clínica en el mapa y el directorio público.",
            },
            {
              n: "04",
              t: "Empiezas a recibir casos",
              b: "La red comparte casos de rescate cercanos con tu clínica.",
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

      <section id="indexar" className="py-20 md:py-24 bg-white">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2">
            <span className="vc-eyebrow">Postular mi clínica</span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">
              Indexa tu clínica en el mapa.
            </h2>
            <p className="mt-5 text-lg text-[var(--ink-soft)] leading-relaxed">
              Revisamos tu información en 3-5 días hábiles. Mientras, tu
              solicitud queda como &ldquo;en validación&rdquo; y podrás ver tu
              clínica con halo verde.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Cédula profesional o RFC de clínica",
                "Dirección exacta y coordenadas (te ayudamos)",
                "Horarios y servicios de urgencia",
                "Un email y WhatsApp de contacto activos",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 text-[var(--accent)]">
                    <IconCheck size={16} />
                  </span>
                  <span className="text-[var(--ink)]">{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {VET_IMGS.slice(0, 3).map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/5] rounded-2xl overflow-hidden ring-1 ring-[var(--line)]"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width:1024px) 33vw, 120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="vc-card !p-6 md:!p-8">
              <AllyForm kind="veterinarias" />
            </div>
            <p className="mt-4 text-xs text-[var(--muted)]">
              Al enviar aceptas el aviso de privacidad. Nunca compartimos datos
              con terceros sin consentimiento.
            </p>
          </div>
        </div>
      </section>

      <Section eyebrow="Ciudades con cobertura" title="Empezamos por estas zonas">
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
        seed={44}
        title="¿Eres un hospital 24h o una clínica chica?"
        subtitle="Tenemos flujos para ambos. Nos adaptamos al tamaño y especialidad de tu clínica."
        primaryHref="#indexar"
        primaryLabel="Indexar mi clínica"
        secondaryHref="/contacto?tema=vet"
        secondaryLabel="Hablar con el equipo"
      />
      {/* Preload de imagen adicional para decoración — evita que queden seeds sin usar */}
      <div className="sr-only" aria-hidden>
        <Image
          src={FORM_IMGS[0]}
          alt=""
          width={1}
          height={1}
          unoptimized
        />
      </div>
    </>
  );
}
