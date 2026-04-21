import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { CTA } from "@/components/CTA";
import {
  IconBell,
  IconShield,
  IconSpark,
  IconHeart,
  IconArrow,
} from "@/components/Icons";
import { SITE, CITIES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Alertas por zona — VuelveaCasa · Avisos hiperlocales",
  description:
    "Activa alertas hiperlocales para saber al instante cuándo una mascota se pierde o se encuentra cerca de ti, sin spam. Radio ajustable, especies y ciudad.",
  alternates: { canonical: "/alertas" },
  keywords: [
    "alertas mascotas por zona",
    "aviso mascota perdida colonia",
    "alerta perro perdido cerca",
    "alerta gato perdido CDMX",
    "notificaciones mascotas México",
  ],
};

export default function Page() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Alertas", item: `${SITE.url}/alertas` },
    ],
  };
  return (
    <>
      <Script
        id="ld-alertas"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <PageHero
        eyebrow="Alertas hiperlocales"
        title={
          <>
            Tu colonia, tu <span className="vc-gradient-text">radar</span>.
          </>
        }
        subtitle="Define tu zona y recibe avisos inmediatos cuando una mascota se pierde o se encuentra cerca. Nada de ruido, solo lo que importa."
        imageSeed={21}
        primary={{ href: "/panel/alertas", label: "Crear mi alerta" }}
        secondary={{ href: "/registro", label: "Registrarme gratis" }}
      />

      <Section eyebrow="Cómo funciona" title="Sin apps complicadas, sin spam">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard
            icon={<IconBell size={22} />}
            title="Elige tu radio"
            body="Tu colonia, un punto del mapa o un radio de 1 a 10 km alrededor de tu casa."
          />
          <FeatureCard
            icon={<IconShield size={22} />}
            title="Solo lo verificado"
            body="Filtros básicos para evitar falsos positivos o duplicados. Solo casos reales."
            tint="accent"
          />
          <FeatureCard
            icon={<IconSpark size={22} />}
            title="Llega al canal que usas"
            body="Email, push web y pronto WhatsApp. Tú decides el formato."
          />
          <FeatureCard
            icon={<IconHeart size={22} />}
            title="Puedes pausarla o borrarla"
            body="Con un clic desde tu panel. Siempre. Sin letra chiquita."
            tint="ink"
          />
        </div>
      </Section>

      <Section tone="alt" eyebrow="Pasos" title="Activar tu zona en 2 minutos">
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              n: "01",
              t: "Crea tu cuenta gratis",
              b: "Solo email + contraseña. Sin tarjeta, sin apps.",
              href: "/crear-cuenta",
            },
            {
              n: "02",
              t: "Define tu radio y especies",
              b: "Elige ciudad o un punto en el mapa. Decide si te interesan perros, gatos o ambos.",
              href: "/panel/alertas",
            },
            {
              n: "03",
              t: "Empieza a recibir avisos",
              b: "Cada vez que alguien publique un caso en tu zona, te llega un email con foto y enlace.",
              href: "/panel/alertas",
            },
          ].map((s) => (
            <li key={s.n} className="vc-card-glass">
              <span className="text-sm font-bold text-[var(--brand)] tracking-wider">
                {s.n}
              </span>
              <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
              <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">{s.b}</p>
              <Link
                href={s.href}
                className="mt-5 inline-flex items-center gap-2 text-[var(--brand-ink)] font-semibold text-sm"
              >
                Ir al paso <IconArrow size={14} />
              </Link>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Cobertura" title="Ciudades con alertas activas">
        <div className="flex flex-wrap gap-3">
          {CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/ciudades/${c.slug}`}
              className="px-4 py-2.5 rounded-full bg-[var(--bg-alt)] hover:bg-[var(--brand-soft)] border border-[var(--line)] text-sm transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/panel/alertas" className="vc-btn vc-btn-primary">
            Crear mi alerta ahora <IconArrow size={16} />
          </Link>
        </div>
      </Section>

      <CTA
        seed={26}
        title="No esperes a que tu mascota se pierda para activarte."
        subtitle="Registra tu zona y sé parte de la red que responde primero cuando alguien necesita ayuda."
        primaryLabel="Activar mi zona"
        primaryHref="/panel/alertas"
      />
    </>
  );
}
