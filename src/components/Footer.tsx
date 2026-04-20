import Link from "next/link";
import { IconPaw, IconInstagram, IconTiktok, IconFacebook } from "./Icons";
import { SITE, CITIES } from "@/lib/site";

const col1 = [
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/para-quien-es", label: "Para quién es" },
  { href: "/casos-de-uso", label: "Casos de uso" },
  { href: "/donar", label: "Cómo ayudar / donar" },
];

const col2 = [
  { href: "/rescatistas", label: "Rescatistas y refugios" },
  { href: "/veterinarias", label: "Veterinarias y aliados" },
  { href: "/aliados", label: "Directorio de aliados" },
  { href: "/alertas", label: "Alertas por zona" },
  { href: "/registro", label: "Registro anticipado" },
];

const col3 = [
  { href: "/mascota-perdida", label: "Mascota perdida" },
  { href: "/mascota-encontrada", label: "Mascota encontrada" },
  { href: "/perro-perdido", label: "Perro perdido" },
  { href: "/gato-perdido", label: "Gato perdido" },
  { href: "/reportar-mascota", label: "Reportar mascota" },
  { href: "/hogar-temporal", label: "Hogar temporal" },
  { href: "/ayuda-rescate", label: "Ayuda para rescate" },
];

const col4 = [
  { href: "/contacto", label: "Contacto" },
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/privacidad", label: "Aviso de privacidad" },
  { href: "/terminos", label: "Términos y condiciones" },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-[#0b1f33] text-white">
      <div className="vc-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                <IconPaw size={22} />
              </span>
              <span className="text-xl">VuelveaCasa</span>
            </Link>
            <p className="mt-4 text-white/70 max-w-sm text-sm leading-relaxed">
              La red comunitaria de México para reportar, localizar y ayudar a mascotas perdidas o en riesgo. Cercanía local, transparencia y acción inmediata.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition-colors"
              >
                <IconInstagram size={20} />
              </a>
              <a
                href={SITE.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition-colors"
              >
                <IconTiktok size={20} />
              </a>
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition-colors"
              >
                <IconFacebook size={20} />
              </a>
            </div>
          </div>

          <FooterCol title="Producto" links={col1} />
          <FooterCol title="Comunidad" links={col2} />
          <FooterCol title="Búsquedas frecuentes" links={col3} />
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-white/50 font-semibold">
              Ciudades con cobertura prioritaria
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/ciudades/${c.slug}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:text-right">
            <h4 className="text-xs uppercase tracking-wider text-white/50 font-semibold">
              Soporte y legal
            </h4>
            <ul className="mt-3 flex md:justify-end flex-wrap gap-x-5 gap-y-2 text-sm">
              {col4.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 text-xs text-white/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p>
            © {new Date().getFullYear()} {SITE.legal.razonSocial}. Hecho con cariño en México.
          </p>
          <p>
            Contacto:{" "}
            <a className="underline hover:text-white" href={`mailto:${SITE.contact.email}`}>
              {SITE.contact.email}
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
      <h4 className="text-xs uppercase tracking-wider text-white/50 font-semibold">
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-white/80 hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
