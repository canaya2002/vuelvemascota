import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CATEGORIAS, forosRepo, type ForoCategoria } from "@/lib/foros";
import { IconArrow, IconHeart, IconPaw, IconSearch } from "@/components/Icons";
import { pickRange } from "@/lib/images";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Foros · Comunidad VuelveaCasa MX — Experiencias, consejos y rescates",
  description:
    "Comparte experiencias de reencuentros, pide consejos y coordina rescates con la comunidad VuelveaCasa en México. Conversa con dueños, rescatistas y veterinarias.",
  alternates: { canonical: "/foros" },
  keywords: [
    "foro mascotas México",
    "foro rescate animal CDMX",
    "comunidad rescate animal México",
    "experiencias mascotas perdidas",
    "consejos dueños perros gatos",
    "compartir historias rescate mascotas",
    "reencuentro mascotas",
  ],
};

type Search = Promise<{ cat?: string; q?: string }>;

const CAT_IMGS = pickRange(25, 6); // 25..30 — hero usa 12

export default async function Page({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const activeCat = (
    CATEGORIAS.map((c) => c.slug) as string[]
  ).includes(sp.cat ?? "")
    ? (sp.cat as ForoCategoria)
    : undefined;
  const q = (sp.q ?? "").trim().toLowerCase();
  const hilosAll = await forosRepo.list({ categoria: activeCat, limit: 60 });
  const hilos = q
    ? hilosAll.filter(
        (h) =>
          h.titulo.toLowerCase().includes(q) ||
          h.cuerpo.toLowerCase().includes(q)
      )
    : hilosAll;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Foros", item: `${SITE.url}/foros` },
    ],
  };

  return (
    <>
      <Script
        id="ld-foros"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <PageHero
        eyebrow="Comunidad"
        title={
          <>
            Foros donde la comunidad <span className="vc-gradient-text">se cuida</span>.
          </>
        }
        subtitle="Comparte experiencias, pide consejos y coordina rescates. Todo lo publicado pasa por un filtro automático que protege la conversación."
        imageSeed={12}
        primary={{ href: "/foros/nuevo", label: "Abrir un tema" }}
        secondary={{ href: "/chat", label: "Ir al chat rápido" }}
      />

      <section className="py-12">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-5">
            <form
              action="/foros"
              method="get"
              className="vc-card !p-4"
            >
              {activeCat && <input type="hidden" name="cat" value={activeCat} />}
              <label htmlFor="foro-q" className="vc-label text-xs">
                Buscar en foros
              </label>
              <div className="flex gap-2">
                <input
                  id="foro-q"
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Palabra clave"
                  className="vc-input text-sm !py-2"
                />
                <button
                  type="submit"
                  className="vc-btn vc-btn-primary text-sm !py-2 !px-3"
                  aria-label="Buscar"
                >
                  <IconSearch size={14} />
                </button>
              </div>
            </form>

            <div className="vc-card !p-4">
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">
                Categorías
              </p>
              <ul className="mt-3 space-y-1">
                <li>
                  <Link
                    href="/foros"
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      !activeCat
                        ? "bg-[var(--brand)] !text-white font-semibold"
                        : "!text-[var(--ink-soft)] hover:bg-[var(--bg-alt)] hover:!text-[var(--ink)]"
                    }`}
                  >
                    Todos los temas
                  </Link>
                </li>
                {CATEGORIAS.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/foros?cat=${c.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCat === c.slug
                          ? "bg-[var(--brand)] !text-white font-semibold"
                          : "!text-[var(--ink-soft)] hover:bg-[var(--bg-alt)] hover:!text-[var(--ink)]"
                      }`}
                    >
                      {c.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="vc-card-glass !p-5 bg-[var(--brand-soft)]">
              <p className="text-sm font-semibold text-[var(--brand-ink)]">
                ¿Tu primera vez aquí?
              </p>
              <p className="mt-2 text-sm text-[var(--ink-soft)] leading-relaxed">
                Los foros son para conversaciones largas. Para preguntas rápidas
                usa el{" "}
                <Link href="/chat" className="underline font-semibold">
                  chat
                </Link>
                .
              </p>
              <Link
                href="/foros/nuevo"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-ink)]"
              >
                Abrir mi primer tema <IconArrow size={14} />
              </Link>
            </div>
          </aside>

          {/* Main feed */}
          <main className="lg:col-span-9">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  {activeCat
                    ? CATEGORIAS.find((c) => c.slug === activeCat)?.titulo
                    : q
                    ? `Resultados para "${q}"`
                    : "Conversaciones recientes"}
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  {hilos.length} tema{hilos.length === 1 ? "" : "s"}
                </p>
              </div>
              <Link
                href="/foros/nuevo"
                className="vc-btn vc-btn-primary text-sm !py-2.5 !px-4"
              >
                <IconHeart size={15} /> Abrir tema
              </Link>
            </div>

            {hilos.length === 0 ? (
              <EmptyForum query={q} />
            ) : (
              <ul className="space-y-3">
                {hilos.map((h, idx) => (
                  <li key={h.id}>
                    <Link
                      href={`/foros/${h.id}`}
                      className="vc-card hover:!border-[var(--brand)] flex gap-4 items-start"
                    >
                      <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl overflow-hidden ring-1 ring-[var(--line)]">
                        <Image
                          src={CAT_IMGS[idx % CAT_IMGS.length]}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] font-semibold uppercase tracking-wider">
                            {CATEGORIAS.find((c) => c.slug === h.categoria)
                              ?.titulo ?? h.categoria}
                          </span>
                          {h.ciudad && (
                            <span className="text-[var(--muted)]">
                              · {h.ciudad}
                            </span>
                          )}
                          <span className="text-[var(--muted)]">
                            · {formatRelative(h.created_at)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--ink)]">
                          {h.titulo}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--ink-soft)] line-clamp-2">
                          {h.cuerpo}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted)]">
                          <span className="inline-flex items-center gap-1">
                            <IconPaw size={12} /> {h.autor_nombre ?? "Comunidad"}
                          </span>
                          <span>
                            {h.respuestas_count} respuesta
                            {h.respuestas_count === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </main>
        </div>
      </section>

      {/* Templates / ideas */}
      <Section
        eyebrow="¿No sabes qué escribir?"
        title="Estas son ideas para tu primer tema"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              cat: "experiencias",
              title: "Cómo encontramos a [nombre] después de X días",
              body: "Cuenta qué funcionó, qué no, y qué aprendiste para que otros no pasen lo mismo.",
            },
            {
              cat: "consejos",
              title: "Tips para capturar un gato asustadizo",
              body: "Comparte qué equipo, trucos o rutinas te dieron mejor resultado con gatos callejeros.",
            },
            {
              cat: "rescates",
              title: "Rescate urgente en [zona] — necesitamos ayuda",
              body: "Coordina apoyos, traslados o donaciones para un caso activo de tu zona.",
            },
            {
              cat: "busqueda",
              title: "Avistamiento reciente en [colonia]",
              body: "Pistas, descripción del lugar, hora y fotos para armar una búsqueda efectiva.",
            },
            {
              cat: "adopcion",
              title: "En adopción responsable: [nombre]",
              body: "Historia, requisitos y proceso para que la mascota encuentre hogar definitivo.",
            },
            {
              cat: "otros",
              title: "Pregunta general a la comunidad",
              body: "Todo lo que no entre en las otras categorías — pero sigue siendo sobre mascotas.",
            },
          ].map((t) => (
            <Link
              key={t.title}
              href={`/foros/nuevo?cat=${t.cat}`}
              className="vc-card hover:!border-[var(--brand)]"
            >
              <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-[var(--brand-ink)] bg-[var(--brand-soft)] px-2 py-0.5 rounded-full">
                {CATEGORIAS.find((c) => c.slug === t.cat)?.titulo}
              </span>
              <h3 className="mt-3 text-base font-semibold leading-tight">
                {t.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">{t.body}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-ink)]">
                Usar esta idea <IconArrow size={12} />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="alt" eyebrow="Normas del foro" title="Para mantener un espacio seguro">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Enfócate en mascotas, rescate y apoyo comunitario.",
            "No compartas datos personales (teléfonos, direcciones exactas) públicamente: usa el contacto directo del caso.",
            "Sin insultos, discriminación ni contenido sexual. Se bloquean automáticamente.",
            "No se permite spam, promoción no solicitada ni pedir dinero fuera de donaciones verificadas.",
            "Cuando un caso se resuelve, avisa en el hilo: ayuda a que otros aprendan.",
            "Las veterinarias y rescatistas verificados aparecen con una insignia.",
          ].map((t) => (
            <div key={t} className="vc-card !p-5">
              <p className="text-sm leading-relaxed text-[var(--ink)]">{t}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function EmptyForum({ query }: { query: string }) {
  return (
    <div className="vc-card-glass text-center py-16">
      <span className="inline-flex w-16 h-16 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center mx-auto">
        <IconPaw size={28} />
      </span>
      <p className="mt-5 text-lg font-semibold">
        {query
          ? `Sin resultados para "${query}".`
          : "Todavía no hay conversaciones."}
      </p>
      <p className="mt-2 text-[var(--ink-soft)] max-w-md mx-auto">
        Sé el primero en compartir una experiencia, pregunta o caso. La comunidad
        empieza con alguien que da el primer paso.
      </p>
      <Link href="/foros/nuevo" className="vc-btn vc-btn-primary mt-6">
        Abrir el primer tema <IconArrow size={14} />
      </Link>
    </div>
  );
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace segundos";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}
