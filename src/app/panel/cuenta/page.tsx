import { UserProfile } from "@clerk/nextjs";
import { FLAGS } from "@/lib/flags";

export default function Page() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Mi cuenta</h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          Nombre, email, foto, contraseñas y sesiones.
        </p>
      </header>

      {FLAGS.auth ? (
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-sm border border-[var(--line)] rounded-2xl",
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
