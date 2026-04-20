import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTA } from "@/components/CTA";
import { pickImage, pickMany } from "@/lib/images";
import { IconArrow, IconCheck } from "@/components/Icons";
import type { SeoHub } from "@/lib/seoContent";
import { SITE } from "@/lib/site";

export function SeoHubPage({ hub }: { hub: SeoHub }) {
  const mosaic = pickMany(4, hub.seed + 2);
  const jsonLd = {
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
  return (
    <>
      <Script id={`ld-${hub.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="Guía útil · México"
        title={<span>{hub.h1}</span>}
        subtitle={hub.intro}
        imageSeed={hub.seed}
        primary={hub.primaryCta}
        secondary={{ href: "/donar", label: "Apoyar a la red" }}
      />

      <Section eyebrow="Paso a paso" title="Acciones claras que funcionan">
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hub.steps.map((s, i) => (
            <li key={s.t} className="vc-card">
              <span className="text-sm font-semibold text-[var(--brand)]">Paso {i + 1}</span>
              <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
              <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">{s.b}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section className="py-16 md:py-20 bg-[var(--bg-alt)]">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="vc-eyebrow">Tips rápidos</span>
            <h2 className="mt-5 text-3xl md:text-4xl font-bold">Lo que la experiencia nos ha enseñado</h2>
            <ul className="mt-6 space-y-3">
              {hub.tips.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 text-[var(--accent)]"><IconCheck size={18} /></span>
                  <span className="text-[var(--ink-soft)]">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {mosaic.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
                <Image src={src} alt="" fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section eyebrow="Recursos relacionados" title="Sigue explorando">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hub.related.map((r) => (
            <Link key={r.href} href={r.href} className="vc-card hover:border-[var(--ink)]">
              <h3 className="text-lg font-semibold">{r.label}</h3>
              <span className="mt-4 inline-flex items-center gap-2 text-[var(--brand-ink)] font-semibold">
                Abrir guía <IconArrow size={16} />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <section className="py-16">
        <div className="vc-container">
          <div className="relative overflow-hidden rounded-[28px]">
            <Image src={pickImage(hub.seed + 7)} alt="" width={1600} height={600} className="w-full h-[320px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f33]/90 to-[#0b1f33]/40" />
            <div className="absolute inset-0 p-8 md:p-14 flex items-center">
              <div className="max-w-xl text-white">
                <h3 className="text-2xl md:text-4xl font-bold">¿Listo para actuar con la red?</h3>
                <p className="mt-3 text-white/80">VuelveaCasa organiza el caso, activa tu zona y te acompaña en el proceso.</p>
                <div className="mt-5 flex gap-3 flex-wrap">
                  <Link href={hub.primaryCta.href} className="vc-btn vc-btn-primary">{hub.primaryCta.label}</Link>
                  <Link href="/donar" className="vc-btn vc-btn-ghost">Donar a la red</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTA seed={hub.seed + 3} />
    </>
  );
}
