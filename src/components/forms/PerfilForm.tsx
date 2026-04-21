"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updatePerfilAction, type PerfilActionState } from "@/lib/perfilActions";
import { CITIES } from "@/lib/site";
import { ESTADOS_MX } from "@/lib/estados";
import { TextField, TextArea, Select } from "./Field";
import { IconArrow, IconCheck } from "../Icons";

const initial: PerfilActionState = { ok: false, message: "" };

type Props = {
  defaults: {
    nombre?: string | null;
    ciudad?: string | null;
    estado?: string | null;
    rol?: string | null;
    bio?: string | null;
  };
};

export function PerfilForm({ defaults }: Props) {
  const [state, formAction] = useActionState(updatePerfilAction, initial);
  const [bio, setBio] = useState(defaults.bio ?? "");

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Nombre público"
          name="nombre"
          defaultValue={defaults.nombre ?? ""}
          required
          placeholder="Como quieres que te vea la comunidad"
          error={state.errors?.nombre}
        />
        <Select
          label="Rol principal"
          name="rol"
          defaultValue={defaults.rol ?? ""}
          error={state.errors?.rol}
        >
          <option value="">Elige uno</option>
          <option value="dueño">Dueño/a de mascota</option>
          <option value="voluntario">Voluntario/a</option>
          <option value="rescatista">Rescatista / colectivo</option>
          <option value="veterinaria">Veterinaria / clínica</option>
          <option value="aliado">Aliado (marca/medio)</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Ciudad"
          name="ciudad"
          defaultValue={defaults.ciudad ?? ""}
          required
          error={state.errors?.ciudad}
        >
          <option value="">Elige tu ciudad</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}, {c.state}
            </option>
          ))}
          <option value="Otra">Otra / no aparece</option>
        </Select>
        <Select
          label="Estado"
          name="estado"
          defaultValue={defaults.estado ?? ""}
          error={state.errors?.estado}
        >
          <option value="">Opcional</option>
          {ESTADOS_MX.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </div>

      <TextArea
        label="Sobre ti (opcional)"
        name="bio"
        rows={4}
        maxLength={400}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Un par de líneas para que la comunidad te conozca. Enfócate en tu vínculo con mascotas y rescate."
        error={state.errors?.bio}
      />
      <p className="text-xs text-[var(--muted)]">
        {bio.length}/400 · Lo que escribes pasa por un filtro automático para
        proteger la comunidad.
      </p>

      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        {state.message && (
          <p
            className={`text-sm ${
              state.ok ? "text-[var(--accent)]" : "text-[var(--brand-ink)]"
            }`}
            aria-live="polite"
          >
            {state.ok && (
              <span className="inline-flex items-center gap-1">
                <IconCheck size={14} />
              </span>
            )}{" "}
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
      {pending ? "Guardando…" : "Guardar perfil"} <IconArrow size={16} />
    </button>
  );
}
