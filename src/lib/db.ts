/**
 * DB adapter — usa `postgres` sobre Supabase/Neon/Vercel Postgres cuando
 * DATABASE_URL está configurado. Si no, opera como stub (loggea en consola)
 * para que el desarrollo local y Fase 1 funcionen sin DB.
 *
 * Schema completo en docs/04-supabase.md + Sprint 2.0 extensions abajo.
 */

import postgres from "postgres";
import type { WaitlistInput, ContactInput, AllyInput } from "./validations";

type Sql = ReturnType<typeof postgres>;

// Singleton seguro entre hot-reloads de Next dev.
const globalForDb = globalThis as unknown as { _sql?: Sql };

function createClient(): Sql | null {
  if (!process.env.DATABASE_URL) return null;
  if (globalForDb._sql) return globalForDb._sql;
  const client = postgres(process.env.DATABASE_URL, {
    prepare: false, // Supabase pgbouncer en modo transaction no soporta prepared statements.
    idle_timeout: 20,
    max: 1, // Serverless: una conexión por función.
    connect_timeout: 10,
  });
  globalForDb._sql = client;
  return client;
}

const sql = createClient();

export function dbEnabled() {
  return sql !== null;
}

export type DonationRecord = {
  stripe_session_id: string;
  amount: number; // en MXN (pesos enteros)
  currency: string;
  causa: string;
  recurrente: boolean;
  email?: string;
  status: "pending" | "completed" | "failed";
};

export type UserRecord = {
  clerk_user_id: string;
  email: string;
  nombre?: string | null;
  ciudad?: string | null;
  rol?: string | null;
};

export const db = {
  /* -------------------- waitlist -------------------- */
  async insertWaitlist(data: WaitlistInput) {
    if (!sql) {
      console.log("[db:waitlist:stub]", data);
      return { ok: true };
    }
    try {
      await sql`
        insert into waitlist (nombre, email, ciudad, rol, acepta)
        values (${data.nombre}, ${data.email}, ${data.ciudad}, ${data.rol}, ${data.acepta})
        on conflict ((lower(email))) do update set
          nombre = excluded.nombre,
          ciudad = excluded.ciudad,
          rol = excluded.rol
      `;
      return { ok: true };
    } catch (err) {
      console.error("[db:waitlist:error]", err);
      return { ok: false };
    }
  },

  /* -------------------- contacto -------------------- */
  async insertContact(data: ContactInput) {
    if (!sql) {
      console.log("[db:contacto:stub]", data);
      return { ok: true };
    }
    try {
      await sql`
        insert into contacto (nombre, email, telefono, tema, mensaje)
        values (${data.nombre}, ${data.email}, ${data.telefono}, ${data.tema}, ${data.mensaje})
      `;
      return { ok: true };
    } catch (err) {
      console.error("[db:contacto:error]", err);
      return { ok: false };
    }
  },

  /* -------------------- aliados -------------------- */
  async insertAlly(data: AllyInput & { tipo: string }) {
    if (!sql) {
      console.log("[db:aliados:stub]", data);
      return { ok: true };
    }
    try {
      const sitio = data.sitio ?? null;
      const notas = data.notas ?? null;
      await sql`
        insert into aliados (tipo, organizacion, responsable, email, telefono, ciudad, sitio, notas)
        values (${data.tipo}, ${data.organizacion}, ${data.responsable}, ${data.email}, ${data.telefono}, ${data.ciudad}, ${sitio}, ${notas})
      `;
      return { ok: true };
    } catch (err) {
      console.error("[db:aliados:error]", err);
      return { ok: false };
    }
  },

  /* -------------------- donaciones -------------------- */
  async insertDonation(data: DonationRecord & { caso_id?: string | null }) {
    if (!sql) {
      console.log("[db:donaciones:stub]", data);
      return { ok: true };
    }
    try {
      await sql`
        insert into donaciones (stripe_session_id, email, amount, currency, causa, recurrente, status, caso_id)
        values (${data.stripe_session_id}, ${data.email ?? null}, ${data.amount}, ${data.currency}, ${data.causa}, ${data.recurrente}, ${data.status}, ${data.caso_id ?? null})
        on conflict (stripe_session_id) do update set status = excluded.status, caso_id = coalesce(excluded.caso_id, donaciones.caso_id)
      `;
      if (data.caso_id && data.status === "completed") {
        await sql`
          update casos set donado_mxn = donado_mxn + ${data.amount} where id = ${data.caso_id}
        `;
      }
      return { ok: true };
    } catch (err) {
      console.error("[db:donaciones:error]", err);
      return { ok: false };
    }
  },

  /* -------------------- usuarios (fase 2) -------------------- */
  async upsertUser(data: UserRecord) {
    if (!sql) {
      console.log("[db:users:stub]", data);
      return { ok: true };
    }
    try {
      await sql`
        insert into usuarios (clerk_user_id, email, nombre, ciudad, rol)
        values (${data.clerk_user_id}, ${data.email}, ${data.nombre ?? null}, ${data.ciudad ?? null}, ${data.rol ?? null})
        on conflict (clerk_user_id) do update set
          email = excluded.email,
          nombre = coalesce(excluded.nombre, usuarios.nombre),
          ciudad = coalesce(excluded.ciudad, usuarios.ciudad),
          rol = coalesce(excluded.rol, usuarios.rol)
      `;
      return { ok: true };
    } catch (err) {
      console.error("[db:users:error]", err);
      return { ok: false };
    }
  },

  async getUserByClerkId(clerkId: string) {
    if (!sql) return null;
    try {
      const rows = await sql`
        select id, clerk_user_id, email, nombre, ciudad, rol, created_at
        from usuarios where clerk_user_id = ${clerkId} limit 1
      `;
      return rows[0] ?? null;
    } catch (err) {
      console.error("[db:users:get:error]", err);
      return null;
    }
  },

  /* raw escape hatch para queries específicas de Sprint 2.1+ */
  raw: sql,
};
