import Link from "next/link";
import Image from "next/image";
import { pickRange } from "@/lib/images";
import {
  IconArrow,
  IconSearch,
  IconBell,
  IconHeart,
  IconPaw,
} from "@/components/Icons";

const FLOAT_IMGS = pickRange(30, 4);

const SUGGESTIONS = [
  {
    href: "/casos",
    label: "Ver casos activos",
    icon: <IconSearch size={16} />,
  },
  {
    href: "/alertas",
    label: "Activar alertas en tu zona",
    icon: <IconBell size={16} />,
  },
  {
    href: "/donar",
    label: "Apoyar con una donación",
    icon: <IconHeart size={16} />,
  },
  {
    href: "/como-funciona",
    label: "Saber cómo funciona",
    icon: <IconPaw size={16} />,
  },
];

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(800px 500px at 12% 0%, rgba(184,38,74,0.10), transparent 60%), radial-gradient(700px 460px at 88% 100%, rgba(21,122,85,0.06), transparent 55%)",
        }}
      />
      <div className="relative vc-container py-20 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 vc-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] font-semibold text-xs uppercase tracking-[0.14em]">
            Error 404
          </span>
          <h1 className="mt-5 text-[2.6rem] md:text-6xl lg:text-[4.5rem] font-semibold leading-[1.04] tracking-tight">
            Se nos escapó <br className="hidden md:block" />
            esta <span className="vc-gradient-text">página</span>.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[var(--ink-soft)] max-w-xl leading-relaxed">
            Pero las mascotas no se nos escapan. Vamos a llevarte a algún lugar
            útil de la red.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/" className="vc-btn vc-btn-primary">
              Volver al inicio <IconArrow size={16} />
            </Link>
            <Link href="/casos" className="vc-btn vc-btn-outline">
              Buscar casos activos
            </Link>
          </div>

          <div className="mt-12">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-semibold mb-4">
              ¿O quizá buscabas esto?
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl">
              {SUGGESTIONS.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="group flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/70 backdrop-blur-md px-4 py-3 text-sm font-medium text-[var(--ink)] hover:border-[var(--ink)] hover:bg-white transition-all"
                  >
                    <span className="inline-flex w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center">
                      {s.icon}
                    </span>
                    <span className="flex-1">{s.label}</span>
                    <span className="text-[var(--muted)] transition-transform group-hover:translate-x-0.5">
                      <IconArrow size={14} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Photo collage */}
        <div className="lg:col-span-5 relative aspect-[4/5] vc-fade-up vc-fade-up-delay-2">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-3">
            <div className="relative col-span-2 row-span-2 rounded-3xl overflow-hidden ring-1 ring-[var(--line)] shadow-lg vc-tilt">
              <Image
                src={FLOAT_IMGS[0]}
                alt=""
                fill
                priority
                sizes="(max-width:1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
              />
            </div>
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-[var(--line)] shadow-md vc-float">
              <Image
                src={FLOAT_IMGS[1]}
                alt=""
                fill
                sizes="(max-width:1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
            <div
              className="relative rounded-2xl overflow-hidden ring-1 ring-[var(--line)] shadow-md vc-float"
              style={{ animationDelay: "1.6s" }}
            >
              <Image
                src={FLOAT_IMGS[2]}
                alt=""
                fill
                sizes="(max-width:1024px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Big "404" stenciled behind */}
          <div
            aria-hidden
            className="hidden lg:block absolute -top-4 -right-2 text-[12rem] leading-none font-bold tracking-tighter text-[var(--brand-soft)]/60 select-none pointer-events-none -z-10"
          >
            404
          </div>
        </div>
      </div>
    </section>
  );
}
