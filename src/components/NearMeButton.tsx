"use client";
import { useState } from "react";
import { IconPin } from "./Icons";

export function NearMeButton({
  active,
  currentQs,
}: {
  active: boolean;
  currentQs: string; // URL actual sin lat/lng, ej. "/casos?tipo=perdida"
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function detect() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const params = new URLSearchParams(currentQs.split("?")[1] || "");
        params.set("lat", p.coords.latitude.toFixed(5));
        params.set("lng", p.coords.longitude.toFixed(5));
        params.set("radio_km", "10");
        window.location.href = `${currentQs.split("?")[0]}?${params.toString()}`;
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Permiso denegado. Activa la ubicación en el navegador."
            : "No pudimos obtener tu ubicación."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (active) {
    const params = new URLSearchParams(currentQs.split("?")[1] || "");
    params.delete("lat");
    params.delete("lng");
    params.delete("radio_km");
    const cleanHref = `${currentQs.split("?")[0]}${params.toString() ? "?" + params.toString() : ""}`;
    return (
      <a href={cleanHref} className="vc-btn vc-btn-primary text-sm">
        <IconPin size={14} /> Quitar filtro de zona
      </a>
    );
  }
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={detect}
        disabled={loading}
        className="vc-btn vc-btn-outline text-sm"
      >
        <IconPin size={14} /> {loading ? "Ubicando…" : "Cerca de mí"}
      </button>
      {error && (
        <p className="text-xs text-[var(--brand-ink)] mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
