"use client";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapCaso = {
  id: string;
  slug: string;
  tipo: string;
  especie: string;
  nombre: string | null;
  ciudad: string;
  lat: number | string | null | undefined;
  lng: number | string | null | undefined;
};

export default function CasosMap({
  casos,
  height = 560,
}: {
  casos: MapCaso[];
  height?: number;
}) {
  useEffect(() => {
    (async () => {
      const L = await import("leaflet");
      type IconDefaultWithGetter = typeof L.Icon.Default & {
        prototype: { _getIconUrl?: unknown };
      };
      delete (L.Icon.Default as IconDefaultWithGetter).prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    })();
  }, []);

  const pins = useMemo(
    () =>
      casos
        .filter(
          (c) =>
            c.lat != null &&
            c.lng != null &&
            Number.isFinite(Number(c.lat)) &&
            Number.isFinite(Number(c.lng))
        )
        .map((c) => ({
          ...c,
          _lat: Number(c.lat),
          _lng: Number(c.lng),
        })),
    [casos]
  );

  const center: LatLngTuple = pins.length
    ? [pins[0]._lat, pins[0]._lng]
    : [23.6345, -102.5528]; // Centro MX

  const zoom = pins.length ? 11 : 5;

  if (pins.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--bg-alt)] text-[var(--ink-soft)]"
        style={{ height }}
      >
        <p className="text-sm">No hay casos con ubicación en estos filtros.</p>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[var(--line-strong)]"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((c) => (
          <Marker key={c.id} position={[c._lat, c._lng]}>
            <Popup>
              <div className="text-sm">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#b8381a]">
                  {c.tipo} · {c.especie}
                </p>
                <p className="font-semibold mt-1">
                  {c.nombre || `${c.especie} en ${c.ciudad}`}
                </p>
                <p className="text-xs text-[#6a7a8c]">{c.ciudad}</p>
                <Link
                  href={`/casos/${c.slug}`}
                  className="text-[#b8381a] font-semibold text-xs mt-2 inline-block"
                >
                  Ver caso →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
