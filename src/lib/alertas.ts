import { db, maybeBreak } from "./db";
import type { CasoEspecie, CasoTipo } from "./casos";

export type AlertaRow = {
  id: string;
  usuario_id: string;
  ciudad: string | null;
  colonia: string | null;
  lat: number | null;
  lng: number | null;
  radio_m: number;
  especies: CasoEspecie[];
  canales: string[];
  activa: boolean;
  created_at: string;
};

export type AlertaInput = {
  ciudad?: string | null;
  colonia?: string | null;
  lat?: number | null;
  lng?: number | null;
  radio_m?: number;
  especies?: CasoEspecie[];
  canales?: string[];
};

/** Distancia haversine en metros. */
export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const alertasRepo = {
  async listMine(clerkUserId: string): Promise<AlertaRow[]> {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select a.*
        from alertas a
        join usuarios u on u.id = a.usuario_id
        where u.clerk_user_id = ${clerkUserId}
        order by a.created_at desc
      `) as unknown as AlertaRow[];
      return rows;
    } catch (err) {
      maybeBreak("alertas:listMine", err);
      return [];
    }
  },

  async create(
    clerkUserId: string,
    data: AlertaInput
  ): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) {
      console.log("[alertas:create:stub]", {
        has_ciudad: !!data.ciudad,
        has_coords: data.lat != null && data.lng != null,
        especies: data.especies?.length ?? 0,
        radio_m: data.radio_m,
      });
      return { ok: true };
    }
    try {
      const especies =
        data.especies && data.especies.length > 0
          ? data.especies
          : ["perro", "gato", "otro"];
      const canales =
        data.canales && data.canales.length > 0 ? data.canales : ["email"];
      const rows = await sql`
        insert into alertas (usuario_id, ciudad, colonia, lat, lng, radio_m, especies, canales, activa)
        select u.id, ${data.ciudad ?? null}, ${data.colonia ?? null}, ${data.lat ?? null}, ${data.lng ?? null},
               ${data.radio_m ?? 3000}, ${especies}::text[], ${canales}::text[], true
        from usuarios u where u.clerk_user_id = ${clerkUserId}
        returning id
      `;
      return { ok: rows.length > 0 };
    } catch (err) {
      maybeBreak("alertas:create", err);
      return { ok: false };
    }
  },

  async toggle(
    clerkUserId: string,
    alertaId: string,
    activa: boolean
  ): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      const rows = await sql`
        update alertas a set activa = ${activa}
        from usuarios u
        where a.id = ${alertaId} and a.usuario_id = u.id and u.clerk_user_id = ${clerkUserId}
        returning a.id
      `;
      return { ok: rows.length > 0 };
    } catch {
      return { ok: false };
    }
  },

  async deleteMine(
    clerkUserId: string,
    alertaId: string
  ): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      const rows = await sql`
        delete from alertas a
        using usuarios u
        where a.id = ${alertaId} and a.usuario_id = u.id and u.clerk_user_id = ${clerkUserId}
        returning a.id
      `;
      return { ok: rows.length > 0 };
    } catch {
      return { ok: false };
    }
  },

  /**
   * Devuelve alertas que deberían notificarse para un nuevo caso.
   * Regla simple: misma ciudad o (si hay lat/lng en la alerta y el caso) dentro del radio.
   * Se excluyen alertas ya enviadas al mismo caso/canal.
   */
  async findMatchesForCaso(caso: {
    id: string;
    tipo: CasoTipo;
    especie: CasoEspecie;
    ciudad: string;
    lat: number | null;
    lng: number | null;
  }): Promise<Array<AlertaRow & { user_email: string; user_nombre: string | null }>> {
    const sql = db.raw;
    if (!sql) return [];
    try {
      // 1. candidatos amplios por ciudad o con coordenadas.
      const rows = (await sql`
        select a.*, u.email as user_email, u.nombre as user_nombre
        from alertas a
        join usuarios u on u.id = a.usuario_id
        where a.activa = true
          and (${caso.especie} = any(a.especies))
          and (
            (a.ciudad is not null and lower(a.ciudad) = lower(${caso.ciudad}))
            or (a.lat is not null and a.lng is not null)
          )
          and not exists (
            select 1 from alerta_envios e
            where e.alerta_id = a.id and e.caso_id = ${caso.id} and e.canal = 'email'
          )
      `) as unknown as Array<
        AlertaRow & { user_email: string; user_nombre: string | null }
      >;

      // 2. filtramos por distancia si aplica.
      if (caso.lat == null || caso.lng == null) return rows;
      return rows.filter((a) => {
        if (a.ciudad && a.ciudad.toLowerCase() === caso.ciudad.toLowerCase())
          return true;
        if (a.lat == null || a.lng == null) return false;
        const d = haversineMeters(
          { lat: Number(a.lat), lng: Number(a.lng) },
          { lat: caso.lat!, lng: caso.lng! }
        );
        return d <= a.radio_m;
      });
    } catch (err) {
      maybeBreak("alertas:matches", err);
      return [];
    }
  },

  async markSent(alertaId: string, casoId: string, canal: string, exitoso: boolean) {
    const sql = db.raw;
    if (!sql) return;
    try {
      await sql`
        insert into alerta_envios (alerta_id, caso_id, canal, exitoso)
        values (${alertaId}, ${casoId}, ${canal}, ${exitoso})
        on conflict (alerta_id, caso_id, canal) do nothing
      `;
    } catch {
      /* ignore */
    }
  },
};
