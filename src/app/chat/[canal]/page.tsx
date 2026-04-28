import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { chatRepo } from "@/lib/chat";
import { ChatPanel } from "@/components/ChatPanel";
import { SITE } from "@/lib/site";

type Params = Promise<{ canal: string }>;

const CANAL_ACTIVO = "comunidad";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { canal } = await params;
  if (canal !== CANAL_ACTIVO) {
    return { title: "Comunidad", robots: { index: false } };
  }
  return {
    title: "Comunidad · Chat global · VuelveaCasa MX",
    description:
      "Canal único de la comunidad. Solo cuentas con reputación pueden iniciar mensajes — así evitamos el spam que mata otros foros.",
    alternates: { canonical: "/chat/comunidad" },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { canal } = await params;
  // Slugs viejos (general, urgencias, veterinarias, rescatistas) → comunidad.
  if (canal !== CANAL_ACTIVO) {
    redirect(`/chat/${CANAL_ACTIVO}`);
  }

  const mensajes = await chatRepo.list({ canal: CANAL_ACTIVO }, 80);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Comunidad", item: `${SITE.url}/chat` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Global",
        item: `${SITE.url}/chat/comunidad`,
      },
    ],
  };

  return (
    <>
      <Script
        id="ld-chat-comunidad"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <PageHero
        eyebrow="Comunidad global"
        title={<span>Comunidad</span>}
        subtitle="Canal único, gateado por reputación: solo cuentas con +7 días o 3 casos confirmados pueden iniciar mensajes."
        imageSeed={16}
      />
      <section className="py-10 md:py-14">
        <div className="vc-container">
          <ChatPanel canal="comunidad" mensajes={mensajes} />
        </div>
      </section>
    </>
  );
}
