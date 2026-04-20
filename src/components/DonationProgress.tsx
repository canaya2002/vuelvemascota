import { IconHeart } from "./Icons";

export function DonationProgress({
  meta,
  donado,
}: {
  meta: number | null;
  donado: number;
}) {
  if (!meta && donado === 0) return null;
  const pct =
    meta && meta > 0 ? Math.min(100, Math.round((donado / meta) * 100)) : null;
  return (
    <div className="vc-card bg-[var(--bg-alt)]">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-[var(--brand)] text-white inline-flex items-center justify-center">
          <IconHeart size={20} />
        </span>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
            Recaudado por la comunidad
          </p>
          <p className="text-2xl font-bold text-[var(--ink)]">
            ${donado.toLocaleString("es-MX")} MXN
            {meta ? (
              <span className="text-sm font-normal text-[var(--ink-soft)]">
                {" "}
                de ${meta.toLocaleString("es-MX")}
              </span>
            ) : null}
          </p>
        </div>
      </div>
      {pct !== null && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-white border border-[var(--line)] overflow-hidden">
            <div
              className="h-full bg-[var(--brand)] transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {pct}% de la meta alcanzada
          </p>
        </div>
      )}
    </div>
  );
}
