"use client";

/**
 * Global error boundary — captura errores que escaparon del root layout.
 * Diferente de error.tsx (route-level): este reemplaza TODO el árbol cuando
 * el layout raíz falla. Por eso debe llevar su propio <html>/<body>.
 *
 * Sentry recomienda enviar el error desde acá explícitamente porque
 * onRequestError no se dispara en este nivel.
 */

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es-MX">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
