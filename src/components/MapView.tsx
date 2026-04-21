"use client";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type MapViewProps = {
  lat: number;
  lng: number;
  radio?: number; // metros
  height?: number;
};

export default function MapView({ lat, lng, radio = 0, height = 320 }: MapViewProps) {
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

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[var(--line-strong)]"
      style={{ height }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
        {radio > 0 && (
          <Circle
            center={[lat, lng]}
            radius={radio}
            pathOptions={{
              color: "#e11d48",
              fillColor: "#e11d48",
              fillOpacity: 0.12,
              weight: 2,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
