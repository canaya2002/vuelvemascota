import Link from "next/link";
import {
  IconPaw,
  IconBell,
  IconHeart,
  IconSearch,
  IconShield,
  IconArrow,
} from "./Icons";
import { HERO_VIDEO, HERO_POSTER } from "@/lib/images";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[92vh] md:min-h-[94vh] flex items-end">
        <video
          className="vc-hero-video"
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_POSTER}
          aria-hidden
        />
        <div className="vc-hero-overlay" />

        <div className="relative z-10 vc-container py-20 md:py-24 text-white">
          <div className="max-w-3xl">
            <span className="vc-eyebrow !bg-white/18 !text-white border border-white/25 backdrop-blur-md">
              <IconPaw size={14} /> Red comunitaria para mascotas en México
            </span>
            <h1 className="mt-6 text-[2.4rem] leading-[1.04] sm:text-5xl md:text-6xl lg:text-[4.6rem] font-bold tracking-tight">
              Reporta, encuentra y ayuda a que{" "}
              <span className="text-[var(--brand)]">vuelvan a casa</span>.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
              VuelveaCasa es la plataforma mexicana para reportar mascotas
              perdidas, avistar mascotas encontradas, activar alertas por zona,
              abrir hogares temporales y apoyar rescates reales.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/registro" className="vc-btn vc-btn-primary">
                Registrarme gratis <IconArrow size={18} />
              </Link>
              <Link href="/donar" className="vc-btn vc-btn-ghost">
                <IconHeart size={18} /> Apoyar una causa
              </Link>
            </div>

            <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
              <HeroFeature
                icon={<IconSearch size={18} />}
                label="Reportes con ubicación"
              />
              <HeroFeature
                icon={<IconBell size={18} />}
                label="Alertas por zona"
              />
              <HeroFeature
                icon={<IconHeart size={18} />}
                label="Hogar temporal"
              />
              <HeroFeature
                icon={<IconShield size={18} />}
                label="Aliados verificados"
              />
            </ul>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-10 hidden md:inline-flex items-center gap-2 rounded-full vc-glass-dark-strong text-white text-xs px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
          Activando cobertura por ciudad
        </div>
      </div>
    </section>
  );
}

function HeroFeature({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-md border border-white/25 px-3.5 py-2.5 text-sm text-white font-medium">
      <span className="text-[var(--brand)]">{icon}</span>
      {label}
    </li>
  );
}
