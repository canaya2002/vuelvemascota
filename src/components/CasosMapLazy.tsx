"use client";
import dynamic from "next/dynamic";

const CasosMap = dynamic(() => import("./CasosMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-[var(--line-strong)] h-[560px] bg-[var(--bg-alt)] animate-pulse" />
  ),
});

export default CasosMap;
