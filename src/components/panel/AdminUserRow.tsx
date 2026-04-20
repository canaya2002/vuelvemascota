"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  adminChangeUserRoleAction,
  type AdminActionState,
} from "@/lib/adminActions";

const initial: AdminActionState = { ok: false, message: "" };

const ROLES = [
  { v: "dueño", t: "Dueño" },
  { v: "voluntario", t: "Voluntario" },
  { v: "rescatista", t: "Rescatista" },
  { v: "veterinaria", t: "Veterinaria" },
  { v: "admin", t: "Admin" },
];

export function AdminUserRow({
  user,
}: {
  user: {
    id: string;
    email: string;
    nombre: string | null;
    ciudad: string | null;
    rol: string | null;
    created_at: string;
  };
}) {
  const [state, formAction] = useActionState(
    adminChangeUserRoleAction,
    initial
  );
  return (
    <tr>
      <td className="py-3">
        <strong>{user.nombre || "—"}</strong>
        <div className="text-xs text-[var(--muted)] break-all">{user.email}</div>
      </td>
      <td className="text-[var(--ink-soft)]">{user.ciudad ?? "—"}</td>
      <td>
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="user_id" value={user.id} />
          <RoleSelect current={user.rol ?? ""} />
          <Submit />
        </form>
        {state.message && (
          <p
            className={`text-[10px] mt-1 ${
              state.ok ? "text-[#0d6b52]" : "text-[var(--brand-ink)]"
            }`}
          >
            {state.message}
          </p>
        )}
      </td>
      <td className="text-[var(--muted)] text-xs">
        {new Date(user.created_at).toLocaleDateString("es-MX")}
      </td>
    </tr>
  );
}

function RoleSelect({ current }: { current: string }) {
  return (
    <select
      name="rol"
      defaultValue={current}
      className="text-xs border border-[var(--line-strong)] rounded-lg px-2 py-1 bg-white"
    >
      <option value="">Sin rol</option>
      {ROLES.map((r) => (
        <option key={r.v} value={r.v}>
          {r.t}
        </option>
      ))}
    </select>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-[10px] font-semibold px-2 py-1 rounded border border-[var(--line-strong)] bg-white hover:border-[var(--ink)]"
    >
      {pending ? "…" : "Guardar"}
    </button>
  );
}
