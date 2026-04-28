import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { casosRepo } from "@/lib/casos";
import { SITE } from "@/lib/site";
import { AvistamientoForm } from "@/components/forms/AvistamientoForm";
import { ShareButtons } from "@/components/ShareButtons";
import { CasoBanner } from "@/components/CasoBanner";
import { DonationWidget } from "@/components/DonationWidget";
import { DonationProgress } from "@/components/DonationProgress";
import { DonationAppeal } from "@/components/DonationAppeal";
import MapView from "@/components/MapViewLazy";
import {
  IconPaw,
  IconPin,
  IconHeart,
  IconShield,
  IconWhats,
  IconChat,
} from "@/components/Icons";

type Params = Promise<{ slug: string }>;
type SP = Promise<{ creado?: string; gracias?: string; canceled?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const caso = await casosRepo.getBySlug(slug);
  if (!caso) return { robots: { index: false, follow: false } };
  const title =
    caso.tipo === "perdida"
      ? `Se busca: ${caso.nombre || caso.especie} en ${caso.ciudad}`
      : caso.tipo === "encontrada"
      ? `${caso.especie} encontrada en ${caso.ciudad} — ¿es tuya?`
      : `Avistamiento en ${caso.ciudad}`;
  const description =
    caso.descripcion ||
    `${caso.especie} ${caso.color ? caso.color : ""} reportado en ${caso.ciudad}. Ayúdanos a que vuelva a casa.`;
  const firstPhoto = caso.fotos?.[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: `/casos/${caso.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE.url}/casos/${caso.slug}`,
      images: firstPhoto ? [{ url: firstPhoto, width: 1200, height: 900 }] : undefined,
    },
    twitter: {
      card: firstPhoto ? "summary_large_image" : "summary",
      title,
      description,
      images: firstPhoto ? [firstPhoto] : undefined,
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SP;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const bannerVariant = sp.creado
    ? ("creado" as const)
    : sp.gracias
    ? ("gracias" as const)
    : sp.canceled
    ? ("canceled" as const)
    : null;
  const caso = await casosRepo.getBySlug(slug);
  if (!caso) return notFound();

  const [avistamientos, updates] = await Promise.all([
    casosRepo.listAvistamientos(caso.id),
    casosRepo.listUpdates(caso.id),
  ]);

  // Increment views best-effort (no bloquear).
  casosRepo.incrementViews(caso.id).catch(() => {});

  const firstPhoto = caso.fotos?.[0]?.url;
  const fotoExtras = caso.fotos?.slice(1, 5) ?? [];

  const ld =
    caso.tipo === "perdida"
      ? {
          "@context": "https://schema.org",
          "@type": "LostPost",
          url: `${SITE.url}/casos/${caso.slug}`,
          name: `Mascota perdida: ${caso.nombre || caso.especie}`,
          description: caso.descripcion,
          image: caso.fotos?.[0]?.url,
          areaServed: { "@type": "City", name: caso.ciudad },
          datePosted: caso.created_at,
          identifier: caso.slug,
        }
      : {
          "@context": "https://schema.org",
          "@type": "FoundPost",
          url: `${SITE.url}/casos/${caso.slug}`,
          name: `Mascota encontrada: ${caso.especie}`,
          description: caso.descripcion,
          image: caso.fotos?.[0]?.url,
          areaServed: { "@type": "City", name: caso.ciudad },
          datePosted: caso.created_at,
          identifier: caso.slug,
        };

  const title =
    caso.tipo === "perdida"
      ? `Se busca: ${caso.nombre || caso.especie}`
      : caso.tipo === "encontrada"
      ? `${caso.especie[0].toUpperCase()}${caso.especie.slice(1)} encontrada`
      : "Avistamiento";

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Casos", item: `${SITE.url}/casos` },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE.url}/casos/${caso.slug}`,
      },
    ],
  };

  return (
    <>
      <Script
        id={`ld-caso-${caso.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <Script
        id={`ld-caso-${caso.slug}-breadcrumb`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="vc-container py-8 md:py-12">
        {bannerVariant && <CasoBanner variant={bannerVariant} />}
        {bannerVariant === "creado" && (
          <div className="mt-6">
            <DonationAppeal variant="caso-publicado" />
          </div>
        )}

        <nav className="mt-6 text-sm text-[var(--ink-soft)] flex gap-2 flex-wrap">
          <Link href="/casos" className="hover:text-[var(--ink)]">
            Todos los casos
          </Link>
          <span>/</span>
          <Link
            href={`/casos?ciudad=${encodeURIComponent(caso.ciudad)}`}
            className="hover:text-[var(--ink)]"
          >
            {caso.ciudad}
          </Link>
          <span>/</span>
          <span className="text-[var(--ink)] font-medium">{title}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          {/* Fotos */}
          <section>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--bg-alt)]">
              {firstPhoto ? (
                <Image
                  src={firstPhoto}
                  alt={caso.nombre ?? caso.especie}
                  fill
                  priority
                  sizes="(max-width:1024px) 100vw, 60vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                  <IconPaw size={64} />
                </div>
              )}
              <span
                className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  caso.tipo === "perdida"
                    ? "bg-[var(--brand)] text-white"
                    : caso.tipo === "encontrada"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--ink)] text-white"
                }`}
              >
                {caso.tipo}
              </span>
            </div>
            {fotoExtras.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {fotoExtras.map((f) => (
                  <div
                    key={f.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-alt)]"
                  >
                    <Image
                      src={f.url}
                      alt=""
                      fill
                      sizes="(max-width:768px) 25vw, 15vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Info */}
          <section>
            <header>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {title}
                {caso.nombre ? (
                  <span className="block text-[var(--brand)] mt-1">
                    {caso.nombre}
                  </span>
                ) : null}
              </h1>
              <p className="mt-3 text-[var(--ink-soft)] flex items-center gap-2">
                <IconPin size={16} />
                {caso.ciudad}
                {caso.colonia ? ` · ${caso.colonia}` : ""}
              </p>
              <p className="text-sm text-[var(--muted)]">
                Publicado el{" "}
                {new Date(caso.created_at).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {caso.vistas} vistas
              </p>
            </header>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <DataItem label="Especie" value={caso.especie} />
              {caso.raza && <DataItem label="Raza" value={caso.raza} />}
              {caso.color && <DataItem label="Color" value={caso.color} />}
              {caso.tamano && <DataItem label="Tamaño" value={caso.tamano} />}
              {caso.edad_aprox && <DataItem label="Edad" value={caso.edad_aprox} />}
              {caso.sexo && <DataItem label="Sexo" value={caso.sexo} />}
              {caso.tiene_chip !== null && (
                <DataItem label="Chip" value={caso.tiene_chip ? "Sí" : "No"} />
              )}
              {caso.tiene_collar !== null && (
                <DataItem label="Collar" value={caso.tiene_collar ? "Sí" : "No"} />
              )}
              <DataItem
                label="Fecha del evento"
                value={new Date(caso.fecha_evento).toLocaleDateString("es-MX")}
              />
            </dl>

            {caso.senas && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Señas particulares
                </h3>
                <p className="mt-1 text-[var(--ink)]">{caso.senas}</p>
              </div>
            )}

            {caso.descripcion && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Historia
                </h3>
                <p className="mt-1 text-[var(--ink)] whitespace-pre-wrap">
                  {caso.descripcion}
                </p>
              </div>
            )}

            {/* Contacto */}
            <div className="mt-8 vc-card bg-[var(--bg-alt)]">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
                Contacto
              </h3>
              <p className="mt-2 font-semibold">
                {caso.contacto_nombre || caso.autor?.nombre || "VuelveaCasa"}
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {caso.contacto_whatsapp && (
                  <a
                    href={`https://wa.me/${caso.contacto_whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vc-btn vc-btn-primary text-sm"
                  >
                    <IconWhats size={18} /> Escribir por WhatsApp
                  </a>
                )}
                {caso.contacto_telefono && (
                  <a
                    href={`tel:${caso.contacto_telefono}`}
                    className="vc-btn vc-btn-outline text-sm"
                  >
                    Llamar a {caso.contacto_telefono}
                  </a>
                )}
                {caso.contacto_email && (
                  <a
                    href={`mailto:${caso.contacto_email}`}
                    className="vc-btn vc-btn-outline text-sm"
                  >
                    <IconChat size={18} /> {caso.contacto_email}
                  </a>
                )}
              </div>
            </div>

            {/* Compartir */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                Ayuda difundiendo
              </h3>
              <ShareButtons
                url={`/casos/${caso.slug}`}
                title={`${title} en ${caso.ciudad} · VuelveaCasa`}
              />
            </div>

            {/* Hilo del caso (chat) */}
            <div className="mt-6">
              <Link
                href={`/casos/${caso.slug}/chat`}
                className="vc-btn vc-btn-primary w-full justify-center"
              >
                <IconChat size={18} /> Hablar del caso
              </Link>
              <p className="mt-2 text-xs text-[var(--muted)] text-center">
                Comparte pistas o pregunta. Mensajes moderados.
              </p>
            </div>

            {/* Donación progreso */}
            {(caso.donado_mxn > 0 || caso.meta_donacion) && (
              <div className="mt-6">
                <DonationProgress
                  meta={caso.meta_donacion}
                  donado={caso.donado_mxn}
                />
              </div>
            )}
          </section>
        </div>

        {/* Mapa */}
        {caso.lat && caso.lng && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <IconPin size={22} /> Zona de {caso.tipo === "encontrada" ? "hallazgo" : "extravío"}
            </h2>
            <MapView lat={Number(caso.lat)} lng={Number(caso.lng)} radio={caso.radio_m ?? 2000} height={380} />
            <p className="mt-2 text-xs text-[var(--muted)]">
              El punto mostrado incluye un radio de difusión aproximado. La dirección exacta no se comparte públicamente.
            </p>
          </section>
        )}

        {/* Donación para rescates (si tipo encontrada o si hay meta) */}
        {(caso.tipo === "encontrada" || caso.meta_donacion) && (
          <section className="mt-12 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
            <div>
              <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                <IconHeart size={22} /> Apoya a este rescate
              </h2>
              <p className="text-[var(--ink-soft)] leading-relaxed">
                Si esta mascota necesita atención veterinaria, transporte o hogar temporal, tu donación va directa a cubrir esos gastos. Cada peso queda registrado en la transparencia del caso.
              </p>
              <DonationProgress meta={caso.meta_donacion} donado={caso.donado_mxn} />
            </div>
            <div>
              <DonationWidget
                casoId={caso.id}
                casoSlug={caso.slug}
                casoTitulo={title}
                compact
              />
            </div>
          </section>
        )}

        {/* Avistamientos */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <IconShield size={22} /> Avistamientos
            </h2>
            {avistamientos.length === 0 ? (
              <p className="text-[var(--ink-soft)]">
                Aún no hay avistamientos públicos reportados. Si viste a esta mascota, ayúdanos reportando.
              </p>
            ) : (
              <ul className="space-y-3">
                {avistamientos.map((a) => (
                  <li key={a.id} className="vc-card">
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(a.fecha_avistado).toLocaleString("es-MX")}
                      {a.autor_nombre ? ` · por ${a.autor_nombre}` : ""}
                    </p>
                    <p className="mt-1 text-[var(--ink)] whitespace-pre-wrap">
                      {a.descripcion}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {/* Updates del dueño */}
            {updates.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <IconHeart size={22} /> Actualizaciones del caso
                </h2>
                <ul className="space-y-3">
                  {updates.map((u) => (
                    <li key={u.id} className="vc-card bg-[var(--bg-alt)]">
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(u.created_at).toLocaleString("es-MX")}
                        {u.autor_nombre ? ` · ${u.autor_nombre}` : ""}
                      </p>
                      <p className="mt-1 text-[var(--ink)] whitespace-pre-wrap">
                        {u.mensaje}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside>
            <AvistamientoForm casoId={caso.id} />
          </aside>
        </section>
      </div>
    </>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--muted)] uppercase text-xs tracking-wider">
        {label}
      </dt>
      <dd className="text-[var(--ink)] font-medium">{value}</dd>
    </div>
  );
}
