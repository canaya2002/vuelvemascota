import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { forosRepo, CATEGORIAS } from "@/lib/foros";
import { IconArrow } from "@/components/Icons";
import { ReplyForm } from "@/components/forms/ReplyForm";
import { DonationAppeal } from "@/components/DonationAppeal";
import { SITE } from "@/lib/site";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const { hilo } = await forosRepo.get(id);
  if (!hilo) {
    return { title: "Hilo no encontrado", robots: { index: false } };
  }
  return {
    title: `${hilo.titulo} · Foros VuelveaCasa`,
    description: hilo.cuerpo.slice(0, 160),
    alternates: { canonical: `/foros/${id}` },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const { hilo, respuestas } = await forosRepo.get(id);
  if (!hilo) return notFound();

  const cat =
    CATEGORIAS.find((c) => c.slug === hilo.categoria)?.titulo ?? hilo.categoria;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Foros", item: `${SITE.url}/foros` },
      {
        "@type": "ListItem",
        position: 3,
        name: hilo.titulo,
        item: `${SITE.url}/foros/${id}`,
      },
    ],
  };
  const discussion = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": `${SITE.url}/foros/${id}`,
    headline: hilo.titulo,
    articleBody: hilo.cuerpo,
    datePublished: hilo.created_at,
    author: { "@type": "Person", name: hilo.autor_nombre ?? "Comunidad VuelveaCasa" },
    inLanguage: "es-MX",
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/CommentAction",
      userInteractionCount: hilo.respuestas_count,
    },
  };

  return (
    <>
      <Script
        id="ld-foro-hilo"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumb, discussion]),
        }}
      />
      <PageHero
        eyebrow={cat}
        title={<span>{hilo.titulo}</span>}
        subtitle={
          hilo.autor_nombre
            ? `Publicado por ${hilo.autor_nombre}${hilo.ciudad ? " · " + hilo.ciudad : ""}`
            : hilo.ciudad ?? undefined
        }
        imageSeed={11}
      />
      <Section>
        <div className="max-w-3xl mx-auto">
          <article className="vc-card !p-6 md:!p-8">
            <p className="whitespace-pre-wrap leading-relaxed text-[var(--ink)]">
              {hilo.cuerpo}
            </p>
            <p className="mt-6 text-xs text-[var(--muted)]">
              {new Date(hilo.created_at).toLocaleString("es-MX")}
            </p>
          </article>

          <h2 className="mt-12 text-2xl font-bold">
            Respuestas ({respuestas.length})
          </h2>
          {respuestas.length === 0 ? (
            <p className="mt-4 text-[var(--ink-soft)]">
              Todavía no hay respuestas. Sé el primero en aportar.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {respuestas.map((r) => (
                <li key={r.id} className="vc-card !p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      {r.autor_nombre ?? "Comunidad"}
                    </p>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(r.created_at).toLocaleString("es-MX")}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--ink-soft)]">
                    {r.cuerpo}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10">
            <ReplyForm hiloId={id} />
          </div>

          <div className="mt-10">
            <DonationAppeal variant="foro-publicado" />
          </div>

          <div className="mt-12 flex gap-3 flex-wrap">
            <Link href="/foros" className="vc-btn vc-btn-outline">
              Volver al foro
            </Link>
            <Link href="/foros/nuevo" className="vc-btn vc-btn-primary">
              Abrir otro tema <IconArrow size={16} />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
