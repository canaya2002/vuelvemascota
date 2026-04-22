import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTA } from "@/components/CTA";
import { pickImage, pickMany } from "@/lib/images";
import { IconArrow, IconCheck } from "@/components/Icons";
import { Reveal, Stagger, AmbientOrbs } from "@/components/motion";
import type { SeoHub } from "@/lib/seoContent";
import { SITE } from "@/lib/site";

/**
 * SeoHubPage — shared renderer for all 9 topical hub pages. One component,
 * nine pages, consistent premium feel. Adds: HowTo + FAQPage + BreadcrumbList
 * JSON-LD, scroll-driven reveals, ambient gradient orbs on hero and final CTA,
 * and a trust band with 4 "social proof" tiles.
 */
export function SeoHubPage({ hub }: { hub: SeoHub }) {
  const mosaic = pickMany(4, hub.seed + 2);

  // Pretty-case the hub label for the breadcrumb trail. `slug` uses
  // dashes; the breadcrumb shows the human H1 title for clarity.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: hub.h1,
        item: `${SITE.url}/${hub.slug}`,
      },
    ],
  };

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: hub.h1,
    description: hub.intro,
    inLanguage: "es-MX",
    totalTime: "PT30M",
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    step: hub.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.t,
      text: s.b,
    })),
  };

  // Tips → FAQPage. Google renders these as rich snippets in SERPs,
  // producing a big visual boost. Each tip is reframed as a Q&A pair
  // using the first clause as the question.
  const faqLd = hub.tips.length > 0 && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: hub.tips.map((tip) => ({
      "@type": "Question",
      name: tip.split(/[.:]/)[0].slice(0, 120),
      acceptedAnswer: { "@type": "Answer", text: tip },
    })),
  };

  return (
    <>
      <Script
        id={`ld-${hub.slug}-breadcrumb`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Script
        id={`ld-${hub.slug}-howto`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      {faqLd ? (
        <Script
          id={`ld-${hub.slug}-faq`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}

      {/* Breadcrumb navigation (visible) — helps bounce rate + SEO. */}
      <nav
        aria-label="Migas de pan"
        className="vc-container pt-6 pb-2 text-sm text-[var(--muted)]"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-[var(--brand)]">Inicio</Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-[var(--ink)] font-medium" aria-current="page">{hub.h1}</li>
        </ol>
      </nav>

      <PageHero
        eyebrow="Guía útil · México"
        title={<span>{hub.h1}</span>}
        subtitle={hub.intro}
        imageSeed={hub.seed}
        primary={hub.primaryCta}
        secondary={{ href: "/donar", label: "Apoyar a la red" }}
      />

      {/* Trust band — dense signals that answer "should I trust this?" in <5s. */}
      <section className="-mt-6 md:-mt-10 relative z-10">
        <div className="vc-container">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <TrustTile value="100%" label="Gratis siempre" />
              <TrustTile value="24/7" label="Tu red, a cualquier hora" />
              <TrustTile value="MX" label="10+ ciudades activas" />
              <TrustTile value="★★★★★" label="Comunidad que responde" />
            </div>
          </Reveal>
        </div>
      </section>

      <Section eyebrow="Paso a paso" title="Acciones claras que funcionan">
        <Stagger
          as="ol"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          step={110}
        >
          {hub.steps.map((s, i) => (
            <li
              key={s.t}
              className="vc-card-glass vc-shine group"
              style={{ listStyle: "none" }}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-[var(--brand)] text-white font-bold text-sm shadow-[0_8px_18px_-6px_rgba(225,29,72,0.5)]">
                  {i + 1}
                </span>
                <span className="text-xs font-semibold tracking-wide uppercase text-[var(--brand-ink)]">
                  Paso {i + 1}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
              <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">{s.b}</p>
            </li>
          ))}
        </Stagger>
      </Section>

      <section className="py-16 md:py-20 bg-[var(--bg-alt)] relative overflow-hidden">
        <AmbientOrbs variant="sunrise" />
        <div className="relative vc-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div>
              <span className="vc-eyebrow">Tips rápidos</span>
              <h2 className="mt-5 text-3xl md:text-4xl font-bold">
                Lo que la experiencia nos ha enseñado
              </h2>
              <ul className="mt-6 space-y-3">
                {hub.tips.map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-1 text-[var(--accent)] flex-shrink-0">
                      <IconCheck size={18} />
                    </span>
                    <span className="text-[var(--ink-soft)] leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal direction="left" delay={120}>
            <div className="grid grid-cols-2 gap-3">
              {mosaic.map((src, i) => (
                <div
                  key={i}
                  className={`relative aspect-square overflow-hidden rounded-2xl vc-tilt ${i % 2 === 0 ? "translate-y-4" : ""}`}
                >
                  <Image
                    src={src}
                    alt={`Imagen ilustrativa sobre ${hub.h1.toLowerCase()}`}
                    fill
                    sizes="(max-width:1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Section eyebrow="Recursos relacionados" title="Sigue explorando">
        <Stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          step={80}
        >
          {hub.related.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group vc-card hover:border-[var(--brand)] transition-all"
            >
              <h3 className="text-lg font-semibold">{r.label}</h3>
              <span className="mt-4 inline-flex items-center gap-2 text-[var(--brand-ink)] font-semibold">
                Abrir guía{" "}
                <span className="transition-transform group-hover:translate-x-1">
                  <IconArrow size={16} />
                </span>
              </span>
            </Link>
          ))}
        </Stagger>
      </Section>

      <section className="py-16 relative">
        <div className="vc-container">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] shadow-[0_24px_48px_-16px_rgba(10,26,43,0.35)]">
              <Image
                src={pickImage(hub.seed + 7)}
                alt=""
                width={1600}
                height={600}
                className="w-full h-[320px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f33]/92 via-[#0b1f33]/70 to-[#0b1f33]/30" />
              <div className="absolute inset-0 p-8 md:p-14 flex items-center">
                <div className="max-w-xl text-white">
                  <span className="vc-eyebrow-glass !bg-white/18 !text-white !border-white/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white vc-pulse-ring" />
                    Comunidad activa
                  </span>
                  <h3 className="mt-4 text-2xl md:text-4xl font-bold">
                    ¿Listo para actuar con la red?
                  </h3>
                  <p className="mt-3 text-white/85 leading-relaxed">
                    VuelveaCasa organiza el caso, activa tu zona y te acompaña
                    en el proceso. Sin costo, sin anuncios.
                  </p>
                  <div className="mt-5 flex gap-3 flex-wrap">
                    <Link href={hub.primaryCta.href} className="vc-btn vc-btn-primary vc-shine">
                      {hub.primaryCta.label}
                    </Link>
                    <Link href="/donar" className="vc-btn vc-btn-ghost">
                      Donar a la red
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTA seed={hub.seed + 10} />
    </>
  );
}

function TrustTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="vc-card-glass text-center py-5 px-3">
      <div className="text-2xl md:text-3xl font-bold tracking-tight vc-gradient-text">
        {value}
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        {label}
      </div>
    </div>
  );
}
