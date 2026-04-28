/**
 * Vistas guardadas — filtros nombrados creados por el usuario para descubrir
 * casos. Reemplazan los canales fijos: en vez de "Urgencias / Veterinarias",
 * cada uno arma su vista (radio, especies, tipo, ciudad, urgentes).
 *
 * Las vistas son privadas por default. El usuario puede compartir una vista
 * pública vía `share_slug`; otros usuarios pueden suscribirse pero no editar.
 */

import { db, maybeBreak } from "./db";

export type VistaFiltros = {
  /** km. 0 → sin filtro de radio. Requiere lat/lng del lector al consultar. */
  radio_km?: number;
  especies?: Array<"perro" | "gato" | "otro">;
  tipo?: Array<"perdida" | "encontrada" | "avistamiento">;
  ciudad?: string;
  municipio?: string;
  colonia?: string;
  estado_caso?: Array<"activo" | "cerrado" | "reencontrado">;
  /** Solo casos creados por usuarios con verificado=true. */
  solo_verificados?: boolean;
  /** Solo casos cuya creación fue hace ≤ N horas. */
  recientes_horas?: number;
};

export type Vista = {
  id: string;
  usuario_id: string;
  nombre: string;
  filtros: VistaFiltros;
  publica: boolean;
  share_slug: string | null;
  suscriptores: number;
  created_at: string;
  updated_at: string;
};

function randomShareSlug(): string {
  return Math.random().toString(36).slice(2, 9);
}

export const vistasRepo = {
  async list(usuarioId: string): Promise<Vista[]> {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select id, usuario_id, nombre, filtros, publica, share_slug,
               suscriptores, created_at, updated_at
        from vistas_filtros
        where usuario_id = ${usuarioId}
        order by created_at desc
      `) as unknown as Vista[];
      return rows;
    } catch (err) {
      maybeBreak("vistas:list", err);
      return [];
    }
  },

  async get(id: string): Promise<Vista | null> {
    const sql = db.raw;
    if (!sql) return null;
    try {
      const rows = (await sql`
        select id, usuario_id, nombre, filtros, publica, share_slug,
               suscriptores, created_at, updated_at
        from vistas_filtros
        where id = ${id}
      `) as unknown as Vista[];
      return rows[0] ?? null;
    } catch (err) {
      maybeBreak("vistas:get", err);
      return null;
    }
  },

  async getByShareSlug(slug: string): Promise<Vista | null> {
    const sql = db.raw;
    if (!sql) return null;
    try {
      const rows = (await sql`
        select id, usuario_id, nombre, filtros, publica, share_slug,
               suscriptores, created_at, updated_at
        from vistas_filtros
        where lower(share_slug) = lower(${slug}) and publica = true
      `) as unknown as Vista[];
      return rows[0] ?? null;
    } catch {
      return null;
    }
  },

  async create(
    usuarioId: string,
    data: { nombre: string; filtros: VistaFiltros; publica?: boolean }
  ): Promise<Vista | null> {
    const sql = db.raw;
    if (!sql) return null;
    try {
      const slug = data.publica ? randomShareSlug() : null;
      // postgres.js no acepta objetos crudos en parámetros; stringify + cast
      // explícito a jsonb. Mismo patrón se usa abajo en update().
      const filtrosJson = JSON.stringify(data.filtros);
      const rows = (await sql`
        insert into vistas_filtros (usuario_id, nombre, filtros, publica, share_slug)
        values (${usuarioId}, ${data.nombre}, ${filtrosJson}::jsonb, ${!!data.publica}, ${slug})
        returning id, usuario_id, nombre, filtros, publica, share_slug,
                  suscriptores, created_at, updated_at
      `) as unknown as Vista[];
      return rows[0] ?? null;
    } catch (err) {
      maybeBreak("vistas:create", err);
      return null;
    }
  },

  async update(
    id: string,
    usuarioId: string,
    data: Partial<{ nombre: string; filtros: VistaFiltros; publica: boolean }>
  ): Promise<Vista | null> {
    const sql = db.raw;
    if (!sql) return null;
    try {
      // share_slug solo se toca si publica fue explícitamente seteado:
      //  - publica=true  → genera nuevo slug
      //  - publica=false → null
      //  - undefined     → no toca el campo (CASE preserva el actual)
      const touchSlug = data.publica !== undefined;
      const newSlug =
        data.publica === true
          ? randomShareSlug()
          : data.publica === false
            ? null
            : null;

      const filtrosJson = data.filtros ? JSON.stringify(data.filtros) : null;

      const rows = (await sql`
        update vistas_filtros set
          nombre = coalesce(${data.nombre ?? null}, nombre),
          filtros = coalesce(${filtrosJson}::jsonb, filtros),
          publica = coalesce(${data.publica ?? null}, publica),
          share_slug = case
            when ${touchSlug} then ${newSlug}
            else share_slug
          end
        where id = ${id} and usuario_id = ${usuarioId}
        returning id, usuario_id, nombre, filtros, publica, share_slug,
                  suscriptores, created_at, updated_at
      `) as unknown as Vista[];
      return rows[0] ?? null;
    } catch (err) {
      maybeBreak("vistas:update", err);
      return null;
    }
  },

  async remove(id: string, usuarioId: string): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`
        delete from vistas_filtros
        where id = ${id} and usuario_id = ${usuarioId}
      `;
      return { ok: true };
    } catch (err) {
      maybeBreak("vistas:remove", err);
      return { ok: false };
    }
  },

  async subscribe(vistaId: string, usuarioId: string): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`
        insert into vista_suscripciones (vista_id, usuario_id)
        values (${vistaId}, ${usuarioId})
        on conflict do nothing
      `;
      await sql`
        update vistas_filtros set
          suscriptores = (
            select count(*)::int from vista_suscripciones where vista_id = ${vistaId}
          )
        where id = ${vistaId}
      `;
      return { ok: true };
    } catch (err) {
      maybeBreak("vistas:subscribe", err);
      return { ok: false };
    }
  },

  async unsubscribe(vistaId: string, usuarioId: string): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`
        delete from vista_suscripciones
        where vista_id = ${vistaId} and usuario_id = ${usuarioId}
      `;
      await sql`
        update vistas_filtros set
          suscriptores = (
            select count(*)::int from vista_suscripciones where vista_id = ${vistaId}
          )
        where id = ${vistaId}
      `;
      return { ok: true };
    } catch (err) {
      maybeBreak("vistas:unsubscribe", err);
      return { ok: false };
    }
  },
};
