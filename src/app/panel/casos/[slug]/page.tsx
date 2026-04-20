import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { casosRepo } from "@/lib/casos";
import { listMatchesForCaso } from "@/lib/matching";
import { FLAGS } from "@/lib/flags";
import { storageEnabled } from "@/lib/storage";
import { CasoEditForm } from "@/components/panel/CasoEditForm";
import { CasoStateForm } from "@/components/panel/CasoStateForm";
import { FotoManager } from "@/components/panel/FotoManager";
import { UpdateForm } from "@/components/panel/UpdateForm";
import { MatchCard } from "@/components/panel/MatchCard";
import { MetaDonacionForm } from "@/components/panel/MetaDonacionForm";
import { AvistamientoModerar } from "@/components/panel/AvistamientoModerar";
import { ShareButtons } from "@/components/ShareButtons";
import { IconArrow } from "@/components/Icons";

type Params = Promise<{ slug: string }>;

export const metadata = { title: "Editar caso" };

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  if (!FLAGS.auth) return notFound();
  const user = await currentUser();
  if (!user) return notFound();

  const caso = await casosRepo.getMineBySlug(user.id, slug);
  if (!caso) return notFound();

  const [updates, avistamientos, matches] = await Promise.all([
    casosRepo.listUpdates(caso.id),
    casosRepo.listAvistamientos(caso.id),
    listMatchesForCaso(caso.id, true),
  ]);

  return (
    <div>
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/panel/casos"
            className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            ← Mis casos
          </Link>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold">
            {caso.nombre || `${caso.especie} ${caso.ciudad}`}
          </h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            <span className="uppercase text-xs font-semibold text-[var(--brand-ink)] mr-2">
              {caso.tipo}
            </span>
            · Estado actual: <strong>{caso.estado}</strong> · {caso.vistas} vistas
          </p>
        </div>
        <Link href={`/casos/${caso.slug}`} className="vc-btn vc-btn-outline text-sm">
          Ver vista pública <IconArrow size={14} />
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        <div className="space-y-10">
          {/* Matches */}
          {matches.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-1">
                Coincidencias encontradas ({matches.length})
              </h2>
              <p className="text-sm text-[var(--ink-soft)] mb-4">
                Casos complementarios que podrían ser tu mascota (o el dueño que busca). Revísalos y confirma si es match real.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((m) => (
                  <li key={m.id}>
                    <MatchCard match={m} slug={caso.slug} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Fotos */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Fotos</h2>
            <FotoManager
              slug={caso.slug}
              fotos={(caso.fotos ?? []).map((f) => ({ id: f.id, url: f.url }))}
              storageEnabled={storageEnabled()}
            />
          </section>

          {/* Edición */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Datos del caso</h2>
            <CasoEditForm caso={caso} />
          </section>

          {/* Avistamientos (con moderación) */}
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Avistamientos ({avistamientos.length})
            </h2>
            {avistamientos.length === 0 ? (
              <p className="text-sm text-[var(--ink-soft)]">
                Aún nadie reporta avistamientos. Cuando lleguen, podrás confirmarlos o descartarlos aquí.
              </p>
            ) : (
              <ul className="space-y-3">
                {avistamientos.map((a) => (
                  <AvistamientoModerar key={a.id} a={a} />
                ))}
              </ul>
            )}
          </section>

          {/* Timeline */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Actualizaciones</h2>
            <UpdateForm casoId={caso.id} slug={caso.slug} />
            {updates.length > 0 && (
              <ul className="mt-6 space-y-3">
                {updates.map((u) => (
                  <li key={u.id} className="vc-card bg-[var(--bg-alt)]">
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(u.created_at).toLocaleString("es-MX")}
                    </p>
                    <p className="mt-1 text-[var(--ink)] whitespace-pre-wrap">
                      {u.mensaje}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="vc-card">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
              Estado del caso
            </h3>
            <CasoStateForm slug={caso.slug} estado={caso.estado} />
          </div>

          <div className="vc-card">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
              Compartir
            </h3>
            <ShareButtons
              url={`/casos/${caso.slug}`}
              title={`Ayúdame a encontrar a ${caso.nombre || caso.especie} en ${caso.ciudad}`}
            />
          </div>

          <div className="vc-card">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
              Donaciones
            </h3>
            <p className="text-sm text-[var(--ink-soft)] mb-3">
              Recaudado: <strong>${caso.donado_mxn.toLocaleString("es-MX")} MXN</strong>
            </p>
            <MetaDonacionForm slug={caso.slug} meta={caso.meta_donacion ?? null} />
          </div>

          {avistamientos.length > 0 && (
            <div className="vc-card">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                Avistamientos · {avistamientos.length}
              </h3>
              <p className="text-xs text-[var(--muted)] mb-2">
                {avistamientos.filter((a) => a.estado === "pendiente").length}{" "}
                pendientes de revisar.
              </p>
              <Link
                href="#"
                className="text-xs font-semibold text-[var(--brand-ink)] inline-flex items-center gap-1"
              >
                Moderar abajo <IconArrow size={12} />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
