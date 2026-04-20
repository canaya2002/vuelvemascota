import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { casosRepo, type CasoEspecie, type CasoTipo } from "@/lib/casos";
import { CITIES } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { IconPaw, IconArrow, IconPin } from "@/components/Icons";
import { NearMeButton } from "@/components/NearMeButton";
import { ESTADOS_MX, isEstadoMx } from "@/lib/estados";
import CasosMap from "@/components/CasosMapLazy";

export const metadata: Metadata = {
  title: "Casos activos — Mascotas perdidas y encontradas en México",
  description:
    "Explora todos los casos activos de mascotas perdidas, encontradas y avistamientos en México. Filtra por ciudad y especie.",
  alternates: { canonical: "/casos" },
};

type SearchParams = Promise<{
  tipo?: string;
  especie?: string;
  estado?: string;
  ciudad?: string;
  municipio?: string;
  q?: string;
  lat?: string;
  lng?: string;
  radio_km?: string;
  vista?: string;
}>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tipo = (["perdida", "encontrada", "avistamiento"].includes(sp.tipo ?? "")
    ? sp.tipo
    : undefined) as CasoTipo | undefined;
  const especie = (["perro", "gato", "otro"].includes(sp.especie ?? "")
    ? sp.especie
    : undefined) as CasoEspecie | undefined;
  const estado = sp.estado && isEstadoMx(sp.estado) ? sp.estado : undefined;
  const ciudad = sp.ciudad || undefined;
  const municipio = sp.municipio || undefined;
  const q = (sp.q || "").trim() || undefined;
  const latNum = Number(sp.lat);
  const lngNum = Number(sp.lng);
  const radioKm = Number(sp.radio_km || 10);
  const geoOn =
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    Math.abs(latNum) <= 90 &&
    Math.abs(lngNum) <= 180 &&
    (sp.lat ?? "") !== "";
  const vista = sp.vista === "mapa" ? "mapa" : "lista";

  const casos = await casosRepo.listPublic({
    tipo,
    especie,
    estado,
    ciudad,
    municipio,
    q,
    lat: geoOn ? latNum : undefined,
    lng: geoOn ? lngNum : undefined,
    radio_km: geoOn ? radioKm : undefined,
    limit: vista === "mapa" ? 200 : 48,
  });

  const currentQs = (override: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const map: Record<string, string | undefined> = {
      tipo,
      especie,
      estado,
      ciudad,
      municipio,
      q,
      lat: geoOn ? sp.lat : undefined,
      lng: geoOn ? sp.lng : undefined,
      radio_km: geoOn ? String(radioKm) : undefined,
      vista: vista === "mapa" ? "mapa" : undefined,
      ...override,
    };
    for (const [k, v] of Object.entries(map)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `?${s}` : "";
  };

  return (
    <>
      <PageHero
        eyebrow="Casos activos"
        title={<>Mascotas que <span className="text-[var(--brand)]">esperan volver a casa</span>.</>}
        subtitle="Todos los reportes abiertos en la comunidad. Filtra por ciudad, especie o tipo para encontrar coincidencias."
        imageSeed={2}
      />

      <section className="py-12">
        <div className="vc-container">
          {/* Búsqueda */}
          <form action="/casos" method="get" className="mb-4 flex items-center gap-2 flex-wrap">
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            {especie && <input type="hidden" name="especie" value={especie} />}
            {ciudad && <input type="hidden" name="ciudad" value={ciudad} />}
            {estado && <input type="hidden" name="estado" value={estado} />}
            {municipio && <input type="hidden" name="municipio" value={municipio} />}
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por nombre, raza, color, colonia…"
              className="vc-input flex-1 min-w-[220px]"
              aria-label="Buscar casos"
            />
            <button type="submit" className="vc-btn vc-btn-dark text-sm">
              Buscar
            </button>
            {q && (
              <Link
                href={`/casos${currentQs({ q: undefined })}`}
                className="vc-btn vc-btn-outline text-sm"
              >
                Limpiar
              </Link>
            )}
          </form>

          {/* Estado + municipio */}
          <form
            action="/casos"
            method="get"
            className="mb-4 flex items-center gap-2 flex-wrap"
          >
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            {especie && <input type="hidden" name="especie" value={especie} />}
            {ciudad && <input type="hidden" name="ciudad" value={ciudad} />}
            {q && <input type="hidden" name="q" value={q} />}
            <label className="text-sm text-[var(--ink-soft)]">Estado</label>
            <select
              name="estado"
              defaultValue={estado ?? ""}
              className="vc-input text-sm !py-2 !px-3 w-auto"
            >
              <option value="">Todos los estados</option>
              {ESTADOS_MX.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <label className="text-sm text-[var(--ink-soft)]">Alcaldía/municipio</label>
            <input
              type="text"
              name="municipio"
              defaultValue={municipio ?? ""}
              placeholder="Ej. Coyoacán"
              className="vc-input text-sm !py-2 !px-3 w-auto"
            />
            <button type="submit" className="vc-btn vc-btn-outline text-sm">
              Aplicar
            </button>
            {(estado || municipio) && (
              <Link
                href={`/casos${currentQs({ estado: undefined, municipio: undefined })}`}
                className="text-xs text-[var(--muted)] underline"
              >
                Quitar
              </Link>
            )}
          </form>

          {/* Toggle lista / mapa */}
          <div className="mb-6 inline-flex rounded-full border border-[var(--line-strong)] bg-white p-1">
            <Link
              href={`/casos${currentQs({ vista: undefined })}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                vista === "lista"
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--ink-soft)]"
              }`}
            >
              Lista
            </Link>
            <Link
              href={`/casos${currentQs({ vista: "mapa" })}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                vista === "mapa"
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--ink-soft)]"
              }`}
            >
              Mapa
            </Link>
          </div>

          {q && (
            <p className="mb-2 text-sm text-[var(--ink-soft)]">
              Resultados para <strong>“{q}”</strong>
              {casos.length === 0 && " — sin coincidencias"}
            </p>
          )}

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <NearMeButton
              active={geoOn}
              currentQs={`/casos${currentQs({})}`}
            />
            {geoOn && (
              <p className="text-sm text-[var(--ink-soft)]">
                Mostrando casos en un radio de{" "}
                <strong>{radioKm} km</strong> alrededor de tu ubicación.
              </p>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 items-center mb-8">
            <FilterLink href={`/casos${currentQs({ tipo: undefined })}`} active={!tipo}>
              Todos
            </FilterLink>
            <FilterLink href={`/casos${currentQs({ tipo: "perdida" })}`} active={tipo === "perdida"}>
              Perdidas
            </FilterLink>
            <FilterLink
              href={`/casos${currentQs({ tipo: "encontrada" })}`}
              active={tipo === "encontrada"}
            >
              Encontradas
            </FilterLink>
            <FilterLink
              href={`/casos${currentQs({ tipo: "avistamiento" })}`}
              active={tipo === "avistamiento"}
            >
              Avistamientos
            </FilterLink>

            <span className="mx-2 h-6 border-l border-[var(--line)]" aria-hidden />

            <FilterLink href={`/casos${currentQs({ especie: undefined })}`} active={!especie}>
              Todas las especies
            </FilterLink>
            <FilterLink
              href={`/casos${currentQs({ especie: "perro" })}`}
              active={especie === "perro"}
            >
              Perros
            </FilterLink>
            <FilterLink
              href={`/casos${currentQs({ especie: "gato" })}`}
              active={especie === "gato"}
            >
              Gatos
            </FilterLink>
          </div>

          {/* Ciudades */}
          <div className="flex flex-wrap gap-2 mb-10">
            <FilterLink href={`/casos${currentQs({ ciudad: undefined })}`} active={!ciudad} small>
              Todas las ciudades
            </FilterLink>
            {CITIES.map((c) => (
              <FilterLink
                key={c.slug}
                href={`/casos${currentQs({ ciudad: c.name })}`}
                active={ciudad === c.name}
                small
              >
                {c.name}
              </FilterLink>
            ))}
          </div>

          {casos.length === 0 ? (
            <EmptyState />
          ) : vista === "mapa" ? (
            <CasosMap
              casos={casos.map((c) => ({
                id: c.id,
                slug: c.slug,
                tipo: c.tipo,
                especie: c.especie,
                nombre: c.nombre ?? null,
                ciudad: c.ciudad,
                lat: c.lat,
                lng: c.lng,
              }))}
            />
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {casos.map((c) => {
                const foto = c.fotos?.[0]?.url;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/casos/${c.slug}`}
                      className="group vc-card !p-0 overflow-hidden flex flex-col h-full hover:border-[var(--ink)]"
                    >
                      <div className="relative aspect-[4/3] bg-[var(--bg-alt)]">
                        {foto ? (
                          <Image
                            src={foto}
                            alt={c.nombre ?? c.especie}
                            fill
                            sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                            <IconPaw size={46} />
                          </div>
                        )}
                        <span
                          className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            c.tipo === "perdida"
                              ? "bg-[var(--brand)] text-white"
                              : c.tipo === "encontrada"
                              ? "bg-[var(--accent)] text-white"
                              : "bg-[var(--ink)] text-white"
                          }`}
                        >
                          {c.tipo}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-lg leading-tight">
                          {c.nombre ||
                            `${c.especie[0].toUpperCase()}${c.especie.slice(1)} ${
                              c.color ? "· " + c.color : ""
                            }`}
                        </h3>
                        <p className="text-sm text-[var(--ink-soft)] mt-1 flex items-center gap-1">
                          <IconPin size={14} />
                          {c.ciudad}
                          {c.colonia ? ` · ${c.colonia}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {new Date(c.fecha_evento).toLocaleDateString("es-MX")}
                        </p>
                        {c.descripcion && (
                          <p className="mt-2 text-sm text-[var(--ink-soft)] line-clamp-2">
                            {c.descripcion}
                          </p>
                        )}
                        <span className="mt-auto pt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-ink)]">
                          Ver caso <IconArrow size={12} />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function FilterLink({
  href,
  active,
  children,
  small,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border transition-colors ${
        small ? "text-xs px-3 py-1" : "text-sm px-4 py-1.5"
      } ${
        active
          ? "bg-[var(--ink)] text-white border-[var(--ink)]"
          : "border-[var(--line-strong)] bg-white text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="vc-card border-dashed bg-[var(--bg-alt)] text-center py-16">
      <span className="inline-flex w-14 h-14 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center mx-auto">
        <IconPaw size={26} />
      </span>
      <h2 className="mt-5 text-xl font-semibold">Sin casos con estos filtros</h2>
      <p className="mt-2 text-[var(--ink-soft)] max-w-md mx-auto">
        Prueba limpiando filtros o activando alertas para que te avisemos cuando aparezcan casos en tu zona.
      </p>
      <div className="mt-6 flex gap-3 justify-center flex-wrap">
        <Link href="/casos" className="vc-btn vc-btn-outline">
          Ver todos
        </Link>
        <Link href="/registro" className="vc-btn vc-btn-primary">
          Activar alertas
        </Link>
      </div>
    </div>
  );
}
