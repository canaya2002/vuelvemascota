import Link from "next/link";
import Image from "next/image";
import {
  IconPaw,
  IconBell,
  IconHeart,
  IconSearch,
  IconShield,
  IconArrow,
} from "./Icons";
import { HERO_VIDEO, HERO_POSTER, pickRange } from "@/lib/images";

const HERO_FLOATS = pickRange(36, 3);

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

        <FloatingPhotos />

        <div className="relative z-10 vc-container py-20 md:py-24 text-white">
          <div className="max-w-3xl">
            <span className="vc-eyebrow !bg-white/18 !text-white border border-white/25 backdrop-blur-md vc-fade-up">
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--brand)] vc-pulse-ring" />
              <IconPaw size={14} /> Red comunitaria para mascotas en México
            </span>
            <h1 className="mt-6 text-[2.4rem] leading-[1.04] sm:text-5xl md:text-6xl lg:text-[4.6rem] font-bold tracking-tight vc-fade-up vc-fade-up-delay-1">
              Reporta, encuentra y ayuda a que{" "}
              <span className="vc-gradient-text">vuelvan a casa</span>.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed vc-fade-up vc-fade-up-delay-2">
              VuelveaCasa es la plataforma mexicana para reportar mascotas
              perdidas, avistar mascotas encontradas, activar alertas por zona,
              abrir hogares temporales y apoyar rescates reales.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 vc-fade-up vc-fade-up-delay-3">
              <Link href="/registro" className="vc-btn vc-btn-primary vc-shine">
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
          <span className="w-2 h-2 rounded-full bg-[var(--brand)] vc-pulse-ring" />
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

function FloatingPhotos() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
    >
      <div className="absolute top-[14%] right-[6%] w-[180px] h-[230px] rounded-[28px] overflow-hidden ring-1 ring-white/30 shadow-2xl vc-float">
        <Image
          src={HERO_FLOATS[0]}
          alt=""
          fill
          sizes="180px"
          className="object-cover"
        />
      </div>
      <div className="absolute top-[42%] right-[20%] w-[140px] h-[180px] rounded-[24px] overflow-hidden ring-1 ring-white/30 shadow-xl vc-float" style={{ animationDelay: "1.4s" }}>
        <Image
          src={HERO_FLOATS[1]}
          alt=""
          fill
          sizes="140px"
          className="object-cover"
        />
      </div>
      <div className="absolute bottom-[18%] right-[4%] w-[160px] h-[160px] rounded-full overflow-hidden ring-2 ring-white/40 shadow-2xl vc-float" style={{ animationDelay: "0.7s" }}>
        <Image
          src={HERO_FLOATS[2]}
          alt=""
          fill
          sizes="160px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
