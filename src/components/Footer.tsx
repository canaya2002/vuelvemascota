import Link from "next/link";
import Image from "next/image";
import {
  IconInstagram,
  IconTiktok,
  IconFacebook,
  IconHeart,
  IconShield,
} from "./Icons";
import { SITE, CITIES } from "@/lib/site";

const col1 = [
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/para-quien-es", label: "Para quién es" },
  { href: "/casos-de-uso", label: "Casos de uso" },
  { href: "/donar", label: "Donar" },
];

const col2 = [
  { href: "/rescatistas", label: "Rescatistas y refugios" },
  { href: "/veterinarias", label: "Veterinarias aliadas" },
  { href: "/aliados", label: "Directorio de aliados" },
  { href: "/alertas", label: "Alertas por zona" },
];

const col3 = [
  { href: "/mascota-perdida", label: "Mascota perdida" },
  { href: "/mascota-encontrada", label: "Mascota encontrada" },
  { href: "/perro-perdido", label: "Perro perdido" },
  { href: "/gato-perdido", label: "Gato perdido" },
  { href: "/hogar-temporal", label: "Hogar temporal" },
];

const col5 = [
  { href: "/foros", label: "Foros de la comunidad" },
  { href: "/chat", label: "Chat de ayuda rápida" },
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" },
];

const col4 = [
  { href: "/privacidad", label: "Aviso de privacidad" },
  { href: "/terminos", label: "Términos y condiciones" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 bg-white text-[var(--ink)] border-t border-[var(--line)] overflow-hidden">

      <div className="relative vc-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="vc-logo text-[var(--ink)]"
              aria-label="VuelveaCasa — Inicio"
            >
              <span className="vc-logo-mark" aria-hidden>
                <Image
                  src="/icon.png"
                  alt=""
                  width={36}
                  height={36}
                  sizes="36px"
                />
              </span>
              <span className="text-xl">VuelveaCasa</span>
            </Link>
            <p className="mt-5 text-[var(--ink-soft)] max-w-sm text-sm leading-relaxed">
              La red comunitaria de México para reportar mascotas perdidas,
              activar alertas por zona y apoyar rescates verificados. Cercanía,
              transparencia y acción inmediata.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-soft)] px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-alt)]">
                <IconShield size={13} /> Aliados verificados
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-soft)] px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-alt)]">
                <IconHeart size={13} /> Donaciones rastreables
              </span>
            </div>

            <div className="mt-7 flex gap-3">
              <SocialLink
                href={SITE.social.instagram}
                label="Instagram"
                icon={<IconInstagram size={18} />}
              />
              <SocialLink
                href={SITE.social.tiktok}
                label="TikTok"
                icon={<IconTiktok size={18} />}
              />
              <SocialLink
                href={SITE.social.facebook}
                label="Facebook"
                icon={<IconFacebook size={18} />}
              />
            </div>
          </div>

          <FooterCol title="Plataforma" links={col1} />
          <FooterCol title="Comunidad" links={col2} />
          <FooterCol title="Buscar ayuda" links={col3} />
        </div>

        <div className="mt-14 pt-8 border-t border-[var(--line)] grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs uppercase tracking-[0.12em] text-[var(--muted)] font-semibold">
              Ciudades con cobertura prioritaria
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/ciudades/${c.slug}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-alt)] hover:bg-[var(--brand-soft)] text-[var(--ink-soft)] hover:text-[var(--brand-ink)] border border-[var(--line)] transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:text-right">
            <h4 className="text-xs uppercase tracking-[0.12em] text-[var(--muted)] font-semibold">
              Comunidad y soporte
            </h4>
            <ul className="mt-3 flex md:justify-end flex-wrap gap-x-5 gap-y-2 text-sm">
              {col5.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[var(--ink-soft)] hover:text-[var(--brand-ink)] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-3 flex md:justify-end flex-wrap gap-x-5 gap-y-2 text-xs">
              {col4.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 text-xs text-[var(--muted)] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p>
            © {new Date().getFullYear()} {SITE.legal.razonSocial}. Hecho en
            México con cariño por las mascotas.
          </p>
          <p>
            <a
              className="underline underline-offset-4 hover:text-[var(--ink)] transition-colors"
              href="/contacto"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.12em] text-[var(--muted)] font-semibold">
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-[var(--ink-soft)] hover:text-[var(--brand-ink)] transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full bg-[var(--bg-alt)] hover:bg-[var(--brand-soft)] text-[var(--ink-soft)] hover:text-[var(--brand-ink)] border border-[var(--line)] inline-flex items-center justify-center transition-colors"
    >
      {icon}
    </a>
  );
}
