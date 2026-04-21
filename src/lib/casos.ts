import { db, maybeBreak } from "./db";

export type CasoTipo = "perdida" | "encontrada" | "avistamiento";
export type CasoEspecie = "perro" | "gato" | "otro";
export type CasoEstado = "activo" | "cerrado" | "reencontrado" | "archivado";

export type CasoInput = {
  tipo: CasoTipo;
  especie: CasoEspecie;
  nombre?: string | null;
  raza?: string | null;
  color?: string | null;
  tamano?: "chico" | "mediano" | "grande" | null;
  edad_aprox?: string | null;
  sexo?: "hembra" | "macho" | "desconocido" | null;
  senas?: string | null;
  descripcion?: string | null;
  fecha_evento: string; // YYYY-MM-DD
  estado?: string | null;
  ciudad: string;
  municipio?: string | null;
  colonia?: string | null;
  lat?: number | null;
  lng?: number | null;
  radio_m?: number | null;
  tiene_chip?: boolean | null;
  tiene_collar?: boolean | null;
  contacto_nombre?: string | null;
  contacto_telefono?: string | null;
  contacto_whatsapp?: string | null;
  contacto_email?: string | null;
};

export type CasoRow = CasoInput & {
  id: string;
  slug: string;
  estado: CasoEstado;
  creado_por: string | null;
  meta_donacion: number | null;
  donado_mxn: number;
  vistas: number;
  destacado: boolean;
  created_at: string;
  updated_at: string;
};

export type CasoConFotos = CasoRow & {
  fotos: { id: string; url: string; orden: number }[];
  autor?: {
    nombre: string | null;
    ciudad: string | null;
  } | null;
};

function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export function makeSlug(data: Pick<CasoInput, "tipo" | "especie" | "nombre" | "ciudad">) {
  const pieces = [
    data.tipo,
    data.nombre ? slugify(data.nombre) : data.especie,
    slugify(data.ciudad),
    randomSlugSuffix(),
  ]
    .filter(Boolean)
    .join("-");
  return pieces || `caso-${randomSlugSuffix()}`;
}

/* ------------------------- DB operations ------------------------- */

