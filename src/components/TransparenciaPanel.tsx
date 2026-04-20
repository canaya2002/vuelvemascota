import Link from "next/link";
import { getTransparenciaStats } from "@/lib/stats";
import { IconPaw, IconHeart, IconShield, IconPin, IconArrow } from "./Icons";

export async function TransparenciaPanel() {
  const s = await getTransparenciaStats();
  const hasData =
    s.totalCasos + s.donacionesCount + s.aliadosVerificados > 0;

  if (!hasData) {
    return (
      <div className="vc-card bg-[var(--bg-alt)]">
        <h3 className="text-xl font-semibold">Transparencia en construcción</h3>
        <p className="mt-2 text-[var(--ink-soft)]">
          Cuando empecemos a recibir casos y donaciones publicaremos aquí los números en vivo. Mientras tanto, revisa la sección de transparencia más abajo para conocer los criterios.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<IconPaw size={20} />}
          label="Casos publicados"
          value={s.totalCasos.toLocaleString("es-MX")}
          sub={`${s.casosActivos} activos hoy`}
        />
        <StatCard
          icon={<IconHeart size={20} />}
          label="Reencontrados"
          value={s.reencontrados.toLocaleString("es-MX")}
          sub="Cerrados con final feliz"
          tint="accent"
        />
        <StatCard
          icon={<IconShield size={20} />}
          label="Aliados verificados"
          value={s.aliadosVerificados.toLocaleString("es-MX")}
          sub="Rescatistas y clínicas"
        />
        <StatCard
          icon={<IconPin size={20} />}
          label="Ciudades activas"
          value={s.ciudadesActivas.toLocaleString("es-MX")}
          sub={`${s.avistamientos.toLocaleString("es-MX")} avistamientos`}
          tint="ink"
        />
      </div>

      <div className="mt-6 vc-card bg-[var(--bg-alt)]">
        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
          Donaciones completadas
        </h3>
        <p className="mt-2 text-4xl font-bold text-[var(--ink)]">
          ${s.donacionesMxn.toLocaleString("es-MX")}{" "}
          <span className="text-base text-[var(--ink-soft)]">MXN</span>
        </p>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          En {s.donacionesCount.toLocaleString("es-MX")} donaciones procesadas con Stripe.
        </p>
      </div>

      {s.topCasosApoyados.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Casos más apoyados</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {s.topCasosApoyados.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/casos/${c.slug}`}
                  className="vc-card flex items-center justify-between gap-3 hover:border-[var(--ink)]"
                >
                  <div>
                    <p className="font-semibold">
                      {c.nombre || `${c.especie} en ${c.ciudad}`}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{c.ciudad}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[var(--brand-ink)]">
                      ${c.donado_mxn.toLocaleString("es-MX")}
                    </p>
                    <span className="text-xs text-[var(--brand-ink)] inline-flex items-center gap-1">
                      Ver <IconArrow size={12} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tint = "brand",
}: {
  icon: React.ReactNode;
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
        {icon}
      </span>
      <p className="mt-3 text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
        {label}
      </p>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-[var(--muted)] mt-1">{sub}</p>}
    </div>
  );
}
