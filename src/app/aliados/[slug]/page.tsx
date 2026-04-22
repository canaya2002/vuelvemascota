import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { aliadosRepo } from "@/lib/aliadosRepo";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { IconPin, IconShield } from "@/components/Icons";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const aliado = await aliadosRepo.getBySlug(slug);
  if (!aliado) return { robots: { index: false, follow: false } };
  const title = `${aliado.organizacion} — Aliado en ${aliado.ciudad}`;
  const description =
    aliado.notas ?? `Aliado verificado de VuelveaCasa en ${aliado.ciudad}.`;
  return {
    title,
    description,
    alternates: { canonical: `/aliados/${aliado.slug}` },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${SITE.url}/aliados/${aliado.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const aliado = await aliadosRepo.getBySlug(slug);
  if (!aliado) return notFound();

  const ld = {
    "@context": "https://schema.org",
    "@type":
      aliado.tipo === "veterinarias"
        ? "VeterinaryCare"
        : aliado.tipo === "rescatistas"
        ? "NGO"
        : "Organization",
    name: aliado.organizacion,
    url: `${SITE.url}/aliados/${aliado.slug}`,
    areaServed: { "@type": "City", name: aliado.ciudad },
    memberOf: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    description: aliado.notas,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Aliados", item: `${SITE.url}/aliados` },
      {
        "@type": "ListItem",
        position: 3,
        name: aliado.organizacion,
        item: `${SITE.url}/aliados/${aliado.slug}`,
      },
    ],
  };

  return (
    <>
      <Script
        id={`ld-aliado-${aliado.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Script
        id={`ld-aliado-${aliado.slug}-breadcrumb`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <PageHero
        eyebrow={`Aliado · ${aliado.tipo}`}
        title={<span>{aliado.organizacion}</span>}
        subtitle={
          aliado.notas ||
          `Aliado verificado de VuelveaCasa en ${aliado.ciudad}.`
        }
        imageSeed={aliado.id.charCodeAt(0)}
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-5 text-[var(--ink)]">
            <p className="flex items-center gap-2 text-[var(--ink-soft)]">
              <IconPin size={16} /> {aliado.ciudad}
            </p>
            <p className="flex items-center gap-2 text-[var(--ink-soft)]">
              <IconShield size={16} /> Verificado por VuelveaCasa
            </p>
            {aliado.notas && (
              <p className="whitespace-pre-wrap">{aliado.notas}</p>
            )}
            {aliado.sitio && (
              <p>
                Sitio o contacto:{" "}
                <a
                  href={
                    aliado.sitio.startsWith("http")
                      ? aliado.sitio
                      : `https://${aliado.sitio}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--brand-ink)] font-semibold"
                >
                  {aliado.sitio}
                </a>
              </p>
            )}
          </div>

          <aside className="vc-card bg-[var(--bg-alt)]">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
              Operaciones
            </h3>
            <p className="text-[var(--ink-soft)]">
              Responsable: <strong>{aliado.responsable}</strong>
            </p>
            <p className="text-[var(--ink-soft)] mt-1">
              Tipo: <strong>{aliado.tipo}</strong>
            </p>
            <p className="text-[var(--ink-soft)] mt-1">
              Aliado desde{" "}
              <strong>
                {new Date(aliado.created_at).toLocaleDateString("es-MX", {
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href={`/casos?ciudad=${encodeURIComponent(aliado.ciudad)}`}
                className="vc-btn vc-btn-primary text-sm"
              >
                Ver casos en {aliado.ciudad}
              </Link>
              <Link
                href="/donar"
                className="vc-btn vc-btn-outline text-sm"
              >
                Apoyar la red
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
