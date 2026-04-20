"use client";
import dynamic from "next/dynamic";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateCasoAction, type CasoActionState } from "@/lib/casoActions";
import { TextField, TextArea, Select } from "../forms/Field";
import { CITIES } from "@/lib/site";
import { ESTADOS_MX } from "@/lib/estados";
import { IconArrow } from "../Icons";

const MapPicker = dynamic(() => import("../MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-[var(--line-strong)] h-[280px] bg-[var(--bg-alt)] animate-pulse" />
  ),
});

const initial: CasoActionState = { ok: false, message: "" };

type Caso = {
  slug: string;
  nombre?: string | null;
  raza?: string | null;
  color?: string | null;
  tamano?: string | null;
  edad_aprox?: string | null;
  sexo?: string | null;
  senas?: string | null;
  descripcion?: string | null;
  ciudad: string;
  colonia?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  radio_m?: number | null;
  tiene_chip?: boolean | null;
  tiene_collar?: boolean | null;
  contacto_nombre?: string | null;
  contacto_telefono?: string | null;
  contacto_whatsapp?: string | null;
  contacto_email?: string | null;
};

export function CasoEditForm({ caso }: { caso: Caso }) {
  const [state, formAction] = useActionState(updateCasoAction, initial);
  const initialLatLng =
    caso.lat != null && caso.lng != null
      ? { lat: Number(caso.lat), lng: Number(caso.lng) }
      : null;
  const [ubic, setUbic] = useState<{ lat: number; lng: number } | null>(initialLatLng);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={caso.slug} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Nombre" name="nombre" defaultValue={caso.nombre ?? ""} />
        <TextField label="Raza" name="raza" defaultValue={caso.raza ?? ""} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField label="Color" name="color" defaultValue={caso.color ?? ""} />
        <Select label="Tamaño" name="tamano" defaultValue={caso.tamano ?? ""}>
          <option value="">—</option>
          <option value="chico">Chico</option>
          <option value="mediano">Mediano</option>
          <option value="grande">Grande</option>
        </Select>
        <TextField
          label="Edad aprox."
          name="edad_aprox"
          defaultValue={caso.edad_aprox ?? ""}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select label="Sexo" name="sexo" defaultValue={caso.sexo ?? ""}>
          <option value="">Sin saber</option>
          <option value="macho">Macho</option>
          <option value="hembra">Hembra</option>
          <option value="desconocido">No sé</option>
        </Select>
        <Select
          label="¿Tiene chip?"
          name="tiene_chip"
          defaultValue={
            caso.tiene_chip == null ? "" : caso.tiene_chip ? "si" : "no"
          }
        >
          <option value="">Sin saber</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </Select>
        <Select
          label="¿Tiene collar?"
          name="tiene_collar"
          defaultValue={
            caso.tiene_collar == null ? "" : caso.tiene_collar ? "si" : "no"
          }
        >
          <option value="">Sin saber</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </Select>
      </div>

      <TextField
        label="Señas"
        name="senas"
        defaultValue={caso.senas ?? ""}
      />
      <TextArea
        label="Descripción"
        name="descripcion"
        rows={4}
        defaultValue={caso.descripcion ?? ""}
        error={state.errors?.descripcion}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Estado"
          name="estado"
          defaultValue={(caso as Caso & { estado?: string | null }).estado ?? ""}
        >
          <option value="">Auto</option>
          {ESTADOS_MX.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
        <Select label="Ciudad" name="ciudad" defaultValue={caso.ciudad}>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
          <option value="Otra">Otra</option>
        </Select>
        <TextField
          label="Alcaldía / municipio"
          name="municipio"
          defaultValue={(caso as Caso & { municipio?: string | null }).municipio ?? ""}
        />
      </div>

      <TextField
        label="Colonia"
        name="colonia"
        defaultValue={caso.colonia ?? ""}
      />

      <div>
        <label className="vc-label">Zona en el mapa</label>
        <MapPicker value={ubic} onChange={(v) => setUbic(v)} />
        <input type="hidden" name="lat" value={ubic?.lat ?? ""} />
        <input type="hidden" name="lng" value={ubic?.lng ?? ""} />
        <input
          type="hidden"
          name="radio_m"
          value={caso.radio_m ?? 2000}
        />
      </div>

      <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 vc-card bg-[var(--bg-alt)]">
        <legend className="col-span-full text-sm font-semibold text-[var(--ink)]">
          Contacto
        </legend>
        <TextField
          label="Nombre"
          name="contacto_nombre"
          defaultValue={caso.contacto_nombre ?? ""}
        />
        <TextField
          label="Teléfono"
          name="contacto_telefono"
          defaultValue={caso.contacto_telefono ?? ""}
        />
        <TextField
          label="WhatsApp"
          name="contacto_whatsapp"
          defaultValue={caso.contacto_whatsapp ?? ""}
        />
        <TextField
          label="Email público"
          name="contacto_email"
          type="email"
          defaultValue={caso.contacto_email ?? ""}
        />
      </fieldset>

      <div className="flex items-center justify-between gap-4">
        <p
          className={`text-sm ${state.ok ? "text-[#0d6b52]" : "text-[var(--brand-ink)]"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
        <Submit />
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="vc-btn vc-btn-primary">
      {pending ? "Guardando…" : "Guardar cambios"} <IconArrow size={16} />
    </button>
  );
}
