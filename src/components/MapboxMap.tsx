"use client";
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapPin = {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
  subtitle?: string;
  href?: string;
  color?: string;
};

type Props = {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  interactive?: boolean;
  style?: string;
  fitBoundsToPins?: boolean;
  showControls?: boolean;
};

/**
 * Mapbox GL JS wrapper (Client Component).
 *
 * El paquete `mapbox-gl` toca `window` en import time, así que lo cargamos
 * de forma dinámica DENTRO del useEffect — nunca durante el bundle del
 * servidor. Así este componente se puede importar desde Server Components
 * sin usar `next/dynamic` ni `ssr: false` (que ya no funciona en Next 16).
 */
export function MapboxMap({
  pins,
  center = [-99.1332, 19.4326], // CDMX
  zoom = 10,
  height = "420px",
  interactive = true,
  style = "mapbox://styles/mapbox/light-v11",
  fitBoundsToPins = true,
  showControls = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      : undefined;

  useEffect(() => {
    if (!token || !containerRef.current) return;

    let cancelled = false;
    type MapInstance = { remove: () => void };
    type MarkerInstance = { remove: () => void };

    let map: MapInstance | null = null;
    const markers: MarkerInstance[] = [];

    (async () => {
      try {
        // Import dinámico — solo corre en cliente.
        const mapboxgl = await import("mapbox-gl");
        if (cancelled || !containerRef.current) return;

        // Las versiones modernas exponen accessToken en el namespace directo.
        (mapboxgl as unknown as { accessToken: string }).accessToken = token;

        const created = new mapboxgl.Map({
          container: containerRef.current,
          style,
          center,
          zoom,
          interactive,
          attributionControl: true,
          cooperativeGestures: true,
        });
        map = created as unknown as MapInstance;

        if (showControls) {
          created.addControl(
            new mapboxgl.NavigationControl({ showCompass: false }),
            "top-right"
          );
          created.addControl(
            new mapboxgl.GeolocateControl({
              positionOptions: { enableHighAccuracy: true },
              trackUserLocation: false,
              showUserHeading: false,
            }),
            "top-right"
          );
        }

        const bounds = new mapboxgl.LngLatBounds();
        for (const pin of pins) {
          if (!Number.isFinite(pin.lat) || !Number.isFinite(pin.lng)) continue;
          const el = document.createElement("div");
          el.style.cssText = `
            width: 28px; height: 28px; border-radius: 50%;
            background: ${pin.color ?? "#e11d48"};
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(225,29,72,0.35);
            cursor: ${pin.href ? "pointer" : "default"};
            transition: transform 0.15s ease;
          `;
          el.addEventListener("mouseenter", () => {
            el.style.transform = "scale(1.12)";
          });
          el.addEventListener("mouseleave", () => {
            el.style.transform = "scale(1)";
          });

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([pin.lng, pin.lat])
            .addTo(created);

          if (pin.title || pin.subtitle || pin.href) {
            const html = `
              <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 180px;">
                ${
                  pin.title
                    ? `<p style="margin:0;font-weight:700;font-size:14px;color:#0a1a2b;">${escapeHtml(pin.title)}</p>`
                    : ""
                }
                ${
                  pin.subtitle
                    ? `<p style="margin:4px 0 0;font-size:12px;color:#5a6b82;">${escapeHtml(pin.subtitle)}</p>`
                    : ""
                }
                ${
                  pin.href
                    ? `<a href="${escapeHtml(pin.href)}" style="display:inline-block;margin-top:10px;padding:6px 12px;background:#e11d48;color:#fff;border-radius:999px;font-size:12px;font-weight:600;text-decoration:none;">Ver detalle</a>`
                    : ""
                }
              </div>
            `;
            const popup = new mapboxgl.Popup({
              offset: 18,
              closeButton: true,
              maxWidth: "280px",
            }).setHTML(html);
            marker.setPopup(popup);
          }

          markers.push(marker as unknown as MarkerInstance);
          bounds.extend([pin.lng, pin.lat]);
        }

        if (fitBoundsToPins && markers.length >= 2) {
          created.fitBounds(bounds, { padding: 60, duration: 600, maxZoom: 14 });
        } else if (markers.length === 1) {
          created.setCenter([pins[0].lng, pins[0].lat]);
          created.setZoom(13);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar el mapa");
        }
      }
    })();

    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pins), token, zoom, style, interactive, showControls, fitBoundsToPins]);

  if (!token) {
    return (
      <div
        className="rounded-2xl bg-[var(--bg-alt)] border border-[var(--line)] flex items-center justify-center text-sm text-[var(--muted)] px-6 text-center"
        style={{ height }}
      >
        El mapa se activará cuando el administrador configure{" "}
        <code className="mx-1">NEXT_PUBLIC_MAPBOX_TOKEN</code>.
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <div
        ref={containerRef}
        className="absolute inset-0 rounded-2xl overflow-hidden ring-1 ring-[var(--line)] shadow-sm"
        aria-label="Mapa interactivo"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl text-sm text-[var(--brand-ink)]">
          {error}
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
