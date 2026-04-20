"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  rejectAliadoAction,
  verifyAliadoAction,
  type AdminActionState,
} from "@/lib/adminActions";
import { IconCheck, IconX } from "../Icons";

const initial: AdminActionState = { ok: false, message: "" };

export function AliadoReviewCard({
  aliado,
}: {
  aliado: {
    id: string;
    organizacion: string;
    responsable: string;
    email: string;
    telefono: string;
    ciudad: string;
    tipo: string;
    sitio: string | null;
    notas: string | null;
    estado: string;
    created_at: string;
  };
}) {
  const [verifyState, verifyAction] = useActionState(verifyAliadoAction, initial);
  const [rejectState, rejectAction] = useActionState(rejectAliadoAction, initial);
  const msg = verifyState.message || rejectState.message;
  const ok = verifyState.ok || rejectState.ok;
  return (
    <article className="vc-card">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--brand-ink)]">
            {aliado.tipo} · {aliado.estado}
          </p>
          <h3 className="text-lg font-semibold">{aliado.organizacion}</h3>
          <p className="text-sm text-[var(--ink-soft)]">
            {aliado.responsable} · {aliado.ciudad}
          </p>
        </div>
        <span className="text-xs text-[var(--muted)]">
          {new Date(aliado.created_at).toLocaleDateString("es-MX")}
        </span>
      </header>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-[var(--muted)] uppercase">Email</dt>
          <dd className="break-all">{aliado.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--muted)] uppercase">Tel</dt>
          <dd>{aliado.telefono}</dd>
        </div>
      </dl>
      {aliado.sitio && (
        <p className="mt-2 text-sm break-all">
          <span className="text-xs text-[var(--muted)] uppercase">Sitio</span>{" "}
          {aliado.sitio}
        </p>
      )}
      {aliado.notas && (
        <p className="mt-2 text-sm whitespace-pre-wrap text-[var(--ink-soft)]">
          {aliado.notas}
        </p>
      )}

      {aliado.estado === "pendiente" && (
        <div className="mt-4 flex gap-2">
          <form action={verifyAction}>
            <input type="hidden" name="aliado_id" value={aliado.id} />
            <input type="hidden" name="aliado_email" value={aliado.email} />
            <input type="hidden" name="aliado_org" value={aliado.organizacion} />
            <VerifyBtn />
          </form>
          <form action={rejectAction}>
            <input type="hidden" name="aliado_id" value={aliado.id} />
            <RejectBtn />
          </form>
        </div>
      )}

      {msg && (
        <p
          className={`mt-3 text-xs ${ok ? "text-[#0d6b52]" : "text-[var(--brand-ink)]"}`}
          aria-live="polite"
        >
          {msg}
        </p>
      )}
    </article>
  );
}

function VerifyBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="vc-btn vc-btn-primary text-xs py-1.5 px-3"
    >
      <IconCheck size={14} /> Verificar
    </button>
  );
}

function RejectBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="vc-btn vc-btn-outline text-xs py-1.5 px-3"
    >
      <IconX size={14} /> Rechazar
    </button>
  );
}
