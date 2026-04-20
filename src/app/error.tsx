"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <section className="py-24 md:py-32">
      <div className="vc-container max-w-2xl text-center">
        <span className="vc-eyebrow">Error</span>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold">
          Algo salió mal.
        </h1>
        <p className="mt-4 text-[var(--ink-soft)]">
          Nos tropezamos con un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            ID del error: <code>{error.digest}</code>
          </p>
        )}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="vc-btn vc-btn-primary"
          >
            Reintentar
          </button>
          <Link href="/" className="vc-btn vc-btn-outline">
            Ir al inicio
          </Link>
          <Link href="/contacto?tema=soporte" className="vc-btn vc-btn-outline">
            Reportar el problema
          </Link>
        </div>
      </div>
    </section>
  );
}
