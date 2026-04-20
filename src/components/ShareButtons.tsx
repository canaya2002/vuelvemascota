"use client";
import { useState } from "react";
import { IconWhats, IconChat, IconCheck } from "./Icons";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const full = typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;
  const waText = encodeURIComponent(`${title}\n${full}`);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="vc-btn vc-btn-outline text-sm py-2 px-3"
      >
        <IconWhats size={18} /> WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(full)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="vc-btn vc-btn-outline text-sm py-2 px-3"
      >
        <IconChat size={18} /> Facebook
      </a>
      <button
        type="button"
        onClick={copy}
        className="vc-btn vc-btn-outline text-sm py-2 px-3"
      >
        {copied ? (
          <>
            <IconCheck size={18} /> Copiado
          </>
        ) : (
          "Copiar link"
        )}
      </button>
    </div>
  );
}
