import { db } from "./db";
import { haversineMeters } from "./alertas";

type CasoForMatch = {
  id: string;
  slug: string;
  tipo: "perdida" | "encontrada" | "avistamiento";
  especie: string;
  color: string | null;
  raza: string | null;
  tamano: string | null;
  fecha_evento: string;
  ciudad: string;
  lat: number | string | null;
  lng: number | string | null;
  descripcion: string | null;
  nombre: string | null;
};

function normalizeTokens(text: string | null | undefined): Set<string> {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3)
  );
}

function tokenOverlap(a: string | null, b: string | null): number {
  const A = normalizeTokens(a);
  const B = normalizeTokens(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  return shared / Math.min(A.size, B.size);
}

export function computeMatchScore(
  a: CasoForMatch,
  b: CasoForMatch
): { score: number; razones: Record<string, number | boolean | string> } {
  // 1. tipos complementarios obligatorios (perdida ↔ encontrada).
  const complementary =
    (a.tipo === "perdida" && b.tipo === "encontrada") ||
    (a.tipo === "encontrada" && b.tipo === "perdida");
  if (!complementary) return { score: 0, razones: { complementary: false } };
  if (a.especie !== b.especie) return { score: 0, razones: { especie: false } };

  const razones: Record<string, number | boolean | string> = {
    complementary: true,
    especie: true,
  };

  // 2. Distancia.
  let distScore = 0.3; // default si no hay coords en ambos
  if (a.lat && a.lng && b.lat && b.lng) {
    const d = haversineMeters(
      { lat: Number(a.lat), lng: Number(a.lng) },
      { lat: Number(b.lat), lng: Number(b.lng) }
    );
    razones.distancia_km = Number((d / 1000).toFixed(2));
    distScore = Math.max(0, 1 - d / 15000); // 0 a 15 km
  } else if (a.ciudad && b.ciudad && a.ciudad.toLowerCase() === b.ciudad.toLowerCase()) {
    distScore = 0.5;
    razones.ciudad_match = true;
  } else {
    return { score: 0, razones };
  }

  // 3. Fecha.
  const dA = new Date(a.fecha_evento).getTime();
  const dB = new Date(b.fecha_evento).getTime();
  const diffDays = Math.abs(dA - dB) / 86400000;
  razones.dias_diff = Math.round(diffDays * 10) / 10;
  const fechaScore = Math.max(0, 1 - diffDays / 60); // 60 días ventana

  // 4. Color (texto similar).
  const colorScore = tokenOverlap(a.color, b.color);
  if (colorScore > 0) razones.color = Number(colorScore.toFixed(2));

  // 5. Raza.
  const razaScore = tokenOverlap(a.raza, b.raza);
  if (razaScore > 0) razones.raza = Number(razaScore.toFixed(2));

  // 6. Tamaño match.
  const tamanoScore = a.tamano && b.tamano && a.tamano === b.tamano ? 1 : 0;
  if (tamanoScore) razones.tamano = true;

  // 7. Descripción/señas (opcional).
  const descScore = tokenOverlap(a.descripcion, b.descripcion);
  if (descScore > 0) razones.descripcion = Number(descScore.toFixed(2));

  // Weighted sum (max 1.0).
  const score =
    distScore * 0.35 +
    fechaScore * 0.25 +
    colorScore * 0.15 +
    razaScore * 0.1 +
    tamanoScore * 0.05 +
    descScore * 0.1;

  return { score: Math.min(1, score), razones };
}

/**
 * Busca candidatos complementarios recientes (≤60 días) y genera matches
 * con score >= threshold. No duplica si ya existe la pareja.
 */
export async function generateMatchesForCaso(
  casoId: string,
  threshold = 0.4
): Promise<number> {
  const sql = db.raw;
  if (!sql) return 0;

  try {
    const selfRows = (await sql`
      select id, slug, tipo, especie, color, raza, tamano, fecha_evento, ciudad, lat, lng, descripcion, nombre
      from casos where id = ${casoId} limit 1
    `) as unknown as CasoForMatch[];
    const self = selfRows[0];
    if (!self) return 0;
    const oppTipo: string =
      self.tipo === "perdida"
        ? "encontrada"
        : self.tipo === "encontrada"
        ? "perdida"
        : "";
    if (!oppTipo) return 0;

    const candidatos = (await sql`
      select id, slug, tipo, especie, color, raza, tamano, fecha_evento, ciudad, lat, lng, descripcion, nombre
      from casos
      where tipo = ${oppTipo}
        and especie = ${self.especie}
        and estado = 'activo'
        and id <> ${casoId}
        and fecha_evento >= (current_date - interval '90 days')
    `) as unknown as CasoForMatch[];

    let inserted = 0;
    for (const cand of candidatos) {
      const { score, razones } = computeMatchScore(self, cand);
      if (score < threshold) continue;
      const [a, b] = [self.id, cand.id].sort();
      try {
        await sql`
          insert into caso_matches (caso_a, caso_b, score, razones)
          values (${a}, ${b}, ${Number(score.toFixed(3))}, ${JSON.stringify(razones)}::jsonb)
          on conflict (caso_a, caso_b) do update set
            score = excluded.score,
            razones = excluded.razones
        `;
        inserted++;
      } catch (err) {
        console.error("[matching:insert:error]", err);
      }
    }
    return inserted;
  } catch (err) {
    console.error("[matching:generate:error]", err);
    return 0;
  }
}

export type MatchView = {
  id: string;
  other_id: string;
  other_slug: string;
  other_tipo: string;
  other_ciudad: string;
  other_color: string | null;
  other_nombre: string | null;
  other_foto: string | null;
  score: number;
  razones: Record<string, unknown> | null;
  estado: "sugerido" | "confirmado" | "descartado";
  created_at: string;
};

export async function listMatchesForCaso(
  casoId: string,
  includeAll = false
): Promise<MatchView[]> {
  const sql = db.raw;
  if (!sql) return [];
  try {
    const rows = (await sql`
      with m as (
        select id, caso_a, caso_b, score, razones, estado, created_at,
          case when caso_a = ${casoId} then caso_b else caso_a end as other_id
        from caso_matches
        where (caso_a = ${casoId} or caso_b = ${casoId})
          ${includeAll ? sql`` : sql`and estado <> 'descartado'`}
      )
      select m.id, m.other_id, m.score, m.razones, m.estado, m.created_at,
        c.slug as other_slug,
        c.tipo as other_tipo,
        c.ciudad as other_ciudad,
        c.color as other_color,
        c.nombre as other_nombre,
        (select url from caso_fotos where caso_id = c.id order by orden limit 1) as other_foto
      from m
      join casos c on c.id = m.other_id
      order by m.score desc, m.created_at desc
    `) as unknown as MatchView[];
    return rows;
  } catch (err) {
    console.error("[matching:list:error]", err);
    return [];
  }
}

export type MatchPair = {
  match_id: string;
  estado: string;
  score: number;
  a: MatchSide;
  b: MatchSide;
};

export type MatchSide = {
  id: string;
  slug: string;
  tipo: string;
  ciudad: string;
  nombre: string | null;
  especie: string;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  contacto_whatsapp: string | null;
  contacto_email: string | null;
  owner_email: string | null;
  owner_nombre: string | null;
};

export async function getMatchPair(matchId: string): Promise<MatchPair | null> {
  const sql = db.raw;
  if (!sql) return null;
  try {
    const rows = (await sql`
      select m.id as match_id, m.estado, m.score,
        ca.id as a_id, ca.slug as a_slug, ca.tipo as a_tipo, ca.ciudad as a_ciudad,
        ca.nombre as a_nombre, ca.especie as a_especie,
        ca.contacto_nombre as a_contacto_nombre, ca.contacto_telefono as a_contacto_telefono,
        ca.contacto_whatsapp as a_contacto_whatsapp, ca.contacto_email as a_contacto_email,
        ua.email as a_owner_email, ua.nombre as a_owner_nombre,
        cb.id as b_id, cb.slug as b_slug, cb.tipo as b_tipo, cb.ciudad as b_ciudad,
        cb.nombre as b_nombre, cb.especie as b_especie,
        cb.contacto_nombre as b_contacto_nombre, cb.contacto_telefono as b_contacto_telefono,
        cb.contacto_whatsapp as b_contacto_whatsapp, cb.contacto_email as b_contacto_email,
        ub.email as b_owner_email, ub.nombre as b_owner_nombre
      from caso_matches m
      join casos ca on ca.id = m.caso_a
      join casos cb on cb.id = m.caso_b
      left join usuarios ua on ua.id = ca.creado_por
      left join usuarios ub on ub.id = cb.creado_por
      where m.id = ${matchId}
      limit 1
    `) as unknown as Array<Record<string, unknown>>;
    const r = rows[0];
    if (!r) return null;
    const buildSide = (p: string): MatchSide => ({
      id: r[`${p}_id`] as string,
      slug: r[`${p}_slug`] as string,
      tipo: r[`${p}_tipo`] as string,
      ciudad: r[`${p}_ciudad`] as string,
      nombre: (r[`${p}_nombre`] as string | null) ?? null,
      especie: r[`${p}_especie`] as string,
      contacto_nombre: (r[`${p}_contacto_nombre`] as string | null) ?? null,
      contacto_telefono: (r[`${p}_contacto_telefono`] as string | null) ?? null,
      contacto_whatsapp: (r[`${p}_contacto_whatsapp`] as string | null) ?? null,
      contacto_email: (r[`${p}_contacto_email`] as string | null) ?? null,
      owner_email: (r[`${p}_owner_email`] as string | null) ?? null,
      owner_nombre: (r[`${p}_owner_nombre`] as string | null) ?? null,
    });
    return {
      match_id: r.match_id as string,
      estado: r.estado as string,
      score: Number(r.score ?? 0),
      a: buildSide("a"),
      b: buildSide("b"),
    };
  } catch (err) {
    console.error("[matching:getPair:error]", err);
    return null;
  }
}

export async function changeMatchState(
  matchId: string,
  clerkUserId: string,
  estado: "confirmado" | "descartado"
): Promise<{ ok: boolean }> {
  const sql = db.raw;
  if (!sql) return { ok: true };
  try {
    // Solo el dueño de alguno de los dos casos puede cambiar el match.
    const rows = await sql`
      update caso_matches m set estado = ${estado}
      from casos a, casos b, usuarios u
      where m.id = ${matchId}
        and a.id = m.caso_a and b.id = m.caso_b
        and u.clerk_user_id = ${clerkUserId}
        and (a.creado_por = u.id or b.creado_por = u.id)
      returning m.id
    `;
    return { ok: rows.length > 0 };
  } catch (err) {
    console.error("[matching:state:error]", err);
    return { ok: false };
  }
}
