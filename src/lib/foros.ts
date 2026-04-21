/**
 * Repo de foros comunitarios.
 *
 * Funciona con DB (Supabase/Neon/Postgres) cuando DATABASE_URL está
 * configurado; en caso contrario retorna datos stub para desarrollo.
 */

import { db, maybeBreak } from "./db";

export type ForoCategoria =
  | "experiencias"
  | "consejos"
  | "rescates"
  | "busqueda"
  | "adopcion"
  | "otros";

export const CATEGORIAS: {
  slug: ForoCategoria;
  titulo: string;
  desc: string;
}[] = [
  {
    slug: "experiencias",
    titulo: "Experiencias y reencuentros",
    desc: "Historias de reencuentros, aprendizajes y agradecimientos.",
  },
  {
    slug: "consejos",
    titulo: "Consejos prácticos",
    desc: "Dudas, tips y recomendaciones de la comunidad.",
  },
  {
    slug: "rescates",
    titulo: "Rescates en curso",
    desc: "Coordinación y apoyo a rescates activos.",
  },
  {
    slug: "busqueda",
    titulo: "Búsqueda activa",
    desc: "Pistas, avistamientos y búsquedas en marcha.",
  },
  {
    slug: "adopcion",
    titulo: "Adopción responsable",
    desc: "Adopción, hogar temporal y cuidados.",
  },
  {
    slug: "otros",
    titulo: "Otros temas",
    desc: "Temas generales relacionados con la comunidad.",
  },
];

export type ForoHilo = {
  id: string;
  autor_usuario_id: string | null;
  titulo: string;
  cuerpo: string;
  categoria: ForoCategoria;
  ciudad: string | null;
  respuestas_count: number;
  created_at: string;
  autor_nombre?: string | null;
};

export type ForoRespuesta = {
  id: string;
  hilo_id: string;
  autor_usuario_id: string | null;
  cuerpo: string;
  created_at: string;
  autor_nombre?: string | null;
};

const STUB_HILOS: ForoHilo[] = [
  {
    id: "demo-1",
    autor_usuario_id: null,
    titulo: "Reencontramos a Tobi después de 9 días",
    cuerpo:
      "Compartimos un caso que se resolvió gracias a una vecina que lo vio en una tienda. Activar alertas por zona hizo la diferencia.",
    categoria: "experiencias",
    ciudad: "Ciudad de México",
    respuestas_count: 4,
    created_at: new Date(Date.now() - 3600_000 * 5).toISOString(),
    autor_nombre: "Comunidad VuelveaCasa",
  },
  {
    id: "demo-2",
    autor_usuario_id: null,
    titulo: "Cómo capturar a un gato asustadizo",
    cuerpo:
      "Trucos para acercarse sin asustar, uso de trampa humanitaria y consejos de rescatistas.",
    categoria: "consejos",
    ciudad: null,
    respuestas_count: 2,
    created_at: new Date(Date.now() - 3600_000 * 24).toISOString(),
    autor_nombre: "Rescatista aliado",
  },
];

export const forosRepo = {
  async list(params?: {
    categoria?: ForoCategoria;
    limit?: number;
  }): Promise<ForoHilo[]> {
    const limit = Math.min(params?.limit ?? 30, 50);
    const sql = db.raw;
    if (!sql) {
      return (params?.categoria
        ? STUB_HILOS.filter((h) => h.categoria === params.categoria)
        : STUB_HILOS
      ).slice(0, limit);
    }
    try {
      const rows = params?.categoria
        ? ((await sql`
            select h.*, u.nombre as autor_nombre
            from foro_hilos h
            left join usuarios u on u.id = h.autor_usuario_id
            where h.oculto = false and h.categoria = ${params.categoria}
            order by h.created_at desc
            limit ${limit}
          `) as unknown as ForoHilo[])
        : ((await sql`
            select h.*, u.nombre as autor_nombre
            from foro_hilos h
            left join usuarios u on u.id = h.autor_usuario_id
            where h.oculto = false
            order by h.created_at desc
            limit ${limit}
          `) as unknown as ForoHilo[]);
      return rows;
    } catch (err) {
      maybeBreak("foros:list", err);
      return [];
    }
  },

  async get(id: string): Promise<{
    hilo: ForoHilo | null;
    respuestas: ForoRespuesta[];
  }> {
    const sql = db.raw;
    if (!sql) {
      const hilo = STUB_HILOS.find((h) => h.id === id) ?? null;
      return { hilo, respuestas: [] };
    }
    try {
      const hiloRows = (await sql`
        select h.*, u.nombre as autor_nombre
        from foro_hilos h
        left join usuarios u on u.id = h.autor_usuario_id
        where h.id = ${id} and h.oculto = false
        limit 1
      `) as unknown as ForoHilo[];
      const hilo = hiloRows[0] ?? null;
      if (!hilo) return { hilo: null, respuestas: [] };
      const respuestas = (await sql`
        select r.*, u.nombre as autor_nombre
        from foro_respuestas r
        left join usuarios u on u.id = r.autor_usuario_id
        where r.hilo_id = ${id} and r.oculto = false
        order by r.created_at asc
      `) as unknown as ForoRespuesta[];
      return { hilo, respuestas };
    } catch (err) {
      maybeBreak("foros:get", err);
      return { hilo: null, respuestas: [] };
    }
  },

  async createHilo(data: {
    autor_usuario_id: string | null;
    titulo: string;
    cuerpo: string;
    categoria: ForoCategoria;
    ciudad?: string | null;
  }): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
    const sql = db.raw;
    if (!sql) {
      return { ok: true, id: `demo-${Date.now()}` };
    }
    try {
      const rows = (await sql`
        insert into foro_hilos
          (autor_usuario_id, titulo, cuerpo, categoria, ciudad)
        values
          (${data.autor_usuario_id}, ${data.titulo}, ${data.cuerpo},
           ${data.categoria}, ${data.ciudad ?? null})
        returning id
      `) as unknown as { id: string }[];
      return { ok: true, id: rows[0].id };
    } catch (err) {
      maybeBreak("foros:create", err);
      return { ok: false, error: "db-insert-failed" };
    }
  },

  async createRespuesta(data: {
    hilo_id: string;
    autor_usuario_id: string | null;
    cuerpo: string;
  }): Promise<{ ok: true } | { ok: false; error: string }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`
        insert into foro_respuestas (hilo_id, autor_usuario_id, cuerpo)
        values (${data.hilo_id}, ${data.autor_usuario_id}, ${data.cuerpo})
      `;
      await sql`
        update foro_hilos
           set respuestas_count = respuestas_count + 1,
               updated_at = now()
         where id = ${data.hilo_id}
      `;
      return { ok: true };
    } catch (err) {
      maybeBreak("foros:respuesta", err);
      return { ok: false, error: "db-insert-failed" };
    }
  },

  async report(kind: "hilo" | "respuesta", id: string) {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      if (kind === "hilo") {
        await sql`update foro_hilos set reportado = reportado + 1 where id = ${id}`;
      } else {
        await sql`update foro_respuestas set reportado = reportado + 1 where id = ${id}`;
      }
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },
};
