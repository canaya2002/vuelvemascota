"use client";
import { useEffect, useState } from "react";
import { IconArrow, IconX } from "./Icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem("vc-pwa-dismissed");
    if (!stored) return false;
    return Date.now() - Number(stored) < 1000 * 60 * 60 * 24 * 30;
  } catch {
    return false;
  }
}

export function PwaRegister() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(readDismissed);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore */
      });
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  if (!visible || !prompt || dismissed) return null;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setVisible(false);
  }

  function dismiss() {
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem("vc-pwa-dismissed", String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Instalar VuelveaCasa"
      className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[360px] z-50 vc-card shadow-lg"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar"
        className="absolute top-3 right-3 w-8 h-8 rounded-full border border-[var(--line-strong)] bg-white inline-flex items-center justify-center"
      >
        <IconX size={14} />
      </button>
      <h3 className="pr-8 text-lg font-semibold">
        Instala VuelveaCasa en tu celular
      </h3>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Acceso directo a alertas, casos y avistamientos desde tu pantalla principal. Sin ocupar espacio de app nativa.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={install}
          className="vc-btn vc-btn-primary text-sm"
        >
          Instalar <IconArrow size={14} />
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="vc-btn vc-btn-outline text-sm"
        >
          Más tarde
        </button>
      </div>
    </div>
  );
}
