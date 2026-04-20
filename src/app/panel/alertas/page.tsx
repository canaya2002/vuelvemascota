import { currentUser } from "@clerk/nextjs/server";
import { alertasRepo } from "@/lib/alertas";
import { FLAGS } from "@/lib/flags";
import { AlertaForm } from "@/components/panel/AlertaForm";
import { AlertaRowCard } from "@/components/panel/AlertaRow";
import { PushToggle } from "@/components/panel/PushToggle";
import { IconBell } from "@/components/Icons";

export const metadata = { title: "Mis alertas" };

export default async function Page() {
  let alertas: Awaited<ReturnType<typeof alertasRepo.listMine>> = [];
  if (FLAGS.auth) {
    const user = await currentUser();
    if (user) alertas = await alertasRepo.listMine(user.id);
  }

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">Alertas por zona</h1>
        <p className="mt-2 text-[var(--ink-soft)] max-w-2xl">
          Te avisamos por correo cuando se publica un caso cerca del área que configures. Puedes tener varias alertas, pausarlas o eliminarlas cuando quieras.
        </p>
      </header>

      <div className="mb-8">
        <PushToggle />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <IconBell size={18} /> Mis alertas
          </h2>
          {alertas.length === 0 ? (
            <div className="vc-card border-dashed bg-[var(--bg-alt)] text-center py-10">
              <p className="text-[var(--ink-soft)]">
                No tienes alertas todavía. Crea la primera del lado derecho.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {alertas.map((a) => (
                <AlertaRowCard
                  key={a.id}
                  alerta={{
                    ...a,
                    especies: a.especies as string[],
                    canales: a.canales as string[],
                  }}
                />
              ))}
            </ul>
          )}
        </div>
        <div>
          <AlertaForm />
        </div>
      </div>
    </div>
  );
}
