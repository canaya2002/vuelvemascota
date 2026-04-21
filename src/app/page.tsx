import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Script from "next/script";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { ImageMosaic } from "@/components/ImageMosaic";
import {
  IconPaw,
  IconSearch,
  IconBell,
  IconHeart,
  IconHome,
  IconShield,
  IconCheck,
  IconArrow,
  IconStethoscope,
  IconMoney,
} from "@/components/Icons";
import { pickRange } from "@/lib/images";
import { CITIES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — Mascotas perdidas en México · Reporta, encuentra y ayuda`,
  description:
    "La red comunitaria #1 de México para reportar mascotas perdidas, avistar mascotas encontradas, activar alertas por zona, ofrecer hogar temporal y donar a rescates verificados. CDMX, Guadalajara, Monterrey y más.",
  alternates: { canonical: "/" },
  keywords: [
    "mascotas perdidas México",
    "perro perdido CDMX",
    "gato perdido Guadalajara",
    "reportar mascota perdida",
    "mascota encontrada",
    "rescate animal México",
    "hogar temporal mascota",
    "donar rescate animal",
    "alertas mascotas colonia",
    "buscar perro perdido",
    "VuelveaCasa",
    "vuelvecasa.com",
  ],
  openGraph: {
    title: `${SITE.name} — Reporta, encuentra y ayuda a mascotas en México`,
    description:
      "Plataforma mexicana para reportar mascotas perdidas, activar alertas por zona y apoyar rescates verificados.",
    url: SITE.url,
    type: "website",
    locale: "es_MX",
  },
};

const faqHome = [
  {
    q: "¿Cómo funciona VuelveaCasa si acabo de perder a mi mascota?",
    a: "Creas un reporte gratis con fotos, zona de extravío y señas en menos de 2 minutos. Enviamos alertas inmediatas a personas cercanas, vecinos registrados, rescatistas aliados y veterinarias de tu área. Todo queda organizado en un caso compartible por WhatsApp.",
  },
  {
    q: "¿Es gratis publicar un caso?",
    a: "Sí, siempre. Reportar, recibir alertas y ofrecer hogar temporal es 100% gratuito. Las donaciones son opcionales y se muestran de forma transparente por caso o al fondo comunitario.",
  },
  {
    q: "¿Por qué no usar solo Facebook o WhatsApp?",
    a: "Porque un post se pierde en minutos. Aquí cada caso tiene ficha con geolocalización, seguimiento, verificaciones y una red de aliados locales. Reducimos el ruido y aumentamos las probabilidades reales de reencuentro.",
  },
  {
    q: "¿Cómo aseguran que las donaciones llegan a quien las necesita?",
    a: "Los casos verificados pasan una validación básica con rescatistas o veterinarias aliadas. Cada donación muestra su destino y se concilia con Stripe. Transparencia total desde el primer peso.",
  },
  {
    q: "¿En qué ciudades están activos?",
    a: "Arrancamos en CDMX, Guadalajara, Monterrey, Puebla, Querétaro, Mérida, Tijuana, León, Toluca y Cancún, y seguimos sumando. Puedes registrarte y te avisamos cuando tu zona se active.",
  },
  {
    q: "¿Qué tan rápido llegan las alertas a mi zona?",
    a: "En tiempo real. Cuando creas un caso, todas las personas con alerta activa en tu radio reciben notificación por correo o push en segundos. También rescatistas y veterinarias aliadas de tu ciudad.",
  },
];

// Rangos de imágenes — cada sección usa un bloque NO SOLAPADO de la galería.
const AUDIENCE_IMGS = pickRange(0, 6); // 0..5
const TRUST_IMGS = pickRange(6, 3); // 6..8
const MOSAIC_IMGS = pickRange(9, 6); // 9..14
const DONATION_IMGS = pickRange(15, 4); // 15..18

export default function Page() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqHome.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Reporte y búsqueda de mascotas perdidas en México",
    provider: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    areaServed: { "@type": "Country", name: "Mexico" },
    serviceType: "Reporte de mascotas perdidas, alertas por zona, hogar temporal y donaciones",
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: SITE.url,
      availableLanguage: "es-MX",
    },
  };

  return (
    <>
      <Hero />

      {/* Structured data: FAQ + Service */}
      <Script
        id="ld-faq-home"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="ld-service-home"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      {/* Value prop strip */}
      <section className="py-12 border-b border-[var(--line)] bg-white">
        <div className="vc-container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Stat big="Gratis" small="Publicar y recibir alertas" />
          <Stat big="100% MX" small="Enfocado en México" />
          <Stat big="24/7" small="Alertas en tu zona" />
          <Stat big="Verificado" small="Aliados reales" />
        </div>
      </section>

      {/* What you can do */}
      <Section
        eyebrow="Qué puedes hacer hoy"
        title="Una plataforma para actuar rápido cuando más importa"
        subtitle="No es solo un post. Es una red de vecinos, rescatistas y veterinarias conectados para encontrar, resguardar y apoyar."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={<IconSearch size={22} />}
            title="Reporta una mascota perdida"
            body="Crea una ficha con fotos, señas y última ubicación. Se convierte en un caso compartible y rastreable, con actualizaciones en tiempo real."
          />
          <FeatureCard
            icon={<IconPaw size={22} />}
            title="Reporta una mascota encontrada"
            body="¿La rescataste o la viste? Súbela en segundos con ubicación y foto. La conectamos con personas que la están buscando cerca."
          />
          <FeatureCard
            icon={<IconBell size={22} />}
            title="Activa alertas por zona"
            body="Define tu colonia o radio y recibe avisos inmediatos cuando una mascota se pierde o aparece cerca de ti."
            tint="accent"
          />
          <FeatureCard
            icon={<IconHome size={22} />}
            title="Pide u ofrece hogar temporal"
            body="Si no puede quedarse en casa, conéctate con la red de resguardo mientras aparece su familia o encuentra un hogar definitivo."
          />
          <FeatureCard
            icon={<IconHeart size={22} />}
            title="Dona a casos reales"
            body="Apoya veterinaria, alimento, transporte o rescate para casos validados. Cada peso queda documentado y rastreable."
            tint="accent"
          />
          <FeatureCard
            icon={<IconShield size={22} />}
            title="Activa tu red de aliados"
            body="Veterinarias, rescatistas y refugios verificados pueden colaborar en casos, publicar y recibir apoyo comunitario."
            tint="ink"
          />
        </div>
      </Section>

      {/* How it works */}
      <Section
        tone="alt"
        eyebrow="Cómo funciona"
        title="De reporte a reencuentro, sin fricción"
        subtitle="Pensado para que una persona común pueda actuar en minutos, desde el celular, sin trabas."
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              n: "01",
              t: "Creas el caso",
              b: "Subes fotos, descripción y zona de extravío o hallazgo. Tardas menos de 2 minutos desde el celular.",
            },
            {
              n: "02",
              t: "Se activa tu zona",
              b: "La red local recibe la alerta: vecinos, rescatistas y veterinarias aliadas de la colonia.",
            },
            {
              n: "03",
              t: "Llegan pistas",
              b: "Avistamientos, llamadas y fotos entran al caso. Todo queda organizado y verificable.",
            },
            {
              n: "04",
              t: "Vuelve a casa",
              b: "Se coordinan entregas, traslados, hogar temporal o atención veterinaria si es necesario.",
            },
          ].map((s) => (
            <div key={s.n} className="vc-card-glass">
              <span className="text-sm font-bold text-[var(--brand)] tracking-wider">
                {s.n}
              </span>
              <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
              <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">
                {s.b}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <ImageMosaicStatic
            images={MOSAIC_IMGS}
            caption="Historias reales que nos mueven todos los días."
          />
        </div>
      </Section>

      {/* Public blocks */}
      <Section
        eyebrow="Para quién es"
        title="Una red pensada para todos los lados de la historia"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AudienceCard
            img={AUDIENCE_IMGS[0]}
            title="Dueños que perdieron a su mascota"
            body="Actúas rápido, sin depender de que un post se viralice. Tu caso es visible, actualizable y compartible."
            href="/para-quien-es#dueños"
          />
          <AudienceCard
            img={AUDIENCE_IMGS[1]}
            title="Personas que encontraron una mascota"
            body="La subes y te conectamos con quien la busca. También puedes activar hogar temporal mientras aparece su familia."
            href="/para-quien-es#rescataste"
          />
          <AudienceCard
            img={AUDIENCE_IMGS[2]}
            title="Quienes quieren ayudar"
            body="Sumas tu colonia a las alertas, ofreces resguardo, difundes o donas a casos verificados. Poco es mucho."
            href="/para-quien-es#ayudar"
          />
          <AudienceCard
            img={AUDIENCE_IMGS[3]}
            title="Rescatistas y refugios"
            body="Publica casos, recibe apoyo económico, coordina traslados y accede a una red activa de voluntarios."
            href="/rescatistas"
          />
          <AudienceCard
            img={AUDIENCE_IMGS[4]}
            title="Veterinarias y clínicas"
            body="Recibe avisos cuando llega una mascota sin dueño. Aparece en el directorio de aliados verificados."
            href="/veterinarias"
          />
          <AudienceCard
            img={AUDIENCE_IMGS[5]}
            title="Aliados y patrocinadores"
            body="Suma tu marca o comunidad a un impacto medible y local. Formatos de alianza transparentes."
            href="/contacto?tema=aliados"
          />
        </div>
      </Section>

      {/* Trust & transparency */}
      <Section
        tone="alt"
        eyebrow="Confianza y transparencia"
        title="Cada caso cuenta. Cada peso también."
        subtitle="Nos importa tanto reencontrar a una mascota como construir una plataforma en la que puedas confiar."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<IconShield size={22} />}
            title="Aliados verificados"
            body="Rescatistas, refugios y veterinarias pasan un proceso básico de validación antes de aparecer como aliados."
          />
          <FeatureCard
            icon={<IconMoney size={22} />}
            title="Donaciones rastreables"
            body="Las donaciones se procesan con Stripe y muestran su destino por caso. Publicamos reportes periódicos."
            tint="accent"
          />
          <FeatureCard
            icon={<IconStethoscope size={22} />}
            title="Red de atención"
            body="Veterinarias aliadas reciben casos cuando hay urgencias médicas o animales sin identificación."
            tint="ink"
          />
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRUST_IMGS.map((src, i) => (
            <div
              key={i}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-[var(--line)]"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Donations block */}
      <section className="py-20 md:py-28">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="vc-eyebrow vc-eyebrow-accent">
              <IconHeart size={14} /> Donaciones transparentes
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold">
              Ayuda real, no solo un like.
            </h2>
            <p className="mt-5 text-lg text-[var(--ink-soft)] leading-relaxed">
              Las donaciones apoyan veterinaria de emergencia, alimento,
              transporte y rescate de mascotas en riesgo. Puedes dar a un caso
              específico o al fondo comunitario que activa apoyo donde más urge.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Atención veterinaria para rescates",
                "Alimento y hogar temporal",
                "Transporte, traslados y capturas seguras",
                "Apoyo a rescatistas verificados",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 text-[var(--ink)]"
                >
                  <span className="mt-1 text-[var(--accent)]">
                    <IconCheck size={18} />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/donar" className="vc-btn vc-btn-primary">
                Donar ahora
              </Link>
              <Link href="/donar#transparencia" className="vc-btn vc-btn-outline">
                Ver cómo se usan
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-square rounded-3xl overflow-hidden">
              <Image
                src={DONATION_IMGS[0]}
                alt="Rescate de mascota"
                fill
                sizes="(max-width:1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden translate-y-6">
              <Image
                src={DONATION_IMGS[1]}
                alt="Mascota en cuidado"
                fill
                sizes="(max-width:1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden translate-y-6">
              <Image
                src={DONATION_IMGS[2]}
                alt="Voluntaria con perro rescatado"
                fill
                sizes="(max-width:1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden">
              <Image
                src={DONATION_IMGS[3]}
                alt="Mascota con su familia"
                fill
                sizes="(max-width:1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <Section
        tone="dark"
        eyebrow="Cobertura"
        title="Arrancamos por ciudades clave y seguimos sumando."
        subtitle="Registrate y te avisamos cuando tu zona se active. Mientras tanto, tu caso queda visible en la red nacional."
      >
        <div className="flex flex-wrap gap-3">
          {CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/ciudades/${c.slug}`}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 text-sm transition-colors"
            >
              {c.name} <span className="text-white/50">· {c.state}</span>
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/registro" className="vc-btn vc-btn-primary">
            Notifícame cuando abran mi zona <IconArrow size={18} />
          </Link>
        </div>
      </Section>

      {/* FAQ */}
      <Section
        eyebrow="Preguntas frecuentes"
        title="Lo que la mayoría se pregunta"
        subtitle="Si no encuentras tu respuesta aquí, escríbenos y te respondemos directo."
      >
        <FAQ items={faqHome} />
        <div className="mt-10 flex gap-3 flex-wrap">
          <Link href="/faq" className="vc-btn vc-btn-outline">
            Ver todas las preguntas
          </Link>
          <Link href="/contacto" className="vc-btn vc-btn-dark">
            Contactarnos
          </Link>
        </div>
      </Section>

      <CTA />
    </>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div>
      <p className="text-2xl md:text-3xl font-bold text-[var(--ink)]">{big}</p>
      <p className="text-sm md:text-base text-[var(--ink-soft)]">{small}</p>
    </div>
  );
}

function AudienceCard({
  img,
  title,
  body,
  href,
}: {
  img: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group vc-card overflow-hidden flex flex-col !p-0"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={img}
          alt=""
          fill
          sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-[var(--ink-soft)]">{body}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-[var(--brand-ink)] font-semibold">
          Saber más <IconArrow size={16} />
        </span>
      </div>
    </Link>
  );
}

// Versión del mosaic que recibe las imágenes ya calculadas (sin duplicados).
function ImageMosaicStatic({
  images,
  caption,
}: {
  images: string[];
  caption?: string;
}) {
  void ImageMosaic; // keep import usage parity
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {images.map((src, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl aspect-square ring-1 ring-[var(--line)] ${
              i === 0
                ? "col-span-2 row-span-2 aspect-auto md:aspect-square"
                : ""
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 16vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {caption && (
        <p className="mt-4 text-sm text-[var(--muted)] text-center">
          {caption}
        </p>
      )}
    </div>
  );
}
