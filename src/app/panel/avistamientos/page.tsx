import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { casosRepo } from "@/lib/casos";
import { FLAGS } from "@/lib/flags";
import { IconPaw, IconArrow, IconShield } from "@/components/Icons";

export const metadata = { title: "Mis avistamientos" };

export default async function Page() {
  let rows: Awaited<
    ReturnType<typeof casosRepo.listMyReportedAvistamientos>
  > = [];
  if (FLAGS.auth) {
    const user = await currentUser();
    if (user) rows = await casosRepo.listMyReportedAvistamientos(user.id);
  }

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">Mis avistamientos</h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          Los avistamientos que reportaste a otros casos. Cada uno ayudó a difundir una pista.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="vc-card border-dashed bg-[var(--bg-alt)] text-center py-14">
          <span className="inline-flex w-14 h-14 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center mx-auto">
            <IconShield size={26} />
          </span>
          <h2 className="mt-5 text-xl font-semibold">Aún no reportaste avistamientos</h2>
          <p className="mt-2 text-[var(--ink-soft)] max-w-md mx-auto">
            Si ves una mascota perdida en tu zona, entra al caso y deja un reporte. Incluso un detalle puede cambiar la historia.
          </p>
          <Link href="/casos" className="vc-btn vc-btn-primary mt-6">
            Ver casos activos <IconArrow size={14} />
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/casos/${r.caso_slug}`}
                className="vc-card !p-0 overflow-hidden flex gap-4 items-start hover:border-[var(--ink)]"
              >
                <div className="relative w-28 h-28 shrink-0 bg-[var(--bg-alt)]">
                  {r.caso_foto ? (
                    <Image
                      src={r.caso_foto}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                      <IconPaw size={28} />
                    </div>
                  )}
                </div>
                <div className="py-4 pr-4 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--brand-ink)]">
                      {r.caso_tipo} · {r.caso_especie}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                        r.estado === "confirmado"
                          ? "bg-[var(--accent-soft)] text-[#0d6b52]"
                          : r.estado === "pendiente"
                          ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                          : "bg-[#e4e9ef] text-[#0b1f33]"
                      }`}
                    >
                      {r.estado}
                    </span>
                  </div>
                  <h3 className="mt-1 font-semibold">
                    {r.caso_nombre || `${r.caso_especie} en ${r.caso_ciudad}`}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Avistado el{" "}
                    {new Date(r.fecha_avistado).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · reportado {new Date(r.created_at).toLocaleDateString("es-MX")}
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink)] line-clamp-2">
                    {r.descripcion}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
