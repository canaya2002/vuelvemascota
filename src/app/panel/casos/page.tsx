import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { casosRepo } from "@/lib/casos";
import { FLAGS } from "@/lib/flags";
import { IconArrow, IconPaw } from "@/components/Icons";

export const metadata = { title: "Mis casos" };

export default async function Page() {
  let casos: Awaited<ReturnType<typeof casosRepo.listMine>> = [];
  if (FLAGS.auth) {
    const user = await currentUser();
    if (user) casos = await casosRepo.listMine(user.id);
  }

  return (
    <div>
      <header className="mb-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Mis casos</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Los reportes que has publicado. Puedes editarlos, cerrarlos o marcarlos reencontrados.
          </p>
        </div>
        <Link href="/panel/casos/nuevo" className="vc-btn vc-btn-primary">
          Nuevo caso <IconArrow size={16} />
        </Link>
      </header>

      {casos.length === 0 ? (
        <div className="vc-card border-dashed bg-[var(--bg-alt)] text-center py-14">
          <span className="inline-flex w-14 h-14 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center mx-auto">
            <IconPaw size={26} />
          </span>
          <h2 className="mt-5 text-xl font-semibold">Todavía no tienes casos</h2>
          <p className="mt-2 text-[var(--ink-soft)] max-w-md mx-auto">
            Crea tu primer reporte con fotos y ubicación. Se publica en minutos y activamos tu zona.
          </p>
          <Link href="/panel/casos/nuevo" className="vc-btn vc-btn-primary mt-6">
            Crear caso <IconArrow size={16} />
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {casos.map((c) => {
            const firstPhoto = c.fotos?.[0]?.url;
            return (
              <li key={c.id}>
                <Link
                  href={`/panel/casos/${c.slug}`}
                  className="vc-card !p-0 overflow-hidden block hover:border-[var(--ink)]"
                >
                  <div className="grid grid-cols-[120px_1fr]">
                    <div className="relative aspect-square bg-[var(--bg-alt)]">
                      {firstPhoto ? (
                        <Image
                          src={firstPhoto}
                          alt={c.nombre ?? c.especie}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                          <IconPaw size={28} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                            c.tipo === "perdida"
                              ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                              : c.tipo === "encontrada"
                              ? "bg-[var(--accent-soft)] text-[#0d6b52]"
                              : "bg-[#e4e9ef] text-[#0b1f33]"
                          }`}
                        >
                          {c.tipo}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                          {c.estado}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold">
                        {c.nombre || `${c.especie} ${c.color ? "· " + c.color : ""}`}
                      </h3>
                      <p className="text-sm text-[var(--ink-soft)]">
                        {c.ciudad}
                        {c.colonia ? ` · ${c.colonia}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {new Date(c.fecha_evento).toLocaleDateString("es-MX")} · {c.vistas} vistas
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
