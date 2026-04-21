import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FLAGS } from "@/lib/flags";
import { db } from "@/lib/db";
import { PerfilForm } from "@/components/forms/PerfilForm";
import { IconArrow, IconShield, IconHeart, IconSpark } from "@/components/Icons";

export const metadata = {
  title: "Completar perfil · VuelveaCasa",
};

export default async function Page() {
  if (!FLAGS.auth) redirect("/");
  const user = await currentUser();
  if (!user) redirect("/entrar");

  const primary =
    user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId) ||
    user.emailAddresses?.[0];
  const nombreDefault =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null;

  // Cargar datos actuales desde la DB
  await db.upsertUser({
    clerk_user_id: user.id,
    email: primary?.emailAddress ?? "",
    nombre: nombreDefault,
  });
  const row = await db.getUserByClerkId(user.id);
  const defaults = {
    nombre: (row?.nombre as string | null | undefined) ?? nombreDefault,
    ciudad: (row?.ciudad as string | null | undefined) ?? null,
    estado: (row as { estado?: string | null } | null)?.estado ?? null,
    rol: (row?.rol as string | null | undefined) ?? null,
    bio: (row as { bio?: string | null } | null)?.bio ?? null,
  };
  const filled = Boolean(defaults.ciudad && defaults.nombre);
  const nombre = defaults.nombre || primary?.emailAddress || "Tu perfil";

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          {user.imageUrl ? (
            <span className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[var(--brand)] shadow-sm">
              <Image
                src={user.imageUrl}
                alt={`Foto de ${nombre}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
          ) : (
            <span className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--brand)] to-[#f472b6] inline-flex items-center justify-center text-white font-bold text-lg">
              {nombre
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Completar perfil</h1>
            <p className="mt-1 text-[var(--ink-soft)] text-sm">
              Agrega tu ciudad, rol y una foto para sumar credibilidad.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Badge
            icon={<IconSpark size={16} />}
            label="Más visibilidad"
            text="Los perfiles completos reciben más respuestas en foros y chat."
          />
          <Badge
            icon={<IconShield size={16} />}
            label="Más confianza"
            text="Una foto y ciudad real permite que vecinos confíen en tu reporte."
          />
          <Badge
            icon={<IconHeart size={16} />}
            label="Comunidad local"
            text="Te conectamos con rescatistas y veterinarias de tu zona."
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario principal */}
        <section className="lg:col-span-8">
          <div className="vc-card !p-6 md:!p-8">
            <PerfilForm defaults={defaults} />
          </div>

          {/* Info sobre foto (Clerk) */}
          <div className="mt-6 vc-card-glass !p-5">
            <p className="text-sm font-semibold text-[var(--ink)]">
              Foto de perfil
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)] leading-relaxed">
              La foto se gestiona desde tu cuenta (Clerk). Ve a tu cuenta, abre
              el bloque de perfil y elige &quot;Actualizar imagen&quot; — puedes
              subir una desde tu computadora o tomar una con tu cámara.
            </p>
            <Link
              href="/panel/cuenta"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]"
            >
              Abrir editor de cuenta para cambiar foto <IconArrow size={14} />
            </Link>
          </div>
        </section>

        {/* Aside */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="vc-card !p-5">
            <p className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">
              Tu perfil
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Estado" value={filled ? "Completo" : "Incompleto"} />
              <Row label="Email" value={primary?.emailAddress} />
              <Row label="Nombre" value={defaults.nombre || "—"} />
              <Row label="Ciudad" value={defaults.ciudad || "—"} />
              <Row label="Rol" value={defaults.rol || "—"} />
            </dl>
          </div>

          <div className="vc-card-glass !p-5 bg-[var(--brand-soft)]">
            <p className="text-sm font-semibold text-[var(--brand-ink)]">
              ¿Por qué pedimos esto?
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)] leading-relaxed">
              Para conectarte con la comunidad correcta cuando publiques un
              caso, abras un tema o pidas ayuda en el chat. Nada de esto se
              comparte sin tu consentimiento.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Badge({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--bg-alt)] border border-[var(--line)] px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-ink)]">
        <span>{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-xs text-[var(--ink-soft)] leading-snug">{text}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="text-[var(--ink)] font-medium truncate max-w-[60%] text-right">
        {value || "—"}
      </dd>
    </div>
  );
}
