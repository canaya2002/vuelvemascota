import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { CasoForm } from "@/components/forms/CasoForm";
import { storageEnabled } from "@/lib/storage";
import { FLAGS } from "@/lib/flags";
import { db } from "@/lib/db";

export const metadata = {
  title: "Nuevo caso",
};

export default async function Page() {
  if (!FLAGS.auth) {
    return (
      <div>
        <header className="mb-8">
          <Link
            href="/panel/casos"
            className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            ← Volver a mis casos
          </Link>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold">Nuevo caso</h1>
        </header>
        <p className="text-[var(--ink-soft)]">
          Cuentas aún no activas. Únete a la waitlist.
        </p>
      </div>
    );
  }

  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses?.find((e) => e.id === user?.primaryEmailAddressId)
      ?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";
  const row = user ? await db.getUserByClerkId(user.id) : null;
  const ciudad = (row?.ciudad as string | null | undefined) ?? null;

  return (
    <div>
      <header className="mb-8">
        <Link
          href="/panel/casos"
          className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          ← Volver a mis casos
        </Link>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold">Publicar un caso</h1>
        <p className="mt-2 text-[var(--ink-soft)] max-w-2xl">
          Tarda 2 minutos. Tu caso se publica en una URL compartible, se difunde en la zona y aparece en el listado público.
        </p>
        {primaryEmail && (
          <p className="mt-1 text-xs text-[var(--muted)]">
            Notificaciones del caso se enviarán a <strong>{primaryEmail}</strong>.
          </p>
        )}
      </header>

      <CasoForm storageEnabled={storageEnabled()} defaultCiudad={ciudad} />
    </div>
  );
}
