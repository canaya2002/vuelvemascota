import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { aliadosRepo } from "@/lib/aliadosRepo";
import { casosRepo } from "@/lib/casos";
import { FLAGS } from "@/lib/flags";
import { AliadoReviewCard } from "@/components/panel/AliadoReviewCard";
import { AdminCasoRow } from "@/components/panel/AdminCasoRow";
import Link from "next/link";

export const metadata = { title: "Admin" };

export default async function Page() {
  if (!FLAGS.auth) redirect("/panel");
  const user = await currentUser();
  if (!user) redirect("/entrar");
  const meta = user.publicMetadata as { rol?: string } | undefined;
  if (meta?.rol !== "admin") redirect("/panel");

  const [pendientes, todos, ultimosCasos] = await Promise.all([
    aliadosRepo.listPending(),
    aliadosRepo.listAll(),
    casosRepo.listPublic({ limit: 12 }),
  ]);

  return (
    <div>
      <header className="mb-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Admin</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Revisa aliados pendientes, los últimos casos publicados y gestiona roles.
            Acceso restringido a cuentas con rol <code>admin</code>.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/panel/admin/usuarios"
            className="vc-btn vc-btn-outline text-sm"
          >
            Gestionar usuarios
          </Link>
          <a
            href="/api/admin/donaciones.csv"
            className="vc-btn vc-btn-outline text-sm"
          >
            Exportar donaciones CSV
          </a>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Aliados pendientes ({pendientes.length})
        </h2>
        {pendientes.length === 0 ? (
          <p className="text-[var(--ink-soft)]">Nada pendiente por verificar.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendientes.map((a) => (
              <li key={a.id}>
                <AliadoReviewCard aliado={a} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          Todos los aliados ({todos.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted)] uppercase text-xs">
                <th className="py-2">Org</th>
                <th>Tipo</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {todos.map((a) => (
                <tr key={a.id}>
                  <td className="py-3 font-medium">
                    {a.slug ? (
                      <Link
                        href={`/aliados/${a.slug}`}
                        className="text-[var(--brand-ink)] hover:underline"
                      >
                        {a.organizacion}
                      </Link>
                    ) : (
                      a.organizacion
                    )}
                  </td>
                  <td className="text-[var(--ink-soft)]">{a.tipo}</td>
                  <td className="text-[var(--ink-soft)]">{a.ciudad}</td>
                  <td>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-semibold ${
                        a.estado === "verificado"
                          ? "bg-[var(--accent-soft)] text-[#0d6b52]"
                          : a.estado === "pendiente"
                          ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                          : "bg-[#e4e9ef] text-[#0b1f33]"
                      }`}
                    >
                      {a.estado}
                    </span>
                  </td>
                  <td className="text-[var(--muted)]">
                    {new Date(a.created_at).toLocaleDateString("es-MX")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          Últimos casos · moderación rápida
        </h2>
        {ultimosCasos.length === 0 ? (
          <p className="text-[var(--ink-soft)]">Sin casos todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)] uppercase text-xs">
                  <th className="py-2">Caso</th>
                  <th>Tipo</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {ultimosCasos.map((c) => (
                  <AdminCasoRow
                    key={c.id}
                    caso={{
                      id: c.id,
                      slug: c.slug,
                      tipo: c.tipo,
                      especie: c.especie,
                      nombre: c.nombre ?? null,
                      ciudad: c.ciudad,
                      estado: c.estado,
                      destacado: c.destacado,
                      created_at: c.created_at,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
