import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { donacionesRepo } from "@/lib/donacionesRepo";
import { FLAGS } from "@/lib/flags";
import { IconHeart, IconArrow } from "@/components/Icons";

export const metadata = { title: "Mis donaciones" };

export default async function Page() {
  let rows: Awaited<ReturnType<typeof donacionesRepo.listByEmail>> = [];
  let stats: Awaited<ReturnType<typeof donacionesRepo.statsByEmail>> = {
    total: 0,
    count: 0,
    recurrentes: 0,
    porCausa: {},
  };
  let email: string | null = null;

  if (FLAGS.auth) {
    const user = await currentUser();
    email =
      user?.emailAddresses?.find((e) => e.id === user?.primaryEmailAddressId)
        ?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      null;
    if (email) {
      [rows, stats] = await Promise.all([
        donacionesRepo.listByEmail(email, 100),
        donacionesRepo.statsByEmail(email),
      ]);
    }
  }

  if (!email) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Mis donaciones</h1>
        <p className="mt-4 text-[var(--ink-soft)]">Inicia sesión para verlas.</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">Mis donaciones</h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          Historial y comprobantes. Usamos el correo <strong>{email}</strong> para enlazar tus pagos.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total aportado"
          value={`$${stats.total.toLocaleString("es-MX")}`}
          sub="MXN"
          tint="brand"
        />
        <StatCard
          label="Donaciones"
          value={stats.count.toString()}
          sub={`${stats.recurrentes} mensuales`}
          tint="accent"
        />
        <StatCard
          label="Fondo comunitario"
          value={`$${(stats.porCausa["fondo"] ?? 0).toLocaleString("es-MX")}`}
          tint="ink"
        />
        <StatCard
          label="Emergencias"
          value={`$${(stats.porCausa["emergencia"] ?? 0).toLocaleString("es-MX")}`}
        />
      </section>

      {rows.length === 0 ? (
        <div className="vc-card border-dashed bg-[var(--bg-alt)] text-center py-14">
          <span className="inline-flex w-14 h-14 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center mx-auto">
            <IconHeart size={26} />
          </span>
          <h2 className="mt-5 text-xl font-semibold">Aún no has donado</h2>
          <p className="mt-2 text-[var(--ink-soft)] max-w-md mx-auto">
            Apoya rescates reales o al fondo comunitario. Cada peso queda documentado.
          </p>
          <Link href="/donar" className="vc-btn vc-btn-primary mt-6">
            Ir a donar <IconArrow size={14} />
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted)] uppercase text-xs">
                <th className="py-2">Fecha</th>
                <th>Monto</th>
                <th>Destino</th>
                <th>Tipo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 text-[var(--ink-soft)] whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="font-semibold">
                    ${r.amount.toLocaleString("es-MX")}{" "}
                    <span className="text-xs font-normal uppercase text-[var(--muted)]">
                      {r.currency}
                    </span>
                  </td>
                  <td>
                    {r.caso_slug ? (
                      <Link
                        href={`/casos/${r.caso_slug}`}
                        className="text-[var(--brand-ink)] hover:underline"
                      >
                        Caso: {r.caso_nombre || r.caso_slug}
                      </Link>
                    ) : (
                      <span className="capitalize text-[var(--ink-soft)]">
                        {r.causa}
                      </span>
                    )}
                  </td>
                  <td className="text-[var(--ink-soft)]">
                    {r.recurrente ? "Mensual" : "Única"}
                  </td>
                  <td>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-semibold ${
                        r.status === "completed"
                          ? "bg-[var(--accent-soft)] text-[#0d6b52]"
                          : r.status === "pending"
                          ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
                          : "bg-[#e4e9ef] text-[#0b1f33]"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Si falta alguna donación, puede que la hayas hecho con otro correo.
            Escríbenos desde <Link href="/contacto?tema=soporte" className="underline">contacto</Link>.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tint = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  tint?: "brand" | "accent" | "ink";
}) {
  const bg =
    tint === "accent"
      ? "bg-[var(--accent-soft)] text-[#0d6b52]"
      : tint === "ink"
      ? "bg-[#0b1f33] text-white"
      : "bg-[var(--brand-soft)] text-[var(--brand-ink)]";
  return (
    <div className="vc-card">
      <span
        className={`inline-flex w-10 h-10 rounded-xl items-center justify-center ${bg}`}
        aria-hidden
      >
        <IconHeart size={18} />
      </span>
      <p className="mt-3 text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-[var(--muted)] mt-1">{sub}</p>}
    </div>
  );
}
