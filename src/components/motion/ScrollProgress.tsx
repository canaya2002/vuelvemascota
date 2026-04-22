"use client";

import { useEffect, useState } from "react";

/**
 * ScrollProgress — thin gradient bar fixed to the top that fills based on
 * page scroll progress. Global "you are here" cue without being distracting.
 */
export function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? h.scrollTop / max : 0;
      setP(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${p * 100}%`,
          background: "linear-gradient(90deg, var(--brand) 0%, #f472b6 50%, var(--sky) 100%)",
          transition: "width 80ms linear",
          boxShadow: "0 0 12px rgba(225,29,72,0.45)",
        }}
      />
    </div>
  );
}
