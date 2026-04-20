import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { usersRepo } from "@/lib/usersRepo";
import { FLAGS } from "@/lib/flags";
import { AdminUserRow } from "@/components/panel/AdminUserRow";

export const metadata = { title: "Usuarios · Admin" };

type SearchParams = Promise<{ q?: string }>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!FLAGS.auth) redirect("/panel");
  const user = await currentUser();
  if (!user) redirect("/entrar");
  const meta = user.publicMetadata as { rol?: string } | undefined;
  if (meta?.rol !== "admin") redirect("/panel");

  const sp = await searchParams;
  const q = (sp.q || "").trim() || undefined;
  const users = await usersRepo.listAll(200, q);

  return (
    <div>
      <header className="mb-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/panel/admin"
            className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            ← Volver a admin
          </Link>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold">Usuarios</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Administra roles y revisa quiénes están en la comunidad.
          </p>
        </div>
        <form
          action="/panel/admin/usuarios"
          method="get"
          className="flex gap-2"
        >
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar nombre, email o ciudad"
            className="vc-input text-sm"
          />
          <button type="submit" className="vc-btn vc-btn-dark text-sm">
            Buscar
          </button>
        </form>
      </header>

      {users.length === 0 ? (
        <p className="text-[var(--ink-soft)]">
          No se encontraron usuarios con esos filtros.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted)] uppercase text-xs">
                <th className="py-2">Usuario</th>
                <th>Ciudad</th>
                <th>Rol</th>
                <th>Alta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {users.map((u) => (
                <AdminUserRow key={u.id} user={u} />
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Total: {users.length}. Los cambios de rol se sincronizan con Clerk publicMetadata automáticamente.
          </p>
        </div>
      )}
    </div>
  );
}
