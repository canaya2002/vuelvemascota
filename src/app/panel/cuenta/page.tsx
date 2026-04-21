import { UserProfile } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { FLAGS } from "@/lib/flags";
import { IconHeart, IconShield, IconSpark } from "@/components/Icons";

export const metadata = {
  title: "Mi cuenta · VuelveaCasa",
};

export default async function Page() {
  const user = FLAGS.auth ? await currentUser() : null;
  const primary =
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId) ||
    user?.emailAddresses?.[0];
  const nombre =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    primary?.emailAddress ||
    "Tu cuenta";

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          {user?.imageUrl ? (
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
            <h1 className="text-2xl md:text-3xl font-bold">Mi cuenta</h1>
            <p className="mt-1 text-[var(--ink-soft)] text-sm">
              {nombre}
              {primary?.emailAddress && (
                <span className="block text-xs text-[var(--muted)]">
                  {primary.emailAddress}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Hint
            icon={<IconSpark size={16} />}
            text="Cambia tu foto en la tarjeta de perfil (esquina superior derecha → Actualizar imagen)."
          />
          <Hint
            icon={<IconShield size={16} />}
            text="Activa verificación en dos pasos desde la sección de seguridad."
          />
          <Hint
            icon={<IconHeart size={16} />}
            text="Tu email y nombre son los que verán otros usuarios al comentar."
          />
        </div>
      </header>

      {FLAGS.auth ? (
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-sm border border-[var(--line)] rounded-2xl",
              navbar: "border-b border-[var(--line)]",
              profileSectionPrimaryButton: "text-[var(--brand)]",
            },
          }}
        />
      ) : (
        <div className="vc-card">
          <p className="text-[var(--ink-soft)]">
            El editor de cuenta estará disponible cuando activemos el sistema de
            cuentas.
          </p>
        </div>
      )}
    </div>
  );
}

function Hint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-[var(--bg-alt)] border border-[var(--line)] px-3 py-2.5">
      <span className="mt-0.5 text-[var(--brand)]">{icon}</span>
      <p className="text-xs text-[var(--ink-soft)] leading-snug">{text}</p>
    </div>
  );
}
