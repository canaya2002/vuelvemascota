"use client";
import dynamic from "next/dynamic";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createCasoAction, type CasoActionState } from "@/lib/casoActions";
import { CITIES } from "@/lib/site";
import { ESTADOS_MX } from "@/lib/estados";
import { compressBatch } from "@/lib/imageCompress";
import { TextField, TextArea, Select } from "./Field";
import { IconArrow, IconX } from "../Icons";

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

      {/* Fotos — siempre disponible; el server action sube cuando el storage está listo. */}
      <PhotoUploader
        files={files}
        setFiles={setFiles}
        storageEnabled={storageEnabled}
      />
      {/* Duplicamos el input para que el FormData incluya los archivos. */}
      <HiddenFotos files={files} />

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

function PhotoUploader({
  files,
  setFiles,
  storageEnabled,
}: {
  files: File[];
  setFiles: (f: File[]) => void;
  storageEnabled: boolean;
}) {
  const previews = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files]
  );
  useEffect(() => {
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previews]);

  const MAX = 6;
  const [compressing, setCompressing] = useState(false);
  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (incoming.length === 0) return;
    setCompressing(true);
    try {
      const compressed = await compressBatch(incoming);
      const combined = [...files, ...compressed].slice(0, MAX);
      setFiles(combined);
    } finally {
      setCompressing(false);
    }
  };
  const removeAt = (i: number) => {
    const copy = files.slice();
    copy.splice(i, 1);
    setFiles(copy);
  };

  return (
    <div>
      <label className="vc-label">Fotos (hasta {MAX})</label>
      <label
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-[var(--bg-alt)] hover:bg-white hover:border-[var(--brand)] transition-colors px-6 py-8 cursor-pointer text-center ${
          compressing ? "opacity-60 pointer-events-none" : "border-[var(--line-strong)]"
        }`}
      >
        <span className="text-sm font-semibold text-[var(--ink)]">
          {compressing
            ? "Optimizando imágenes…"
            : "Arrastra o haz clic para seleccionar fotos"}
        </span>
        <span className="text-xs text-[var(--muted)]">
          JPG/PNG/WEBP · hasta {MAX} archivos · se optimizan automáticamente
        </span>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => addFiles(e.target.files)}
          className="sr-only"
          disabled={compressing}
        />
      </label>
      {!storageEnabled && (
        <p className="vc-hint">
          El almacenamiento de fotos aún no está configurado. Puedes previsualizarlas
          aquí y el caso se publicará sin ellas — las podrás agregar cuando esté listo.
        </p>
      )}
      {previews.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {previews.map((src, i) => (
            <li
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-[var(--line)] bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[var(--ink)]/75 text-white inline-flex items-center justify-center hover:bg-[var(--ink)]"
                aria-label={`Quitar foto ${i + 1}`}
              >
                <IconX size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Los <input type="file"> controlados no persisten los archivos entre renders;
 * para enviar los archivos con FormData sincronizamos un DataTransfer a un
 * input oculto con `name="fotos"` en cada cambio.
 */
function HiddenFotos({ files }: { files: File[] }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    try {
      const dt = new DataTransfer();
      for (const f of files) dt.items.add(f);
      el.files = dt.files;
    } catch {
      /* DataTransfer may not be available in some browsers; form fallback handled server-side */
    }
  }, [files]);
  return (
    <input
      ref={inputRef}
      type="file"
      name="fotos"
      multiple
      accept="image/*"
      className="hidden"
      tabIndex={-1}
      aria-hidden
    />
  );
}
