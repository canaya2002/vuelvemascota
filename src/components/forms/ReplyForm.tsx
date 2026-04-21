"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { replyHiloAction, type ForoActionState } from "@/lib/foroActions";
import { TextArea } from "./Field";
import { IconArrow } from "../Icons";

const initial: ForoActionState = { ok: false, message: "" };

export function ReplyForm({ hiloId }: { hiloId: string }) {
  const [state, formAction] = useActionState(replyHiloAction, initial);
  const [cuerpo, setCuerpo] = useState("");

  return (
    <form
      action={async (fd) => {
        await formAction(fd);
        setCuerpo("");
      }}
      className="space-y-4 vc-card-glass !p-6"
    >
      <input type="hidden" name="hilo_id" value={hiloId} />
      <TextArea
        label="Tu respuesta"
        name="cuerpo"
        rows={5}
        required
        placeholder="Aporta desde tu experiencia. Sé respetuoso y específico."
        value={cuerpo}
        onChange={(e) => setCuerpo(e.target.value)}
      />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-[var(--muted)]">
          Los mensajes pasan por un filtro automático.
        </p>
        <Submit />
      </div>
      {state.message && (
        <p
          className={`text-sm ${
            state.ok ? "text-[var(--accent)]" : "text-[var(--brand-ink)]"
          }`}
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="vc-btn vc-btn-primary"
    >
      {pending ? "Enviando…" : "Publicar respuesta"} <IconArrow size={16} />
    </button>
  );
}
