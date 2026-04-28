import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { PageHero } from "@/components/PageHero";
import { vistasRepo, type VistaFiltros } from "@/lib/vistas";
import { casosRepo } from "@/lib/casos";
import type { Caso } from "@vuelvecasa/shared";
import { db } from "@/lib/db";
import { FLAGS } from "@/lib/flags";
import { CasoCard } from "@/components/CasoCard";
import { DeleteVistaButton } from "@/components/DeleteVistaButton";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const v = await vistasRepo.get(id);
  if (!v) return { title: "Vista no encontrada", robots: { index: false } };
  return {
    title: `${v.nombre} · Vista de Comunidad`,
    description: `Filtros: ${summarize(v.filtros)}`,
    robots: v.publica ? { index: false, follow: true } : { index: false, follow: false },
  };
}

export default async function VistaDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const vista = await vistasRepo.get(id);
  if (!vista) return notFound();

  let usuarioId: string | null = null;
  if (FLAGS.auth) {
    const u = await currentUser();
    if (u) {
      const row = await db.getUserByClerkId(u.id);
      usuarioId = (row?.id as string | undefined) ?? null;
    }
  }

  const isOwner = usuarioId === vista.usuario_id;
  if (!isOwner && !vista.publica) {
    redirect("/chat");
  }

  const f = vista.filtros;
  const casos = await casosRepo.listPublic({
    tipo: f.tipo?.[0] as Caso["tipo"] | undefined,
    especie: f.especies?.[0] as Caso["especie"] | undefined,
    ciudad: f.ciudad,
    municipio: f.municipio,
    radio_km: f.radio_km,
    limit: 60,
    offset: 0,
  });

  const filtered = (casos as unknown as Caso[]).filter((c) => matchesClient(c, f));

  return (
    <>
      <PageHero
        eyebrow="Vista guardada"
        title={<span>{vista.nombre}</span>}
        subtitle={summarize(vista.filtros)}
        imageSeed={22}
      />
      <section className="py-10 md:py-14">
        <div className="vc-container">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <Link href="/chat" className="text-sm font-semibold text-[var(--brand-ink)]">
              ← Volver a Comunidad
            </Link>
            <div className="flex items-center gap-2">
              {vista.publica ? (
                <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--brand-soft)] uppercase tracking-wide font-bold text-[var(--brand-ink)]">
                  Pública · {vista.suscriptores} suscriptor
                  {vista.suscriptores === 1 ? "" : "es"}
                </span>
              ) : null}
              {isOwner ? <DeleteVistaButton id={vista.id} /> : null}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="vc-card !p-10 text-center">
              <p className="text-lg font-semibold text-[var(--ink)]">
                Sin coincidencias todavía
              </p>
              <p className="mt-2 text-[var(--ink-soft)]">
                Cuando aparezcan casos que cumplan estos filtros, los verás aquí.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((c) => (
                <li key={c.id}>
                  <CasoCard caso={c as Caso} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function matchesClient(c: Caso, f: VistaFiltros): boolean {
  if (f.tipo?.length && !f.tipo.includes(c.tipo)) return false;
  if (f.especies?.length && !f.especies.includes(c.especie)) return false;
  if (
    f.colonia &&
    c.colonia &&
    !c.colonia.toLowerCase().includes(f.colonia.toLowerCase())
  )
    return false;
  if (f.estado_caso?.length && !f.estado_caso.includes(c.estado as never))
    return false;
  if (f.recientes_horas) {
    const cutoff = Date.now() - f.recientes_horas * 3_600_000;
    if (new Date(c.created_at).getTime() < cutoff) return false;
  }
  return true;
}

function summarize(f: VistaFiltros): string {
  const parts: string[] = [];
  if (f.tipo?.length) parts.push(f.tipo.join(" / "));
  if (f.especies?.length) parts.push(f.especies.join(" + "));
  if (f.ciudad) parts.push(f.ciudad);
  if (f.colonia) parts.push(f.colonia);
  if (f.radio_km) parts.push(`${f.radio_km}km`);
  if (f.recientes_horas) parts.push(`<${f.recientes_horas}h`);
  if (f.solo_verificados) parts.push("verificados");
  return parts.join(" · ") || "Sin filtros";
}
