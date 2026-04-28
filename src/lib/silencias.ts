/**
 * Mute/block local — el lector decide a quién no quiere ver. Aplicable a chat
 * (filtra mensajes) y a vistas (no aparecen casos creados por silenciados).
 */

import { db, maybeBreak } from "./db";

export const silenciasRepo = {
  async list(silenciadorId: string): Promise<string[]> {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select silenciado_id from usuario_silencias
        where silenciador_id = ${silenciadorId}
      `) as unknown as { silenciado_id: string }[];
      return rows.map((r) => r.silenciado_id);
    } catch (err) {
      maybeBreak("silencias:list", err);
      return [];
    }
  },

  async add(silenciadorId: string, silenciadoId: string): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    if (silenciadorId === silenciadoId) return { ok: false };
    try {
      await sql`
        insert into usuario_silencias (silenciador_id, silenciado_id)
        values (${silenciadorId}, ${silenciadoId})
        on conflict do nothing
      `;
      return { ok: true };
    } catch (err) {
      maybeBreak("silencias:add", err);
      return { ok: false };
    }
  },

  async remove(silenciadorId: string, silenciadoId: string): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`
        delete from usuario_silencias
        where silenciador_id = ${silenciadorId}
          and silenciado_id = ${silenciadoId}
      `;
      return { ok: true };
    } catch (err) {
      maybeBreak("silencias:remove", err);
      return { ok: false };
    }
  },
};
