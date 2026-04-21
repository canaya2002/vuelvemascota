import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "VuelveaCasa — Reporta, encuentra y ayuda a mascotas perdidas en México";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0b1f33 0%, #14304b 40%, #e11d48 120%)",
          color: "#fff",
          padding: "72px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 9999,
              background: "#e11d48",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            ❤
          </div>
          <span style={{ fontSize: 30, fontWeight: 600 }}>VuelveaCasa</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Red comunitaria · México
          </div>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.04,
              fontWeight: 700,
              maxWidth: 980,
            }}
          >
            Reporta, encuentra y ayuda a que vuelvan a casa.
          </div>
          <div style={{ fontSize: 28, opacity: 0.9, maxWidth: 900 }}>
            Mascotas perdidas, encontradas, alertas por zona, hogar temporal y
            donaciones rastreables.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 24, opacity: 0.8 }}>vuelvecasa.com</span>
          <span
            style={{
              fontSize: 22,
              padding: "14px 22px",
              borderRadius: 9999,
              background: "#e11d48",
              fontWeight: 600,
            }}
          >
            Registrarme gratis →
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
