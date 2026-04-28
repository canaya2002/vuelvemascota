import Image from "next/image";
import Link from "next/link";
import type { Caso } from "@vuelvecasa/shared";
import { IconArrow, IconPaw, IconPin } from "./Icons";

/**
 * Card de caso reutilizable. Diseño compacto: foto 4:3, badge de tipo,
 * nombre/especie, ubicación, fecha y descripción truncada a 2 líneas.
 * Mismo patrón que /casos/page.tsx — extraído para reuso desde vistas y
 * otros lugares.
 */
export function CasoCard({ caso }: { caso: Caso }) {
  const foto = caso.fotos?.[0]?.url;
  const tipoTone =
    caso.tipo === "perdida"
      ? "bg-[var(--brand)] text-white"
      : caso.tipo === "encontrada"
        ? "bg-[var(--accent)] text-white"
        : "bg-[var(--ink)] text-white";

  return (
    <Link
      href={`/casos/${caso.slug}`}
      className="group vc-card !p-0 overflow-hidden flex flex-col h-full hover:border-[var(--ink)]"
    >
      <div className="relative aspect-[4/3] bg-[var(--bg-alt)]">
        {foto ? (
          <Image
            src={foto}
            alt={caso.nombre ?? caso.especie}
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
          className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${tipoTone}`}
        >
          {caso.tipo}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg leading-tight">
          {caso.nombre ||
            `${caso.especie[0].toUpperCase()}${caso.especie.slice(1)}${
              caso.color ? " · " + caso.color : ""
            }`}
        </h3>
        <p className="text-sm text-[var(--ink-soft)] mt-1 flex items-center gap-1">
          <IconPin size={14} />
          {caso.ciudad}
          {caso.colonia ? ` · ${caso.colonia}` : ""}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {new Date(caso.fecha_evento).toLocaleDateString("es-MX")}
        </p>
        {caso.descripcion ? (
          <p className="mt-2 text-sm text-[var(--ink-soft)] line-clamp-2">
            {caso.descripcion}
          </p>
        ) : null}
        <span className="mt-auto pt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-ink)]">
          Ver caso <IconArrow size={12} />
        </span>
      </div>
    </Link>
  );
}
