import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { aliadosRepo } from "@/lib/aliadosRepo";
import { CITIES } from "@/lib/site";
import { IconArrow, IconShield, IconStethoscope, IconPaw } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Directorio de aliados — Rescatistas y veterinarias verificadas",
  description:
    "Directorio público de rescatistas, refugios y veterinarias aliadas de VuelveaCasa en México. Encuentra apoyo verificado en tu ciudad.",
  alternates: { canonical: "/aliados" },
};

type SearchParams = Promise<{ tipo?: string; ciudad?: string }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tipo = ["rescatistas", "veterinarias", "aliados"].includes(sp.tipo ?? "")
    ? sp.tipo
    : undefined;
  const ciudad = sp.ciudad || undefined;

  const aliados = await aliadosRepo.listVerificados({ tipo, ciudad, limit: 120 });

  return (
    <>
      <PageHero
        eyebrow="Red verificada"
        title={<>Aliados <span className="text-[var(--brand)]">verificados</span> de la comunidad.</>}
        subtitle="Rescatistas, refugios y veterinarias que operan con la red de VuelveaCasa. Cada uno pasa una validación básica para generar confianza."
        imageSeed={30}
      />

      <Section>
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterLink href={`/aliados${query({ tipo: undefined, ciudad })}`} active={!tipo}>
            Todos
          </FilterLink>
          <FilterLink
            href={`/aliados${query({ tipo: "rescatistas", ciudad })}`}
            active={tipo === "rescatistas"}
          >
            Rescatistas
          </FilterLink>
          <FilterLink
            href={`/aliados${query({ tipo: "veterinarias", ciudad })}`}
            active={tipo === "veterinarias"}
          >
            Veterinarias
          </FilterLink>
          <FilterLink
            href={`/aliados${query({ tipo: "aliados", ciudad })}`}
            active={tipo === "aliados"}
          >
            Otras alianzas
          </FilterLink>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          <FilterLink href={`/aliados${query({ tipo, ciudad: undefined })}`} active={!ciudad} small>
            Todas las ciudades
          </FilterLink>
          {CITIES.map((c) => (
            <FilterLink
              key={c.slug}
              href={`/aliados${query({ tipo, ciudad: c.name })}`}
              active={ciudad === c.name}
              small
            >
              {c.name}
            </FilterLink>
          ))}
        </div>

        {aliados.length === 0 ? (
          <div className="vc-card border-dashed bg-[var(--bg-alt)] text-center py-14">
            <p className="text-[var(--ink-soft)]">
              Aún no hay aliados verificados con estos filtros.
            </p>
            <Link href="/rescatistas" className="vc-btn vc-btn-primary mt-6">
              Sumarme como aliado
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aliados.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/aliados/${a.slug}`}
                  className="group vc-card h-full flex flex-col hover:border-[var(--ink)]"
                >
                  <span
                    className={`inline-flex w-10 h-10 items-center justify-center rounded-xl ${
                      a.tipo === "veterinarias"
                        ? "bg-[var(--accent-soft)] text-[#0d6b52]"
                        : a.tipo === "rescatistas"
                        ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                        : "bg-[#e4e9ef] text-[#0b1f33]"
                    }`}
                    aria-hidden
                  >
                    {a.tipo === "veterinarias" ? (
                      <IconStethoscope size={20} />
                    ) : a.tipo === "rescatistas" ? (
                      <IconPaw size={20} />
                    ) : (
                      <IconShield size={20} />
                    )}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">
                    {a.organizacion}
                  </h3>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {a.ciudad} · {a.tipo}
                  </p>
                  {a.notas && (
                    <p className="mt-3 text-sm text-[var(--ink-soft)] line-clamp-3">
                      {a.notas}
                    </p>
                  )}
                  <span className="mt-auto pt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-ink)]">
                    Ver perfil <IconArrow size={12} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );

  function query(over: Record<string, string | undefined>) {
    const next = new URLSearchParams();
    const map: Record<string, string | undefined> = { tipo, ciudad, ...over };
    for (const [k, v] of Object.entries(map)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `?${s}` : "";
  }
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
      className={`rounded-full border font-medium transition-colors ${
        small ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"
      } ${
        active
          ? "bg-[var(--brand)] !text-white border-[var(--brand)]"
          : "border-[var(--line-strong)] bg-white !text-[var(--ink-soft)] hover:border-[var(--brand)] hover:!text-[var(--brand-ink)]"
      }`}
    >
      {children}
    </Link>
  );
}
