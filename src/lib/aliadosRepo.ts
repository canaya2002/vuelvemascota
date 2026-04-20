import { db } from "./db";

export type AliadoPublic = {
  id: string;
  slug: string;
  tipo: "rescatistas" | "veterinarias" | "aliados";
  organizacion: string;
  responsable: string;
  ciudad: string;
  sitio: string | null;
  notas: string | null;
  created_at: string;
};

export type AliadoFull = AliadoPublic & {
  email: string;
  telefono: string;
  estado: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export const aliadosRepo = {
  async listVerificados(opts: { tipo?: string; ciudad?: string; limit?: number } = {}): Promise<AliadoPublic[]> {
    const sql = db.raw;
    if (!sql) return [];
    const limit = Math.min(opts.limit ?? 100, 300);
    try {
      const rows = (await sql`
        select id, slug, tipo, organizacion, responsable, ciudad, sitio, notas, created_at
        from aliados
        where estado = 'verificado' and slug is not null
          ${opts.tipo ? sql`and tipo = ${opts.tipo}` : sql``}
          ${opts.ciudad ? sql`and lower(ciudad) = lower(${opts.ciudad})` : sql``}
        order by organizacion asc
        limit ${limit}
      `) as unknown as AliadoPublic[];
      return rows;
    } catch (err) {
      console.error("[aliados:list:error]", err);
      return [];
    }
  },

  async getBySlug(slug: string): Promise<AliadoPublic | null> {
    const sql = db.raw;
    if (!sql) return null;
    try {
      const rows = (await sql`
        select id, slug, tipo, organizacion, responsable, ciudad, sitio, notas, created_at
        from aliados
        where slug = ${slug} and estado = 'verificado'
        limit 1
      `) as unknown as AliadoPublic[];
      return rows[0] ?? null;
    } catch {
      return null;
    }
  },

  async listPending(): Promise<AliadoFull[]> {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select id, slug, tipo, organizacion, responsable, email, telefono, ciudad, sitio, notas, estado, created_at
        from aliados
        where estado = 'pendiente'
        order by created_at desc
      `) as unknown as AliadoFull[];
      return rows;
    } catch {
      return [];
    }
  },

  async listAll(): Promise<AliadoFull[]> {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select id, slug, tipo, organizacion, responsable, email, telefono, ciudad, sitio, notas, estado, created_at
        from aliados
        order by
          case estado when 'pendiente' then 0 when 'verificado' then 1 else 2 end,
          created_at desc
        limit 200
      `) as unknown as AliadoFull[];
      return rows;
    } catch {
      return [];
    }
  },

  async verify(id: string): Promise<{ ok: boolean; slug?: string }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      const current = (await sql`
        select id, slug, organizacion, ciudad from aliados where id = ${id} limit 1
      `) as unknown as Array<{
        id: string;
        slug: string | null;
        organizacion: string;
        ciudad: string;
      }>;
      if (current.length === 0) return { ok: false };
      let slug = current[0].slug;
      if (!slug) {
        const base = slugify(
          `${current[0].organizacion}-${current[0].ciudad}`
        );
        const suffix = id.slice(0, 6);
        slug = `${base}-${suffix}`;
      }
      await sql`
        update aliados set estado = 'verificado', slug = ${slug} where id = ${id}
      `;
      return { ok: true, slug };
    } catch (err) {
      console.error("[aliados:verify:error]", err);
      return { ok: false };
    }
  },

  async reject(id: string): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`update aliados set estado = 'rechazado' where id = ${id}`;
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },
};
