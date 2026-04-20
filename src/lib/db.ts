/**
 * DB adapter — interfaz mínima para persistir submisiones de formularios.
 *
 * En fase 1 opera como "console adapter": loggea y retorna ok.
 * Cuando haya DB real, implementa `insertWaitlist`, `insertContact`,
 * `insertAlly`, `insertDonation` contra Supabase / Postgres / Neon.
 *
 * Esquema sugerido (Postgres):
 *
 *   create table waitlist (
 *     id uuid primary key default gen_random_uuid(),
 *     nombre text not null,
 *     email text not null,
 *     ciudad text not null,
 *     rol text not null,
 *     acepta boolean not null default true,
 *     created_at timestamptz not null default now()
 *   );
 *   create unique index waitlist_email_unique on waitlist (lower(email));
 *
 *   create table contacto (
 *     id uuid primary key default gen_random_uuid(),
 *     nombre text not null,
 *     email text not null,
 *     telefono text,
 *     tema text not null,
 *     mensaje text not null,
 *     created_at timestamptz not null default now()
 *   );
 *
 *   create table aliados (
 *     id uuid primary key default gen_random_uuid(),
 *     tipo text not null,
 *     organizacion text not null,
 *     responsable text not null,
 *     email text not null,
 *     telefono text not null,
 *     ciudad text not null,
 *     sitio text,
 *     notas text,
 *     estado text not null default 'pendiente', -- pendiente | verificado | rechazado
 *     created_at timestamptz not null default now()
 *   );
 *
 *   create table donaciones (
 *     id uuid primary key default gen_random_uuid(),
 *     stripe_session_id text unique,
 *     stripe_subscription_id text,
 *     email text,
 *     amount integer not null,             -- en centavos
 *     currency text not null default 'mxn',
 *     causa text not null,
 *     recurrente boolean not null default false,
 *     status text not null default 'pending',  -- pending | completed | failed
 *     created_at timestamptz not null default now()
 *   );
 */

import type { WaitlistInput, ContactInput, AllyInput } from "./validations";

export type DonationRecord = {
  stripe_session_id: string;
  amount: number; // en MXN
  currency: string;
  causa: string;
  recurrente: boolean;
  email?: string;
  status: "pending" | "completed" | "failed";
};

export const db = {
  async insertWaitlist(data: WaitlistInput) {
    console.log("[db:waitlist]", data);
    return { ok: true };
  },
  async insertContact(data: ContactInput) {
    console.log("[db:contacto]", data);
    return { ok: true };
  },
  async insertAlly(data: AllyInput & { tipo: string }) {
    console.log("[db:aliados]", data);
    return { ok: true };
  },
  async insertDonation(data: DonationRecord) {
    console.log("[db:donaciones]", data);
    return { ok: true };
  },
};
