import { db, maybeBreak } from "./db";

export type DonacionRow = {
  id: string;
  stripe_session_id: string | null;
  email: string | null;
  amount: number;
  currency: string;
  causa: string;
  recurrente: boolean;
  status: string;
  caso_id: string | null;
  caso_slug: string | null;
  caso_nombre: string | null;
  created_at: string;
};

export type DonacionStats = {
  total: number;
  count: number;
  recurrentes: number;
  porCausa: Record<string, number>;
};

export const donacionesRepo = {
  /**
   * Devuelve las donaciones hechas con el email de la cuenta del usuario.
   * El email de Stripe Checkout suele coincidir con el de Clerk, pero puede
   * diferir. Dejamos el match por email en lowercase.
   */
  async listByEmail(email: string, limit = 100): Promise<DonacionRow[]> {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select d.id, d.stripe_session_id, d.email, d.amount, d.currency, d.causa,
          d.recurrente, d.status, d.caso_id, d.created_at,
          c.slug as caso_slug, c.nombre as caso_nombre
        from donaciones d
        left join casos c on c.id = d.caso_id
        where lower(d.email) = lower(${email})
        order by d.created_at desc
        limit ${limit}
      `) as unknown as DonacionRow[];
      return rows;
    } catch (err) {
      maybeBreak("donaciones:listByEmail", err);
      return [];
    }
  },

  async statsByEmail(email: string): Promise<DonacionStats> {
    const sql = db.raw;
    const empty: DonacionStats = {
      total: 0,
      count: 0,
      recurrentes: 0,
      porCausa: {},
    };
    if (!sql) return empty;
    try {
      const [totals] = (await sql`
        select coalesce(sum(amount), 0)::int as total,
          count(*)::int as c,
          count(*) filter (where recurrente)::int as rec
        from donaciones
        where lower(email) = lower(${email}) and status = 'completed'
      `) as unknown as Array<{ total: number; c: number; rec: number }>;
      const porCausa = (await sql`
        select causa, coalesce(sum(amount), 0)::int as total
        from donaciones
        where lower(email) = lower(${email}) and status = 'completed'
        group by causa
      `) as unknown as Array<{ causa: string; total: number }>;
      return {
        total: totals?.total ?? 0,
        count: totals?.c ?? 0,
        recurrentes: totals?.rec ?? 0,
        porCausa: Object.fromEntries(porCausa.map((r) => [r.causa, r.total])),
      };
    } catch (err) {
      maybeBreak("donaciones:statsByEmail", err);
      return empty;
    }
  },
};
