import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { casosRepo } from "@/lib/casos";
import { chatRepo } from "@/lib/chat";
import { ChatPanel } from "@/components/ChatPanel";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const caso = await casosRepo.getBySlug(slug);
  if (!caso) return { title: "Caso no encontrado", robots: { index: false } };
  return {
    title: `Hablar del caso · ${caso.nombre ?? caso.especie} · VuelveaCasa MX`,
    description: `Comparte pistas o pregunta directamente sobre el caso de ${caso.nombre ?? caso.especie} en ${caso.ciudad}.`,
    alternates: { canonical: `/casos/${slug}/chat` },
    robots: { index: false, follow: true },
  };
}

export default async function CasoChatPage({ params }: { params: Params }) {
  const { slug } = await params;
  const caso = await casosRepo.getBySlug(slug);
  if (!caso) return notFound();

  const mensajes = await chatRepo.list({ caso_id: caso.id }, 80);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Casos", item: `${SITE.url}/casos` },
      {
        "@type": "ListItem",
        position: 3,
        name: caso.nombre ?? caso.especie,
        item: `${SITE.url}/casos/${slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Chat",
        item: `${SITE.url}/casos/${slug}/chat`,
      },
    ],
  };

  return (
    <>
      <Script
        id="ld-caso-chat"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <PageHero
        eyebrow="Hilo del caso"
        title={<span>{caso.nombre ?? `${caso.especie} en ${caso.ciudad}`}</span>}
        subtitle="Comparte pistas o coordina contigo y con la comunidad. Solo conversación útil para este caso."
        imageSeed={24}
      />
      <section className="py-10 md:py-14">
        <div className="vc-container">
          <Link
            href={`/casos/${slug}`}
            className="inline-block mb-4 text-sm font-semibold text-[var(--brand-ink)]"
          >
            ← Volver al caso
          </Link>
          <ChatPanel canal="comunidad" mensajes={mensajes} casoSlug={slug} />
        </div>
      </section>
    </>
  );
}
