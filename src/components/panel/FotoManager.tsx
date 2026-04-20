"use client";
import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteFotoAction, uploadFotosAction, type CasoActionState } from "@/lib/casoActions";
import { IconX, IconArrow } from "../Icons";

type Foto = { id: string; url: string };

const initial: CasoActionState = { ok: false, message: "" };

export function FotoManager({
  slug,
  fotos,
  storageEnabled,
}: {
  slug: string;
  fotos: Foto[];
  storageEnabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fotos.map((f) => (
          <FotoCard key={f.id} foto={f} slug={slug} />
        ))}
        {fotos.length === 0 && (
          <p className="col-span-full text-sm text-[var(--muted)]">
            Aún no hay fotos.
          </p>
        )}
      </div>
      {storageEnabled ? (
        <UploadBlock slug={slug} remaining={6 - fotos.length} />
      ) : (
        <p className="text-sm text-[var(--muted)] italic">
          Configura Supabase Storage para subir fotos.
        </p>
      )}
    </div>
  );
}

function FotoCard({ foto, slug }: { foto: Foto; slug: string }) {
  const [state, formAction] = useActionState(deleteFotoAction, initial);
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-alt)]">
      <Image src={foto.url} alt="" fill sizes="33vw" className="object-cover" />
      <form action={formAction} className="absolute top-2 right-2">
        <input type="hidden" name="foto_id" value={foto.id} />
        <input type="hidden" name="slug" value={slug} />
        <DeleteButton />
      </form>
      {state.message && !state.ok && (
        <p className="absolute bottom-2 left-2 right-2 text-xs bg-white text-[var(--brand-ink)] px-2 py-1 rounded">
          {state.message}
        </p>
      )}
    </div>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Eliminar foto"
      className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
    >
      <IconX size={16} />
    </button>
  );
}

function UploadBlock({ slug, remaining }: { slug: string; remaining: number }) {
  const [state, formAction] = useActionState(uploadFotosAction, initial);
  const [count, setCount] = useState(0);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />
      <label className="vc-label">
        Agregar fotos ({remaining} restantes)
      </label>
      <input
        type="file"
        name="fotos"
        multiple
        accept="image/*"
        disabled={remaining <= 0}
        onChange={(e) => setCount(e.target.files?.length ?? 0)}
        className="block w-full text-sm text-[var(--ink-soft)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--brand-soft)] file:text-[var(--brand-ink)] hover:file:bg-[var(--brand)] hover:file:text-white"
      />
      <div className="flex items-center justify-between">
        <p
          className={`text-sm ${state.ok ? "text-[#0d6b52]" : "text-[var(--brand-ink)]"}`}
          aria-live="polite"
        >
          {state.message || (count > 0 ? `${count} foto(s) seleccionadas.` : "")}
        </p>
        <SubmitUpload disabled={remaining <= 0 || count === 0} />
      </div>
    </form>
  );
}

function SubmitUpload({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="vc-btn vc-btn-outline text-sm py-2 px-3"
    >
      {pending ? "Subiendo…" : "Subir"} <IconArrow size={14} />
    </button>
  );
}
