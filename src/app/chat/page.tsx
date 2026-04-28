import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { currentUser } from "@clerk/nextjs/server";
import { PageHero } from "@/components/PageHero";
import { vistasRepo, type VistaFiltros } from "@/lib/vistas";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";
import { FLAGS } from "@/lib/flags";
import { IconArrow } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Comunidad · Vistas y conversaciones · VuelveaCasa MX",
  description:
    "Crea vistas con filtros para ver solo lo que te importa. La conversación vive dentro de cada caso para evitar spam.",
  alternates: { canonical: "/chat" },
};

export const dynamic = "force-dynamic";

export default async function ChatHubPage() {
  let usuarioId: string | null = null;
  if (FLAGS.auth) {
    const u = await currentUser();
    if (u) {
      const row = await db.getUserByClerkId(u.id);
      usuarioId = (row?.id as string | undefined) ?? null;
    }
  }

  const vistas = usuarioId ? await vistasRepo.list(usuarioId) : [];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Comunidad",
        item: `${SITE.url}/chat`,
      },
    ],
  };

  return (
    <>
      <Script
        id="ld-chat"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <PageHero
        eyebrow="Comunidad"
        title={
          <>
            Vistas y <span className="vc-gradient-text">conversaciones</span>.
          </>
        }
        subtitle="Crea vistas con filtros para ver solo lo que te importa. La conversación vive dentro de cada caso — así evitamos spam."
        imageSeed={18}
        primary={{ href: "/chat/comunidad", label: "Entrar a Comunidad" }}
        secondary={{ href: "/chat/vista/nueva", label: "Crear vista" }}
      />

      <section className="py-10 md:py-14">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mis vistas */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">
                Mis vistas
              </h2>
              <Link
                href="/chat/vista/nueva"
                className="text-sm font-bold text-[var(--brand)]"
              >
                + Nueva
              </Link>
            </div>

            {!usuarioId ? (
              <div className="vc-card !p-6 text-center">
                <p className="text-[var(--ink)] font-semibold">
                  Inicia sesión para crear vistas guardadas.
                </p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Las vistas son filtros nombrados — puedes guardarlas privadas o
                  compartirlas con un enlace.
                </p>
                <Link
                  href="/entrar"
                  className="vc-btn vc-btn-primary mt-4 inline-flex"
                >
                  Iniciar sesión <IconArrow size={14} />
                </Link>
              </div>
            ) : vistas.length === 0 ? (
              <div className="vc-card !p-6">
                <p className="text-[var(--ink)] font-semibold">
                  Crea tu primera vista
                </p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Por ejemplo: <em>&ldquo;Perros perdidos cerca de casa&rdquo;</em> o{" "}
                  <em>&ldquo;Urgentes en mi ciudad esta semana&rdquo;</em>.
                </p>
                <Link
                  href="/chat/vista/nueva"
                  className="vc-btn vc-btn-primary mt-4 inline-flex"
                >
                  Crear vista <IconArrow size={14} />
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {vistas.map((v) => (
                  <li key={v.id}>
                    <Link
                      href={`/chat/vista/${v.id}`}
                      className="vc-card block hover:!border-[var(--brand)] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--ink)] truncate">
                            {v.nombre}
                          </p>
                          <p className="text-xs text-[var(--muted)] truncate">
                            {summarize(v.filtros)}
                          </p>
                        </div>
                        {v.publica ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-alt)] uppercase tracking-wide font-bold text-[var(--muted)]">
                            Pública
                          </span>
                        ) : null}
                        <IconArrow size={14} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <Link
              href="/chat/comunidad"
              className="vc-card-glass block hover:!border-[var(--brand)] transition-colors"
            >
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--brand)]">
                Conversación
              </p>
              <p className="mt-2 font-bold text-[var(--ink)]">
                Comunidad global
              </p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Canal único para anuncios y dudas. Solo cuentas con reputación
                pueden iniciar mensajes.
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
                Entrar <IconArrow size={14} />
              </span>
            </Link>

            <div className="rounded-2xl bg-[var(--bg-alt)] p-5">
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--ink)]">
                Cómo evitamos el spam
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-[var(--ink-soft)] leading-relaxed">
                <li>
                  • Casos nuevos: solo cuentas con +7 días o 3 casos confirmados
                  pueden iniciar conversación abierta.
                </li>
                <li>• 3 reportes ocultan un mensaje y silencian al autor 24h.</li>
                <li>
                  • Toca el botón &ldquo;Reportar&rdquo; en cualquier mensaje para
                  marcarlo.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function summarize(f: VistaFiltros): string {
  const parts: string[] = [];
  if (f.tipo?.length) parts.push(f.tipo.join(" / "));
  if (f.especies?.length) parts.push(f.especies.join(" + "));
  if (f.ciudad) parts.push(f.ciudad);
  if (f.colonia) parts.push(f.colonia);
  if (f.radio_km) parts.push(`${f.radio_km}km`);
  if (f.recientes_horas) parts.push(`<${f.recientes_horas}h`);
  if (f.solo_verificados) parts.push("verificados");
  return parts.join(" · ") || "Sin filtros";
}
