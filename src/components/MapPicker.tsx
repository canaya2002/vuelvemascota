"use client";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap, LeafletMouseEvent, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Mapa picker con Leaflet + OpenStreetMap.
 * - Click o drag del marker mueve la ubicación.
 * - onChange se dispara con lat/lng.
 * - initial: CDMX si no se pasa.
 *
 * Nota: necesita "use client" y no puede importarse en server components.
 * En páginas server, importar con `next/dynamic` ssr:false.
 */

const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332]; // CDMX

function MarkerDraggable({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (latlng: [number, number]) => void;
}) {
  const ref = useRef<LeafletMarker | null>(null);
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return (
    <Marker
      draggable
      position={value}
      ref={(r) => {
        ref.current = r;
      }}
      eventHandlers={{
        dragend: () => {
          const m = ref.current;
          if (!m) return;
          const p = m.getLatLng();
          onChange([p.lat, p.lng]);
        },
      }}
    />
  );
}

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [map, position]);
  return null;
}

export type MapPickerProps = {
  value?: { lat: number; lng: number } | null;
  onChange: (v: { lat: number; lng: number }) => void;
  height?: number;
};

export default function MapPicker({ value, onChange, height = 320 }: MapPickerProps) {
  const [pos, setPos] = useState<[number, number]>(
    value ? [value.lat, value.lng] : DEFAULT_CENTER
  );
  const mapRef = useRef<LeafletMap | null>(null);

  // Fix Leaflet default icon paths (Next bundler rewrites them otherwise).
  useEffect(() => {
    (async () => {
      const L = await import("leaflet");
      type IconDefaultWithGetter = typeof L.Icon.Default & {
        prototype: { _getIconUrl?: unknown };
      };
      delete (L.Icon.Default as IconDefaultWithGetter).prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    })();
  }, []);

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const next: [number, number] = [p.coords.latitude, p.coords.longitude];
        setPos(next);
        onChange({ lat: next[0], lng: next[1] });
      },
      () => {
        /* ignore */
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-xl border border-[var(--line-strong)]"
        style={{ height }}
      >
        <MapContainer
          center={pos}
          zoom={14}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
          ref={(m) => {
            mapRef.current = m;
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerDraggable
            value={pos}
            onChange={(p) => {
              setPos(p);
              onChange({ lat: p[0], lng: p[1] });
            }}
          />
          <Recenter position={pos} />
        </MapContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 items-center text-sm text-[var(--ink-soft)]">
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="vc-btn vc-btn-outline text-xs py-1.5 px-3"
        >
          Usar mi ubicación actual
        </button>
        <span>
          Ubicación:{" "}
          <strong className="text-[var(--ink)]">
            {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
          </strong>
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Haz clic o arrastra el marcador para ajustar la zona de extravío o
        hallazgo. Nunca publicamos tu dirección exacta; usamos un radio.
      </p>
    </div>
  );
}
