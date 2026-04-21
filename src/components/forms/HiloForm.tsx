"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createHiloAction, type ForoActionState } from "@/lib/foroActions";
import { TextField, TextArea, Select } from "./Field";
import { CITIES } from "@/lib/site";
import type { ForoCategoria } from "@/lib/foros";
import { IconArrow } from "../Icons";

const initial: ForoActionState = { ok: false, message: "" };

export function HiloForm({
  categorias,
}: {
  categorias: { slug: ForoCategoria; titulo: string }[];
}) {
  const [state, formAction] = useActionState(createHiloAction, initial);
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");

  return (
    <form action={formAction} className="space-y-6">
      <Select
        label="Categoría"
        name="categoria"
        required
        defaultValue=""
        error={state.errors?.categoria}
      >
        <option value="" disabled>
          Elige una categoría
        </option>
        {categorias.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.titulo}
          </option>
        ))}
      </Select>
      <TextField
        label="Título"
        name="titulo"
        required
        placeholder="Ej. Reencontramos a Luna gracias a una vecina"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        error={state.errors?.titulo}
      />
      <TextArea
        label="Mensaje"
        name="cuerpo"
        required
        rows={8}
        placeholder="Cuenta tu historia, pregunta o caso. Mínimo 20 caracteres."
        value={cuerpo}
        onChange={(e) => setCuerpo(e.target.value)}
        error={state.errors?.cuerpo}
      />
      <Select label="Ciudad (opcional)" name="ciudad" defaultValue="">
        <option value="">Sin especificar</option>
        {CITIES.map((c) => (
          <option key={c.slug} value={c.name}>
            {c.name}, {c.state}
          </option>
        ))}
      </Select>

      <p className="text-xs text-[var(--muted)]">
        Al publicar aceptas las normas del foro. No compartas datos personales;
        el filtro automático bloquea insultos, spam y contenido fuera de tema.
      </p>

      <div className="flex items-center justify-between flex-wrap gap-3">
        {!state.ok && state.message && (
          <p className="text-sm text-[var(--brand-ink)]" aria-live="polite">
            {state.message}
          </p>
        )}
        <Submit />
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="vc-btn vc-btn-primary ml-auto"
    >
      {pending ? "Publicando…" : "Publicar tema"} <IconArrow size={18} />
    </button>
  );
}
