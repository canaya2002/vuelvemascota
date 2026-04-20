"use client";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  adminChangeCasoStateAction,
  adminToggleDestacadoAction,
  type AdminActionState,
} from "@/lib/adminActions";
import { IconArrow, IconStar, IconX } from "../Icons";

const initial: AdminActionState = { ok: false, message: "" };

type Caso = {
  id: string;
  slug: string;
  tipo: string;
  especie: string;
  nombre: string | null;
  ciudad: string;
  estado: string;
  destacado?: boolean;
  created_at: string;
};

export function AdminCasoRow({ caso }: { caso: Caso }) {
  const [stateRes, stateAction] = useActionState(
    adminChangeCasoStateAction,
    initial
  );
  const [destRes, destAction] = useActionState(
    adminToggleDestacadoAction,
    initial
  );
  return (
    <tr>
      <td className="py-3 font-medium">
        <Link
          href={`/casos/${caso.slug}`}
          className="text-[var(--brand-ink)] hover:underline"
        >
          {caso.nombre || `${caso.especie} ${caso.ciudad}`}
        </Link>
      </td>
      <td className="text-[var(--ink-soft)]">{caso.tipo}</td>
      <td className="text-[var(--ink-soft)]">{caso.ciudad}</td>
      <td>
        <span
          className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-semibold ${
            caso.estado === "activo"
              ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
              : caso.estado === "reencontrado"
              ? "bg-[var(--accent-soft)] text-[#0d6b52]"
              : "bg-[#e4e9ef] text-[#0b1f33]"
          }`}
        >
          {caso.estado}
        </span>
      </td>
      <td className="text-[var(--muted)] text-xs">
        {new Date(caso.created_at).toLocaleDateString("es-MX")}
      </td>
      <td>
        <div className="flex gap-1 flex-wrap items-center">
          <form action={stateAction} className="flex gap-1">
            <input type="hidden" name="slug" value={caso.slug} />
            <SmallBtn estado="activo" label="Activar" disabled={caso.estado === "activo"} />
            <SmallBtn estado="archivado" label="Archivar" disabled={caso.estado === "archivado"} />
          </form>
          <form action={destAction}>
            <input type="hidden" name="slug" value={caso.slug} />
            <input
              type="hidden"
              name="destacado"
              value={(!caso.destacado).toString()}
            />
            <DestacadoBtn activo={!!caso.destacado} />
          </form>
        </div>
        {(stateRes.message || destRes.message) && (
          <p
            className={`text-[10px] mt-1 ${
              stateRes.ok || destRes.ok
                ? "text-[#0d6b52]"
                : "text-[var(--brand-ink)]"
            }`}
          >
            {stateRes.message || destRes.message}
          </p>
        )}
      </td>
    </tr>
  );
}

function SmallBtn({
  estado,
  label,
  disabled,
}: {
  estado: string;
  label: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="estado"
      value={estado}
      disabled={pending || disabled}
      className="text-[10px] font-semibold px-2 py-1 rounded border border-[var(--line-strong)] bg-white hover:border-[var(--ink)] disabled:opacity-50"
    >
      {estado === "archivado" ? <IconX size={12} /> : <IconArrow size={12} />}{" "}
      {label}
    </button>
  );
}

function DestacadoBtn({ activo }: { activo: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={activo ? "Quitar destacado" : "Destacar"}
      className={`inline-flex w-7 h-7 items-center justify-center rounded border ${
        activo
          ? "bg-[var(--warn-soft, #fff4d1)] border-[var(--warn, #e8a500)] text-[#8a6500]"
          : "bg-white border-[var(--line-strong)] hover:border-[var(--ink)]"
      }`}
    >
      <IconStar size={14} />
    </button>
  );
}
