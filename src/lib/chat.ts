/**
 * Chat de la comunidad — rediseño 2026-04-27.
 *
 * Modelo:
 *   - Cada mensaje tiene `caso_id` (hilo del caso) o `canal='comunidad'`
 *     (un único canal abierto, gateado por reputación).
 *   - Los 4 canales legacy (general/urgencias/veterinarias/rescatistas) ya
 *     no se usan en la app móvil pero el repo los acepta para no romper
 *     llamadas viejas — irán al canal 'comunidad' transparentemente si llegan.
 *
 * Anti-spam:
 *   - `chat_reportes` cuenta reportes únicos por usuario; al llegar a 3 distintos
 *     se marca el mensaje como `oculto = true` y se aplica `shadow_until`
 *     +24h al autor (todos sus mensajes futuros nacen ocultos).
 *   - `usuario_silencias` filtra al lector.
 *   - El gate de reputación (alta < 7d || casos_verificados < 3) lo aplican
 *     las route handlers — aquí solo se persisten / leen mensajes.
 */

import { db, maybeBreak } from "./db";

export type ChatCanal =
  | "comunidad"
  | "general"
  | "urgencias"
  | "veterinarias"
  | "rescatistas";

export const CANALES: {
  slug: ChatCanal;
  titulo: string;
  desc: string;
  accent: "brand" | "warn" | "accent" | "sky";
}[] = [
  {
    slug: "comunidad",
    titulo: "Comunidad",
    desc: "Conversación abierta. Solo cuentas con reputación pueden iniciar mensajes.",
    accent: "brand",
  },
];

export type ChatMensaje = {
  id: string;
  autor_usuario_id: string | null;
  autor_nombre: string | null;
  caso_id: string | null;
  canal: ChatCanal | null;
  cuerpo: string;
  reportes: number;
  oculto: boolean;
  created_at: string;
};

const STUB: ChatMensaje[] = [];

function mapLegacyCanal(canal: string | undefined | null): ChatCanal {
  if (!canal) return "comunidad";
  if (canal === "comunidad") return "comunidad";
  return "comunidad";
}

