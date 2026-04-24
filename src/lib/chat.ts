/**
 * Chat de ayuda rápida (canales temáticos).
 *
 * Stub en memoria cuando DATABASE_URL no está configurado: devuelve un
 * conjunto de mensajes de ejemplo pero sin persistir nuevos envíos.
 */

import { db, maybeBreak } from "./db";

export type ChatCanal = "general" | "urgencias" | "veterinarias" | "rescatistas";

export const CANALES: {
  slug: ChatCanal;
  titulo: string;
  desc: string;
  accent: "brand" | "warn" | "accent" | "sky";
}[] = [
  {
    slug: "general",
    titulo: "Ayuda general",
    desc: "Preguntas rápidas del día a día, consejos y acompañamiento.",
    accent: "brand",
  },
  {
    slug: "urgencias",
    titulo: "Urgencias",
    desc: "Casos urgentes: atropellos, rescates peligrosos, emergencias.",
    accent: "warn",
  },
  {
    slug: "veterinarias",
    titulo: "Veterinarias",
    desc: "Canal para clínicas aliadas y consultas médicas rápidas.",
    accent: "accent",
  },
  {
    slug: "rescatistas",
    titulo: "Rescatistas",
    desc: "Coordinación entre rescatistas y refugios verificados.",
    accent: "sky",
  },
];

export type ChatMensaje = {
  id: string;
  autor_usuario_id: string | null;
  autor_nombre: string | null;
  canal: ChatCanal;
  cuerpo: string;
  created_at: string;
};

const STUB: ChatMensaje[] = [
  {
    id: "demo-1",
    autor_usuario_id: null,
    autor_nombre: "Laura · CDMX",
    canal: "general",
    cuerpo: "¡Hola! Mi vecino vio un perro con correa sin dueño en Del Valle. Voy para allá a ver si lo rescatamos.",
    created_at: new Date(Date.now() - 60_000 * 2).toISOString(),
  },
  {
    id: "demo-2",
    autor_usuario_id: null,
    autor_nombre: "Andrés · GDL",
    canal: "general",
    cuerpo: "¿Alguien conoce un veterinario de guardia 24h en Zapopan? Urgente.",
    created_at: new Date(Date.now() - 60_000 * 10).toISOString(),
  },
];

export const chatRepo = {
  async list(
    canal: ChatCanal,
    limit = 50,
    before?: string | null
  ): Promise<ChatMensaje[]> {
    const sql = db.raw;
    if (!sql) return STUB.filter((m) => m.canal === canal).slice(0, limit);
    // `before` es un ISO timestamp — paginación por cursor para "cargar más
    // viejos". Si viene basura, lo ignoramos silenciosamente en vez de 400.
    const cursor =
      before && !Number.isNaN(Date.parse(before)) ? new Date(before) : null;
    try {
      const rows = (await sql`
        select c.id, c.autor_usuario_id, coalesce(c.autor_nombre, u.nombre) as autor_nombre,
               c.canal, c.cuerpo, c.created_at
        from chat_mensajes c
        left join usuarios u on u.id = c.autor_usuario_id
        where c.oculto = false and c.canal = ${canal}
          ${cursor ? sql`and c.created_at < ${cursor}` : sql``}
        order by c.created_at desc
        limit ${Math.min(limit, 100)}
      `) as unknown as ChatMensaje[];
      // Mostrar los más viejos arriba (scroll natural)
      return rows.reverse();
    } catch (err) {
      maybeBreak("chat:list", err);
      return [];
    }
  },

  async post(data: {
    autor_usuario_id: string | null;
    autor_nombre: string | null;
    canal: ChatCanal;
    cuerpo: string;
  }): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`
        insert into chat_mensajes (autor_usuario_id, autor_nombre, canal, cuerpo)
        values (${data.autor_usuario_id}, ${data.autor_nombre}, ${data.canal}, ${data.cuerpo})
      `;
      return { ok: true };
    } catch (err) {
      maybeBreak("chat:post", err);
      return { ok: false };
    }
  },

  async report(id: string): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`update chat_mensajes set reportado = reportado + 1 where id = ${id}`;
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },
};
