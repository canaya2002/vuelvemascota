import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { CANALES, chatRepo, type ChatCanal } from "@/lib/chat";
import { ChatPanel } from "@/components/ChatPanel";
import { SITE } from "@/lib/site";

type Params = Promise<{ canal: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { canal } = await params;
  const c = CANALES.find((x) => x.slug === canal);
  if (!c) return { title: "Canal no encontrado", robots: { index: false } };
  return {
    title: `Chat · ${c.titulo} · VuelveaCasa MX`,
    description: c.desc,
    alternates: { canonical: `/chat/${canal}` },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { canal } = await params;
  const c = CANALES.find((x) => x.slug === canal);
  if (!c) return notFound();
  const mensajes = await chatRepo.list(c.slug as ChatCanal, 80);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Chat", item: `${SITE.url}/chat` },
      {
        "@type": "ListItem",
        position: 3,
        name: c.titulo,
        item: `${SITE.url}/chat/${c.slug}`,
      },
    ],
  };

  const accentColor =
    c.accent === "warn"
      ? "var(--warn)"
      : c.accent === "accent"
      ? "var(--accent)"
      : c.accent === "sky"
      ? "var(--sky)"
      : "var(--brand)";

  return (
    <>
      <Script
        id="ld-chat-canal"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <PageHero
        eyebrow={`Canal · ${c.titulo}`}
        title={<span>{c.titulo}</span>}
        subtitle={c.desc}
        imageSeed={16}
      />
      <section className="py-10 md:py-14">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar con canales + normas */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="vc-card-glass !p-5">
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">
                Canales
              </p>
              <ul className="mt-3 space-y-1.5">
                {CANALES.map((x) => {
                  const active = x.slug === c.slug;
                  return (
                    <li key={x.slug}>
                      <Link
                        href={`/chat/${x.slug}`}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          active
                            ? "bg-[var(--brand)] !text-white"
                            : "bg-white hover:bg-[var(--brand-soft)] !text-[var(--ink)] hover:!text-[var(--brand-ink)]"
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: active ? "white" : accentForCanal(x.slug),
                          }}
                        />
                        <span className="flex-1 font-semibold text-sm">
                          {x.titulo}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="vc-card !p-5">
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">
                Normas del canal
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
                <li>• Solo mascotas y rescate comunitario</li>
                <li>• Sin teléfonos ni direcciones exactas</li>
                <li>• Sin insultos, se bloquean al vuelo</li>
                <li>• Reporta con el botón si ves algo raro</li>
              </ul>
            </div>

            <div
              className="rounded-2xl p-5 text-white"
              style={{ background: accentColor }}
            >
              <p className="text-xs uppercase tracking-wider font-bold opacity-80">
                ¿Caso urgente?
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                Si es una emergencia (atropello, maltrato), publica también un{" "}
                <Link
                  href="/reportar-mascota"
                  className="underline font-semibold"
                >
                  reporte con ubicación
                </Link>{" "}
                para activar alertas y veterinarias aliadas.
              </p>
            </div>
          </aside>

          {/* Panel principal */}
          <div className="lg:col-span-8">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full vc-pulse-ring"
                  style={{ background: accentColor }}
                />
                <div>
                  <h2 className="text-xl font-bold">{c.titulo}</h2>
                  <p className="text-xs text-[var(--muted)]">
                    {mensajes.length} mensajes · Moderado automáticamente
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/foros"
                  className="vc-btn vc-btn-outline text-xs !py-2 !px-3"
                >
                  Ir a foros (temas largos)
                </Link>
              </div>
            </div>
            <ChatPanel canal={c.slug as ChatCanal} mensajes={mensajes} />
          </div>
        </div>
      </section>
    </>
  );
}

function accentForCanal(canal: string) {
  const c = CANALES.find((x) => x.slug === canal);
  if (!c) return "var(--brand)";
  return c.accent === "warn"
    ? "#e8a500"
    : c.accent === "accent"
    ? "#10a079"
    : c.accent === "sky"
    ? "#0ea5e9"
    : "#e11d48";
}