export const chatRepo = {
  /**
   * Lee mensajes de un caso (preferido) o del canal global de comunidad.
   *  - viewerId: si viene, filtra autores en `usuario_silencias` del lector y
   *    también filtra mensajes con shadow del autor que no sean tuyos.
   */
  async list(
    scope: { caso_id?: string | null; canal?: ChatCanal | null },
    limit = 50,
    before?: string | null,
    viewerId?: string | null
  ): Promise<ChatMensaje[]> {
    const sql = db.raw;
    if (!sql) return STUB.slice(0, limit);

    const cursor =
      before && !Number.isNaN(Date.parse(before)) ? new Date(before) : null;

    try {
      const where = scope.caso_id
        ? sql`c.caso_id = ${scope.caso_id}`
        : sql`c.caso_id is null and (c.canal = 'comunidad' or c.canal is null)`;

      const blockJoin = viewerId
        ? sql`left join usuario_silencias s
              on s.silenciador_id = ${viewerId}
              and s.silenciado_id = c.autor_usuario_id`
        : sql``;

      const blockFilter = viewerId
        ? sql`and s.silenciador_id is null
              and (
                c.oculto = false
                or c.autor_usuario_id = ${viewerId}
              )`
        : sql`and c.oculto = false`;

      const rows = (await sql`
        select c.id,
               c.autor_usuario_id,
               coalesce(c.autor_nombre, u.nombre) as autor_nombre,
               c.caso_id,
               c.canal,
               c.cuerpo,
               c.reportado as reportes,
               c.oculto,
               c.created_at
        from chat_mensajes c
        left join usuarios u on u.id = c.autor_usuario_id
        ${blockJoin}
        where ${where}
          ${blockFilter}
          ${cursor ? sql`and c.created_at < ${cursor}` : sql``}
        order by c.created_at desc
        limit ${Math.min(limit, 100)}
      `) as unknown as ChatMensaje[];
      return rows.reverse();
    } catch (err) {
      maybeBreak("chat:list", err);
      return [];
    }
  },

  async post(data: {
    autor_usuario_id: string | null;
    autor_nombre: string | null;
    caso_id?: string | null;
    canal?: ChatCanal | null;
    cuerpo: string;
    /** Si el autor está bajo shadow_until > now(), nace oculto. */
    oculto?: boolean;
  }): Promise<{ ok: boolean; id?: string }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      const canal = data.caso_id ? null : mapLegacyCanal(data.canal);
      const rows = (await sql`
        insert into chat_mensajes
          (autor_usuario_id, autor_nombre, caso_id, canal, cuerpo, oculto)
        values
          (${data.autor_usuario_id}, ${data.autor_nombre}, ${data.caso_id ?? null}, ${canal}, ${data.cuerpo}, ${data.oculto ?? false})
        returning id
      `) as unknown as { id: string }[];
      return { ok: true, id: rows[0]?.id };
    } catch (err) {
      maybeBreak("chat:post", err);
      return { ok: false };
    }
  },

  /**
   * Reporta un mensaje. Si ya existe el reporte de ese usuario, idempotente.
   * Cuando alcanza 3 reportes únicos:
   *  - chat_mensajes.oculto = true
   *  - usuarios.shadow_until = now() + 24h sobre el autor
   * Devuelve `applied: true` cuando se disparó la acción.
   */
  async report(
    mensajeId: string,
    reportadoPor: string,
    motivo?: string
  ): Promise<{ ok: boolean; applied?: boolean; total?: number }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`
        insert into chat_reportes (mensaje_id, reportado_por, motivo)
        values (${mensajeId}, ${reportadoPor}, ${motivo ?? null})
        on conflict (mensaje_id, reportado_por) do nothing
      `;

      const counts = (await sql`
        select count(distinct reportado_por)::int as total
        from chat_reportes where mensaje_id = ${mensajeId}
      `) as unknown as { total: number }[];
      const total = counts[0]?.total ?? 0;

      if (total >= 3) {
        const rows = (await sql`
          update chat_mensajes
          set oculto = true,
              reportado = ${total}
          where id = ${mensajeId}
          returning autor_usuario_id
        `) as unknown as { autor_usuario_id: string | null }[];
        const autor = rows[0]?.autor_usuario_id;
        if (autor) {
          await sql`
            update usuarios
            set shadow_until = greatest(coalesce(shadow_until, now()), now() + interval '24 hours')
            where id = ${autor}
          `;
        }
        return { ok: true, applied: true, total };
      }

      await sql`update chat_mensajes set reportado = ${total} where id = ${mensajeId}`;
      return { ok: true, applied: false, total };
    } catch (err) {
      maybeBreak("chat:report", err);
      return { ok: false };
    }
  },

  /**
   * ¿El autor está bajo shadow_until? Si sí, los mensajes que postee deben
   * insertarse con oculto=true.
   */
  async isShadowed(usuarioId: string): Promise<boolean> {
    const sql = db.raw;
    if (!sql) return false;
    try {
      const rows = (await sql`
        select shadow_until from usuarios where id = ${usuarioId}
      `) as unknown as { shadow_until: string | null }[];
      const until = rows[0]?.shadow_until;
      return !!until && new Date(until) > new Date();
    } catch {
      return false;
    }
  },

  /**
   * Reputación del usuario. La regla actual:
   *   - cuenta < 7 días Y casos_verificados < 3  → solo puede postear en hilos
   *     de casos que él mismo creó.
   * Devuelve { ok, reason } para que el route handler decida.
   */
  async checkReputation(
    usuarioId: string,
    scope: { caso_id?: string | null }
  ): Promise<{ ok: boolean; reason?: string }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      const rows = (await sql`
        select created_at, casos_verificados
        from usuarios where id = ${usuarioId}
      `) as unknown as {
        created_at: string;
        casos_verificados: number;
      }[];
      const u = rows[0];
      if (!u) return { ok: true };
      const ageDays =
        (Date.now() - new Date(u.created_at).getTime()) / 86_400_000;
      const trusted = ageDays >= 7 || (u.casos_verificados ?? 0) >= 3;
      if (trusted) return { ok: true };

      // No-trusted: solo puede postear en sus propios casos.
      if (!scope.caso_id) {
        return {
          ok: false,
          reason:
            "Aún no puedes escribir en el canal abierto. Confirma 3 casos o espera 7 días desde tu registro.",
        };
      }
      const owns = (await sql`
        select 1 from casos where id = ${scope.caso_id} and creado_por = ${usuarioId}
      `) as unknown as unknown[];
      if (owns.length === 0) {
        return {
          ok: false,
          reason:
            "Aún no puedes escribir en hilos ajenos. Confirma 3 casos o espera 7 días.",
        };
      }
      return { ok: true };
    } catch {
      return { ok: true };
    }
  },
};
