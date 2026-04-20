import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { pickImage, pickMany, HERO_VIDEO } from "@/lib/images";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { IconHeart, IconCheck, IconArrow, IconShield, IconBell } from "@/components/Icons";
import { FAQ } from "@/components/FAQ";
import { TikTokPixel } from "@/components/TikTokPixel";
import { MetaPixel } from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "VuelveaCasa — Reporta, encuentra y ayuda | México",
  description:
    "Red comunitaria mexicana para mascotas perdidas, encontradas y rescates. Regístrate gratis y actívate en tu colonia.",
  alternates: { canonical: "/campanas/tiktok" },
  robots: { index: false, follow: true },
};

const faq = [
  { q: "¿Es gratis?", a: "Sí. Registrarte, reportar y recibir alertas es 100% gratis." },
  { q: "¿Qué tan rápido funciona?", a: "Tu caso entra en segundos. La red local se activa apenas se cubra tu zona." },
  { q: "¿Y si aún no está mi ciudad?", a: "Igual puedes registrarte. Tu caso se visibiliza a nivel nacional y te avisamos cuando se active tu zona." },
];

export default function Page() {
  const imgs = pickMany(3, 5);
  return (
    <>
      <TikTokPixel />
      <MetaPixel />
      {/* Compact hero for paid social */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[80vh] flex items-end">
          <video
            className="vc-hero-video"
            src={HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/generales/gettyimages-1300404055-612x612%20(1).jpg"
            aria-hidden
          />
          <div className="vc-hero-overlay" />
          <div className="relative z-10 vc-container py-16 md:py-24 text-white">
            <span className="vc-eyebrow !bg-white/15 !text-white">Red comunitaria de mascotas · México</span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] max-w-3xl">
              Reporta, encuentra y ayuda a que <span className="text-[var(--brand)]">vuelvan a casa</span>.
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl">
              Regístrate gratis. Te avisamos apenas se active tu zona.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a href="#registro" className="vc-btn vc-btn-primary">
                Registrarme ya <IconArrow size={18} />
              </a>
              <Link href="/donar" className="vc-btn vc-btn-ghost">
                <IconHeart size={18} /> Apoyar una causa
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="py-10 border-b border-[var(--line)] bg-white">
        <div className="vc-container grid grid-cols-3 gap-4 text-center">
          {imgs.map((src, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image src={src} alt="" fill sizes="33vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* Promise bullets */}
      <section className="py-16">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="vc-eyebrow">¿Qué obtienes?</span>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold">Una red lista para moverse cuando más importa.</h2>
            <ul className="mt-6 space-y-3">
              {[
                { icon: <IconBell size={18} />, t: "Alertas por colonia y radio" },
                { icon: <IconShield size={18} />, t: "Rescatistas y veterinarias verificadas" },
                { icon: <IconHeart size={18} />, t: "Hogar temporal y donaciones transparentes" },
                { icon: <IconCheck size={18} />, t: "Gratis para siempre, sin letras chiquitas" },
              ].map((b) => (
                <li key={b.t} className="flex items-start gap-3 text-[var(--ink)]">
                  <span className="mt-0.5 w-8 h-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] inline-flex items-center justify-center">{b.icon}</span>
                  <span className="text-lg">{b.t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square rounded-[32px] overflow-hidden">
            <Image src={pickImage(8)} alt="" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="registro" className="py-16 bg-[var(--bg-alt)]">
        <div className="vc-container max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold">Reserva tu lugar</h2>
          <p className="mt-3 text-lg text-[var(--ink-soft)]">Tarda menos de 30 segundos.</p>
          <div className="mt-6">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* FAQ compact */}
      <section className="py-16">
        <div className="vc-container max-w-3xl">
          <h2 className="text-3xl font-bold">Preguntas rápidas</h2>
          <div className="mt-6">
            <FAQ items={faq} />
          </div>
        </div>
      </section>
    </>
  );
}
