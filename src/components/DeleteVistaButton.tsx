"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { deleteVistaAction, type ForoActionState } from "@/lib/foroActions";

const initial: ForoActionState = { ok: false, message: "" };

export function DeleteVistaButton({ id }: { id: string }) {
  const [, action] = useActionState(deleteVistaAction, initial);
  return (
    <form
      action={async (fd) => {
        if (!confirm("¿Borrar esta vista? No se puede deshacer.")) return;
        await action(fd);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitDelete />
    </form>
  );
}

function SubmitDelete() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs px-3 py-1.5 rounded-full border border-[var(--line)] text-[var(--brand)] hover:bg-[var(--brand-soft)] font-bold uppercase tracking-wide"
    >
      {pending ? "Borrando…" : "Borrar"}
    </button>
  );
}
