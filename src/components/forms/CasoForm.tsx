"use client";
import dynamic from "next/dynamic";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createCasoAction, type CasoActionState } from "@/lib/casoActions";
import { CITIES } from "@/lib/site";
import { ESTADOS_MX } from "@/lib/estados";
import { TextField, TextArea, Select } from "./Field";
import { IconArrow } from "../Icons";

const MapPicker = dynamic(() => import("../MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-[var(--line-strong)] h-[320px] bg-[var(--bg-alt)] animate-pulse" />
  ),
});

const initial: CasoActionState = { ok: false, message: "" };

type Props = {
  storageEnabled: boolean;
  defaultCiudad?: string | null;
  defaultNombre?: string | null;
};

const RADIOS_KM = [1, 2, 3, 5, 10];

export function CasoForm({ storageEnabled, defaultCiudad, defaultNombre }: Props) {
  const [state, formAction] = useActionState(createCasoAction, initial);
  const [tipo, setTipo] = useState<"perdida" | "encontrada" | "avistamiento">("perdida");
  const [ubic, setUbic] = useState<{ lat: number; lng: number } | null>(null);
  const [radioKm, setRadioKm] = useState(2);
  const [files, setFiles] = useState<File[]>([]);

  return (
    <form action={formAction} className="space-y-8">
      {/* Tipo de caso */}
      <fieldset>
        <legend className="vc-label">Tipo de caso</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { v: "perdida", t: "Mascota perdida" },
            { v: "encontrada", t: "Mascota encontrada" },
            { v: "avistamiento", t: "Avistamiento" },
          ].map((o) => (
            <label
              key={o.v}
              className={`cursor-pointer px-4 py-3 rounded-xl border text-sm text-center transition-colors ${
                tipo === o.v
                  ? "bg-[var(--brand-soft)] border-[var(--brand)] text-[var(--brand-ink)] font-semibold"
                  : "border-[var(--line-strong)] bg-white hover:border-[var(--ink)]"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value={o.v}
                checked={tipo === o.v}
                onChange={() => setTipo(o.v as typeof tipo)}
                className="sr-only"
              />
              {o.t}
            </label>
          ))}
        </div>
        {state.errors?.tipo && (
          <p className="vc-hint !text-[var(--brand-ink)]">{state.errors.tipo}</p>
        )}
      </fieldset>

      {/* Datos básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Especie" name="especie" required error={state.errors?.especie}>
          <option value="" disabled>
            Elige especie
          </option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="otro">Otro</option>
        </Select>
        <TextField
          label={tipo === "encontrada" ? "Apodo temporal (opcional)" : "Nombre"}
          name="nombre"
          defaultValue={defaultNombre ?? ""}
          placeholder={tipo === "encontrada" ? "Ej. Pelusita" : "Ej. Firulais"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField label="Raza aparente" name="raza" placeholder="Mestizo, Labrador, etc." />
        <TextField label="Color / patrón" name="color" placeholder="Café claro con blanco" />
        <Select label="Tamaño" name="tamano">
          <option value="">Elige</option>
          <option value="chico">Chico</option>
          <option value="mediano">Mediano</option>
          <option value="grande">Grande</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField label="Edad aproximada" name="edad_aprox" placeholder="Cachorro / 3 años" />
        <Select label="Sexo" name="sexo">
          <option value="">Sin saber</option>
          <option value="macho">Macho</option>
          <option value="hembra">Hembra</option>
          <option value="desconocido">No sé</option>
        </Select>
        <Select label="¿Tiene chip?" name="tiene_chip">
          <option value="">Sin saber</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </Select>
      </div>

      <TextField label="Señas particulares" name="senas" placeholder="Manchita en la oreja, cicatriz, collar rojo..." />
      <TextArea
        label="Descripción"
        name="descripcion"
        required
        rows={4}
        placeholder="Cuenta en qué circunstancias se perdió o se encontró, hacia dónde se fue, temperamento, etc."
        error={state.errors?.descripcion}
      />

      {/* Ubicación */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="Fecha del evento"
            name="fecha_evento"
            type="date"
            required
            error={state.errors?.fecha_evento}
          />
          <Select
            label="Estado"
            name="estado"
            defaultValue=""
          >
            <option value="">Auto (según ciudad)</option>
            {ESTADOS_MX.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
          <Select
            label="Ciudad"
            name="ciudad"
            required
            defaultValue={defaultCiudad ?? ""}
            error={state.errors?.ciudad}
          >
            <option value="" disabled>
              Elige ciudad
            </option>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}, {c.state}
              </option>
            ))}
            <option value="Otra">Otra / no aparece</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Alcaldía o municipio"
            name="municipio"
            placeholder="Ej. Coyoacán / Zapopan / Benito Juárez"
          />
          <TextField label="Colonia o zona" name="colonia" placeholder="Ej. Del Valle Norte" />
        </div>

        <div>
          <label className="vc-label">Punto de extravío / hallazgo</label>
          <MapPicker value={ubic} onChange={(v) => setUbic(v)} />
          <input type="hidden" name="lat" value={ubic?.lat ?? ""} />
          <input type="hidden" name="lng" value={ubic?.lng ?? ""} />
        </div>

        <div>
          <label className="vc-label">Radio de difusión</label>
          <div className="flex flex-wrap gap-2">
            {RADIOS_KM.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadioKm(r)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  radioKm === r
                    ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                    : "bg-white border-[var(--line-strong)] hover:border-[var(--ink)]"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
          <input type="hidden" name="radio_m" value={radioKm * 1000} />
          <p className="vc-hint">
            Define qué tan lejos difundir. Un radio grande (5–10 km) es bueno para perros; chico (1–2 km) para gatos.
          </p>
        </div>
      </div>

      {/* Fotos */}
      <div>
        <label className="vc-label">Fotos (hasta 6)</label>
        {storageEnabled ? (
          <>
            <input
              type="file"
              name="fotos"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 6))}
              className="block w-full text-sm text-[var(--ink-soft)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--brand-soft)] file:text-[var(--brand-ink)] hover:file:bg-[var(--brand)] hover:file:text-white"
            />
            {files.length > 0 && (
              <p className="vc-hint">
                {files.length} foto(s) seleccionada(s). Se subirán al publicar.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-[var(--muted)] italic">
            Upload de fotos se activa cuando Supabase Storage esté configurado. Puedes publicar sin fotos y agregarlas después.
          </p>
        )}
      </div>

      {/* Contacto */}
      <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 vc-card bg-[var(--bg-alt)]">
        <legend className="col-span-full text-sm font-semibold text-[var(--ink)]">
          ¿Cómo te contactan?
        </legend>
        <TextField
          label="Nombre o apodo público"
          name="contacto_nombre"
          required
          error={state.errors?.contacto_nombre}
        />
        <TextField
          label="Teléfono"
          name="contacto_telefono"
          placeholder="55 0000 0000"
          error={state.errors?.contacto_telefono}
        />
        <TextField
          label="WhatsApp"
          name="contacto_whatsapp"
          placeholder="52 55 0000 0000"
        />
        <TextField
          label="Email público"
          name="contacto_email"
          type="email"
          placeholder="(opcional)"
        />
      </fieldset>

      {/* Submit */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-[var(--muted)] max-w-md">
          Al publicar aceptas los términos y aviso de privacidad. Tu dirección exacta nunca se muestra — solo la zona.
        </p>
        <Submit />
      </div>

      {!state.ok && state.message && (
        <p className="text-sm text-[var(--brand-ink)]" aria-live="polite">
          {state.message}
        </p>
      )}
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="vc-btn vc-btn-primary">
      {pending ? "Publicando…" : "Publicar caso"} <IconArrow size={18} />
    </button>
  );
}
