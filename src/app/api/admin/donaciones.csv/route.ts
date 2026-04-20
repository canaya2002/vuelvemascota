import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { FLAGS } from "@/lib/flags";

export const dynamic = "force-dynamic";

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  if (!FLAGS.auth) {
    return NextResponse.json({ error: "auth-disabled" }, { status: 401 });
  }
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "no-auth" }, { status: 401 });
  const meta = user.publicMetadata as { rol?: string } | undefined;
  if (meta?.rol !== "admin")
    return NextResponse.json({ error: "not-admin" }, { status: 403 });

  const sql = db.raw;
  if (!sql) {
    return NextResponse.json({ error: "db-disabled" }, { status: 503 });
  }

  type Row = {
    id: string;
    created_at: string;
    email: string | null;
    amount: number;
    currency: string;
    causa: string;
    recurrente: boolean;
    status: string;
    stripe_session_id: string | null;
    caso_slug: string | null;
    caso_nombre: string | null;
  };

  const rows = (await sql`
    select d.id, d.created_at, d.email, d.amount, d.currency, d.causa,
      d.recurrente, d.status, d.stripe_session_id,
      c.slug as caso_slug, c.nombre as caso_nombre
    from donaciones d
    left join casos c on c.id = d.caso_id
    order by d.created_at desc
  `) as unknown as Row[];

  const header = [
    "id",
    "fecha",
    "email",
    "monto_mxn",
    "currency",
    "causa",
    "recurrente",
    "status",
    "stripe_session_id",
    "caso_slug",
    "caso_nombre",
  ].join(",");

  const lines = rows.map((r) =>
    [
      csvEscape(r.id),
      csvEscape(new Date(r.created_at).toISOString()),
      csvEscape(r.email),
      csvEscape(r.amount),
      csvEscape(r.currency),
      csvEscape(r.causa),
      csvEscape(r.recurrente ? "1" : "0"),
      csvEscape(r.status),
      csvEscape(r.stripe_session_id),
      csvEscape(r.caso_slug),
      csvEscape(r.caso_nombre),
    ].join(",")
  );

  const body = [header, ...lines].join("\n");
  const today = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vuelveacasa-donaciones-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