export const casosRepo = {
  async create(
    data: CasoInput,
    opts: { creadoPor: string | null }
  ): Promise<{ ok: true; id: string; slug: string } | { ok: false; error: string }> {
    const sql = db.raw;
    const slug = makeSlug(data);
    if (!sql) {
      console.log("[casos:create:stub]", { ...data, slug });
      return { ok: true, id: `stub-${slug}`, slug };
    }
    try {
      const rows = await sql`
        insert into casos (
          slug, tipo, especie, nombre, raza, color, tamano, edad_aprox, sexo,
          senas, descripcion, fecha_evento,
          estado, ciudad, municipio, colonia,
          lat, lng, radio_m,
          tiene_chip, tiene_collar,
          contacto_nombre, contacto_telefono, contacto_whatsapp, contacto_email,
          creado_por
        ) values (
          ${slug}, ${data.tipo}, ${data.especie},
          ${data.nombre ?? null}, ${data.raza ?? null}, ${data.color ?? null},
          ${data.tamano ?? null}, ${data.edad_aprox ?? null}, ${data.sexo ?? null},
          ${data.senas ?? null}, ${data.descripcion ?? null}, ${data.fecha_evento},
          ${data.estado ?? null}, ${data.ciudad}, ${data.municipio ?? null}, ${data.colonia ?? null},
          ${data.lat ?? null}, ${data.lng ?? null}, ${data.radio_m ?? 2000},
          ${data.tiene_chip ?? null}, ${data.tiene_collar ?? null},
          ${data.contacto_nombre ?? null}, ${data.contacto_telefono ?? null},
          ${data.contacto_whatsapp ?? null}, ${data.contacto_email ?? null},
          ${opts.creadoPor}
        )
        returning id, slug
      `;
      const row = rows[0] as { id: string; slug: string };
      return { ok: true, id: row.id, slug: row.slug };
    } catch (err) {
      console.error("[casos:create:error]", err);
      return {
        ok: false,
        error: err instanceof Error ? err.message : "db-error",
      };
    }
  },

  async addPhoto(casoId: string, url: string, orden = 0) {
    const sql = db.raw;
    if (!sql) {
      console.log("[casos:photo:stub]", { casoId, url });
      return { ok: true };
    }
    try {
      await sql`
        insert into caso_fotos (caso_id, url, orden)
        values (${casoId}, ${url}, ${orden})
      `;
      return { ok: true };
    } catch (err) {
      console.error("[casos:photo:error]", err);
      return { ok: false };
    }
  },

  async listPublic(filters: {
    tipo?: CasoTipo;
    especie?: CasoEspecie;
    estado?: string;
    ciudad?: string;
    municipio?: string;
    q?: string;
    lat?: number;
    lng?: number;
    radio_km?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<CasoConFotos[]> {
    const sql = db.raw;
    if (!sql) return [];
    const limit = Math.min(filters.limit ?? 24, 60);
    const offset = filters.offset ?? 0;
    const q = filters.q?.trim();
    const likePattern = q ? `%${q}%` : null;
    const geoOn =
      typeof filters.lat === "number" &&
      typeof filters.lng === "number" &&
      Number.isFinite(filters.lat) &&
      Number.isFinite(filters.lng);
    const radioKm = Math.max(1, Math.min(200, filters.radio_km ?? 10));
    try {
      const rows = (await sql`
        select c.*,
          coalesce(json_agg(
            json_build_object('id', f.id, 'url', f.url, 'orden', f.orden)
            order by f.orden
          ) filter (where f.id is not null), '[]') as fotos,
          ${
            geoOn
              ? sql`(
                2 * 6371 * asin(sqrt(
                  sin(radians((coalesce(c.lat::float, ${filters.lat!}) - ${filters.lat!})/2))^2 +
                  cos(radians(${filters.lat!})) * cos(radians(coalesce(c.lat::float, ${filters.lat!}))) *
                  sin(radians((coalesce(c.lng::float, ${filters.lng!}) - ${filters.lng!})/2))^2
                ))
              )`
              : sql`null::float`
          } as distancia_km
        from casos c
        left join caso_fotos f on f.caso_id = c.id
        where c.estado = 'activo'
          ${filters.tipo ? sql`and c.tipo = ${filters.tipo}` : sql``}
          ${filters.especie ? sql`and c.especie = ${filters.especie}` : sql``}
          ${filters.estado ? sql`and lower(c.estado) = lower(${filters.estado})` : sql``}
          ${filters.ciudad ? sql`and lower(c.ciudad) = lower(${filters.ciudad})` : sql``}
          ${filters.municipio ? sql`and lower(c.municipio) = lower(${filters.municipio})` : sql``}
          ${
            geoOn
              ? sql`and c.lat is not null and c.lng is not null
                and (
                  2 * 6371 * asin(sqrt(
                    sin(radians((c.lat::float - ${filters.lat!})/2))^2 +
                    cos(radians(${filters.lat!})) * cos(radians(c.lat::float)) *
                    sin(radians((c.lng::float - ${filters.lng!})/2))^2
                  ))
                ) <= ${radioKm}`
              : sql``
          }
          ${
            likePattern
              ? sql`and (
                coalesce(c.nombre,'') ilike ${likePattern}
                or coalesce(c.descripcion,'') ilike ${likePattern}
                or coalesce(c.senas,'') ilike ${likePattern}
                or coalesce(c.raza,'') ilike ${likePattern}
                or coalesce(c.color,'') ilike ${likePattern}
                or coalesce(c.colonia,'') ilike ${likePattern}
              )`
              : sql``
          }
        group by c.id
        order by ${geoOn ? sql`distancia_km asc,` : sql``} c.destacado desc, c.created_at desc
        limit ${limit} offset ${offset}
      `) as unknown as CasoConFotos[];
      return rows;
    } catch (err) {
      maybeBreak("casos:list", err);
      return [];
    }
  },

  async listMine(clerkUserId: string): Promise<CasoConFotos[]> {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select c.*,
          coalesce(json_agg(
            json_build_object('id', f.id, 'url', f.url, 'orden', f.orden)
            order by f.orden
          ) filter (where f.id is not null), '[]') as fotos
        from casos c
        join usuarios u on u.id = c.creado_por
        left join caso_fotos f on f.caso_id = c.id
        where u.clerk_user_id = ${clerkUserId}
        group by c.id
        order by c.created_at desc
      `) as unknown as CasoConFotos[];
      return rows;
    } catch (err) {
      console.error("[casos:listMine:error]", err);
      return [];
    }
  },

  async getBySlug(slug: string): Promise<CasoConFotos | null> {
    const sql = db.raw;
    if (!sql) return null;
    try {
      const rows = (await sql`
        select c.*,
          json_build_object('nombre', u.nombre, 'ciudad', u.ciudad) as autor,
          coalesce(json_agg(
            json_build_object('id', f.id, 'url', f.url, 'orden', f.orden)
            order by f.orden
          ) filter (where f.id is not null), '[]') as fotos
        from casos c
        left join usuarios u on u.id = c.creado_por
        left join caso_fotos f on f.caso_id = c.id
        where c.slug = ${slug}
        group by c.id, u.nombre, u.ciudad
        limit 1
      `) as unknown as CasoConFotos[];
      return rows[0] ?? null;
    } catch (err) {
      console.error("[casos:getBySlug:error]", err);
      return null;
    }
  },

  async incrementViews(id: string) {
    const sql = db.raw;
    if (!sql) return;
    try {
      await sql`update casos set vistas = vistas + 1 where id = ${id}`;
    } catch {
      /* ignore */
    }
  },

  async listSlugsForSitemap(limit = 500): Promise<{ slug: string; updated_at: string }[]> {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select slug, updated_at from casos
        where estado = 'activo'
        order by created_at desc
        limit ${limit}
      `) as unknown as { slug: string; updated_at: string }[];
      return rows;
    } catch {
      return [];
    }
  },

  async moderateAvistamiento(
    clerkUserId: string,
    avistamientoId: string,
    estado: "confirmado" | "descartado"
  ): Promise<{ ok: boolean; casoSlug?: string }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      // Autorización: dueño del caso o admin.
      const rows = (await sql`
        update caso_avistamientos a set estado = ${estado}
        from casos c, usuarios u
        where a.id = ${avistamientoId}
          and a.caso_id = c.id
          and u.clerk_user_id = ${clerkUserId}
          and (c.creado_por = u.id or u.rol = 'admin')
        returning c.slug
      `) as unknown as Array<{ slug: string }>;
      return { ok: rows.length > 0, casoSlug: rows[0]?.slug };
    } catch (err) {
      console.error("[casos:moderateAvist:error]", err);
      return { ok: false };
    }
  },

  async addAvistamiento(
    casoId: string,
    data: {
      autor_usuario_id?: string | null;
      autor_nombre?: string | null;
      autor_contacto?: string | null;
      lat?: number | null;
      lng?: number | null;
      fecha_avistado: string;
      descripcion: string;
      foto_url?: string | null;
    }
  ) {
    const sql = db.raw;
    if (!sql) {
      console.log("[casos:avistamiento:stub]", { casoId, ...data });
      return { ok: true };
    }
    try {
      await sql`
        insert into caso_avistamientos (caso_id, autor_usuario_id, autor_nombre, autor_contacto, lat, lng, fecha_avistado, descripcion, foto_url)
        values (${casoId}, ${data.autor_usuario_id ?? null}, ${data.autor_nombre ?? null}, ${data.autor_contacto ?? null}, ${data.lat ?? null}, ${data.lng ?? null}, ${data.fecha_avistado}, ${data.descripcion}, ${data.foto_url ?? null})
      `;
      return { ok: true };
    } catch (err) {
      console.error("[casos:avistamiento:error]", err);
      return { ok: false };
    }
  },

  async listMyReportedAvistamientos(clerkUserId: string) {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select a.id, a.descripcion, a.fecha_avistado, a.created_at, a.estado,
          c.slug as caso_slug, c.nombre as caso_nombre, c.ciudad as caso_ciudad,
          c.tipo as caso_tipo, c.especie as caso_especie,
          (select url from caso_fotos where caso_id = c.id order by orden limit 1) as caso_foto
        from caso_avistamientos a
        join usuarios u on u.id = a.autor_usuario_id
        join casos c on c.id = a.caso_id
        where u.clerk_user_id = ${clerkUserId}
        order by a.created_at desc
        limit 100
      `) as unknown as Array<{
        id: string;
        descripcion: string;
        fecha_avistado: string;
        created_at: string;
        estado: string;
        caso_slug: string;
        caso_nombre: string | null;
        caso_ciudad: string;
        caso_tipo: string;
        caso_especie: string;
        caso_foto: string | null;
      }>;
      return rows;
    } catch (err) {
      maybeBreak("casos:listMyAvist", err);
      return [];
    }
  },

  async listAvistamientos(casoId: string) {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select id, autor_nombre, lat, lng, fecha_avistado, descripcion, foto_url, estado, created_at
        from caso_avistamientos
        where caso_id = ${casoId} and estado <> 'descartado'
        order by created_at desc
      `) as unknown as Array<{
        id: string;
        autor_nombre: string | null;
        lat: number | null;
        lng: number | null;
        fecha_avistado: string;
        descripcion: string;
        foto_url: string | null;
        estado: string;
        created_at: string;
      }>;
      return rows;
    } catch {
      return [];
    }
  },

  async addUpdate(
    casoId: string,
    data: { autor_usuario_id: string | null; mensaje: string }
  ) {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      await sql`
        insert into caso_updates (caso_id, autor_usuario_id, mensaje)
        values (${casoId}, ${data.autor_usuario_id}, ${data.mensaje})
      `;
      return { ok: true };
    } catch (err) {
      console.error("[casos:update:error]", err);
      return { ok: false };
    }
  },

  async listUpdates(casoId: string) {
    const sql = db.raw;
    if (!sql) return [];
    try {
      const rows = (await sql`
        select u.id, u.mensaje, u.created_at, us.nombre as autor_nombre
        from caso_updates u
        left join usuarios us on us.id = u.autor_usuario_id
        where u.caso_id = ${casoId}
        order by u.created_at desc
      `) as unknown as Array<{
        id: string;
        mensaje: string;
        created_at: string;
        autor_nombre: string | null;
      }>;
      return rows;
    } catch {
      return [];
    }
  },

  /* ---------------- Sprint 2.2: edición ---------------- */

  async getMineBySlug(
    clerkUserId: string,
    slug: string
  ): Promise<CasoConFotos | null> {
    const sql = db.raw;
    if (!sql) return null;
    try {
      const rows = (await sql`
        select c.*,
          json_build_object('nombre', u.nombre, 'ciudad', u.ciudad) as autor,
          coalesce(json_agg(
            json_build_object('id', f.id, 'url', f.url, 'orden', f.orden)
            order by f.orden
          ) filter (where f.id is not null), '[]') as fotos
        from casos c
        join usuarios u on u.id = c.creado_por
        left join caso_fotos f on f.caso_id = c.id
        where c.slug = ${slug} and u.clerk_user_id = ${clerkUserId}
        group by c.id, u.nombre, u.ciudad
        limit 1
      `) as unknown as CasoConFotos[];
      return rows[0] ?? null;
    } catch (err) {
      console.error("[casos:getMineBySlug:error]", err);
      return null;
    }
  },

  async updateBySlug(
    clerkUserId: string,
    slug: string,
    patch: Partial<CasoInput>
  ): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      // Construye el set dinámicamente protegiendo solo campos whitelisted.
      const rows = await sql`
        update casos c
        set
          nombre = coalesce(${patch.nombre ?? null}, c.nombre),
          raza = coalesce(${patch.raza ?? null}, c.raza),
          color = coalesce(${patch.color ?? null}, c.color),
          tamano = coalesce(${patch.tamano ?? null}, c.tamano),
          edad_aprox = coalesce(${patch.edad_aprox ?? null}, c.edad_aprox),
          sexo = coalesce(${patch.sexo ?? null}, c.sexo),
          senas = coalesce(${patch.senas ?? null}, c.senas),
          descripcion = coalesce(${patch.descripcion ?? null}, c.descripcion),
          estado = coalesce(${patch.estado ?? null}, c.estado),
          ciudad = coalesce(${patch.ciudad ?? null}, c.ciudad),
          municipio = coalesce(${patch.municipio ?? null}, c.municipio),
          colonia = coalesce(${patch.colonia ?? null}, c.colonia),
          lat = coalesce(${patch.lat ?? null}, c.lat),
          lng = coalesce(${patch.lng ?? null}, c.lng),
          radio_m = coalesce(${patch.radio_m ?? null}, c.radio_m),
          tiene_chip = coalesce(${patch.tiene_chip ?? null}, c.tiene_chip),
          tiene_collar = coalesce(${patch.tiene_collar ?? null}, c.tiene_collar),
          contacto_nombre = coalesce(${patch.contacto_nombre ?? null}, c.contacto_nombre),
          contacto_telefono = coalesce(${patch.contacto_telefono ?? null}, c.contacto_telefono),
          contacto_whatsapp = coalesce(${patch.contacto_whatsapp ?? null}, c.contacto_whatsapp),
          contacto_email = coalesce(${patch.contacto_email ?? null}, c.contacto_email)
        from usuarios u
        where c.slug = ${slug}
          and c.creado_por = u.id
          and u.clerk_user_id = ${clerkUserId}
        returning c.id
      `;
      return { ok: rows.length > 0 };
    } catch (err) {
      console.error("[casos:update:error]", err);
      return { ok: false };
    }
  },

  async changeStateBySlug(
    clerkUserId: string,
    slug: string,
    estado: CasoEstado
  ): Promise<{ ok: boolean }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      const rows = (await sql`
        update casos c set estado = ${estado}
        from usuarios u
        where c.slug = ${slug}
          and c.creado_por = u.id
          and u.clerk_user_id = ${clerkUserId}
        returning c.id
      `) as unknown as Array<{ id: string }>;
      if (rows.length === 0) return { ok: false };

      // Al cerrar o reencontrar, descarta matches sugeridos vivos del caso.
      if (estado === "reencontrado" || estado === "cerrado") {
        const casoId = rows[0].id;
        try {
          await sql`
            update caso_matches set estado = 'descartado'
            where (caso_a = ${casoId} or caso_b = ${casoId})
              and estado = 'sugerido'
          `;
        } catch (err) {
          console.error("[casos:auto-archive:matches]", err);
        }
      }
      return { ok: true };
    } catch (err) {
      console.error("[casos:changeState:error]", err);
      return { ok: false };
    }
  },

  async deletePhoto(
    clerkUserId: string,
    fotoId: string
  ): Promise<{ ok: boolean; url?: string }> {
    const sql = db.raw;
    if (!sql) return { ok: true };
    try {
      const rows = (await sql`
        delete from caso_fotos f
        using casos c, usuarios u
        where f.id = ${fotoId}
          and f.caso_id = c.id
          and c.creado_por = u.id
          and u.clerk_user_id = ${clerkUserId}
        returning f.url
      `) as unknown as { url: string }[];
      return { ok: rows.length > 0, url: rows[0]?.url };
    } catch (err) {
      console.error("[casos:deletePhoto:error]", err);
      return { ok: false };
    }
  },

  async countPhotos(casoId: string): Promise<number> {
    const sql = db.raw;
    if (!sql) return 0;
    try {
      const rows = (await sql`
        select count(*)::int as c from caso_fotos where caso_id = ${casoId}
      `) as unknown as { c: number }[];
      return rows[0]?.c ?? 0;
    } catch {
      return 0;
    }
  },

  async getOwnerEmailByCasoId(casoId: string): Promise<{
    email: string | null;
    nombre: string | null;
  } | null> {
    const sql = db.raw;
    if (!sql) return null;
    try {
      const rows = (await sql`
        select u.email, u.nombre
        from casos c
        join usuarios u on u.id = c.creado_por
        where c.id = ${casoId}
        limit 1
      `) as unknown as { email: string | null; nombre: string | null }[];
      return rows[0] ?? null;
    } catch {
      return null;
    }
  },
};
