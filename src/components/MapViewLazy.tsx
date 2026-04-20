"use client";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-[var(--line-strong)] h-[320px] bg-[var(--bg-alt)] animate-pulse" />
  ),
});

export default MapView;
