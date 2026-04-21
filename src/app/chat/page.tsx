import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CANALES, chatRepo, type ChatCanal } from "@/lib/chat";
import { IconArrow, IconPaw } from "@/components/Icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chat de ayuda rápida · Comunidad VuelveaCasa MX",
  description:
    "Canales temáticos para respuestas rápidas entre la comunidad VuelveaCasa, rescatistas y veterinarias en México. Moderado y enfocado en mascotas.",
  alternates: { canonical: "/chat" },
  keywords: [
    "chat mascotas México",
    "ayuda rápida rescate animal México",
    "chat veterinarias México",
    "chat rescatistas CDMX",
    "comunidad mascotas en vivo",
  ],
};

export default async function Page() {
  const counts = await Promise.all(
    CANALES.map(async (c) => {
      const list = await chatRepo.list(c.slug as ChatCanal, 1);
      return { slug: c.slug, count: list.length };
    })
  );
  const countMap = Object.fromEntries(counts.map((x) => [x.slug, x.count]));

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Chat", item: `${SITE.url}/chat` },
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
        eyebrow="Chat"
        title={
          <>
            Ayuda rápida cuando{" "}
            <span className="vc-gradient-text">cada minuto cuenta</span>.
          </>
        }
        subtitle="Canales temáticos para que alguien te responda en minutos. Moderación automática, enfocada en mascotas y rescate en México."
        imageSeed={18}
        primary={{ href: "/chat/general", label: "Entrar al chat general" }}
        secondary={{ href: "/foros", label: "Ir a foros largos" }}
      />

      <Section eyebrow="Canales" title="Elige un canal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CANALES.map((c) => {
            const accent =
              c.accent === "warn"
                ? "#e8a500"
                : c.accent === "accent"
                ? "#10a079"
                : c.accent === "sky"
                ? "#0ea5e9"
                : "#e11d48";
            return (
              <Link
                key={c.slug}
                href={`/chat/${c.slug}`}
                className="group vc-card hover:!border-[var(--brand)] flex gap-4 items-start"
              >
                <span
                  aria-hidden
                  className="shrink-0 w-12 h-12 rounded-2xl inline-flex items-center justify-center text-white"
                  style={{ background: accent }}
                >
                  <IconPaw size={20} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">{c.titulo}</h3>
                    <span className="text-xs text-[var(--muted)]">
                      {countMap[c.slug] ?? 0} activo
                      {(countMap[c.slug] ?? 0) === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--ink-soft)] leading-relaxed">
                    {c.desc}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
                    Entrar al canal <IconArrow size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* Vista previa de cómo se ve el chat */}
      <Section eyebrow="Vista previa" title="Así se conversa aquí">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="vc-card-glass !p-5 space-y-3">
              <FakeBubble
                name="Laura · CDMX"
                time="hace 2 min"
                text="Mi vecino vio un perro con correa sin dueño en Del Valle. Voy para allá a ver si lo rescatamos."
              />
              <FakeBubble
                name="Andrés · GDL"
                time="hace 10 min"
                text="¿Alguien conoce una vet de guardia 24h en Zapopan? Urgente."
              />
              <FakeBubble
                name="Paulina · MTY"
                time="hace 18 min"
                text="Recién encontramos a Rocky gracias a una pista en el chat. ¡Mil gracias a todos!"
              />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="vc-card !p-5">
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">
                Cómo funciona
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
                <li>• Elige un canal según el tema.</li>
                <li>• Escribe y recibe respuestas en minutos.</li>
                <li>• Reporta cualquier mensaje inapropiado con un clic.</li>
                <li>
                  • Para conversaciones largas, mejor usa{" "}
                  <Link href="/foros" className="underline font-semibold">
                    foros
                  </Link>
                  .
                </li>
              </ul>
            </div>
            <div
              className="rounded-2xl p-5 text-white"
              style={{ background: "#e11d48" }}
            >
              <p className="text-sm font-semibold">¿Caso urgente?</p>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                Para emergencias (atropello, maltrato) también{" "}
                <Link
                  href="/reportar-mascota"
                  className="underline font-semibold"
                >
                  publica un reporte con ubicación
                </Link>{" "}
                para activar alertas locales.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        tone="alt"
        eyebrow="Normas"
        title="Un chat que cuida a quien escribe y a quien lee"
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Solo temas relacionados con mascotas y rescate comunitario.",
            "No publiques teléfonos, direcciones exactas o datos bancarios.",
            "No insultes ni discrimines — se bloquea en el momento.",
            "Si ves algo fuera de lugar, usa el botón de reportar.",
            "Respeta el canal: urgencias es para urgencias reales.",
            "Si ya se resolvió el caso, avisa para que otros sepan.",
          ].map((t) => (
            <li key={t} className="vc-card !p-5 flex items-start gap-3">
              <span className="w-2 h-2 mt-2 rounded-full bg-[var(--brand)]" />
              <span className="text-sm text-[var(--ink)]">{t}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function FakeBubble({
  name,
  time,
  text,
}: {
  name: string;
  time: string;
  text: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-[var(--brand)] to-[#f472b6]"
      >
        {initials}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--ink)] truncate">
            {name}
          </p>
          <span className="text-[11px] text-[var(--muted)] whitespace-nowrap">
            {time}
          </span>
        </div>
        <div className="mt-1 rounded-2xl bg-white border border-[var(--line)] px-4 py-2.5 shadow-sm">
          <p className="text-sm text-[var(--ink)] leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}
