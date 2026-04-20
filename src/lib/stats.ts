import { db } from "./db";

export type TransparenciaStats = {
  totalCasos: number;
  casosActivos: number;
  reencontrados: number;
  aliadosVerificados: number;
  avistamientos: number;
  donacionesMxn: number;
  donacionesCount: number;
  topCasosApoyados: Array<{
    slug: string;
    nombre: string | null;
    ciudad: string;
    donado_mxn: number;
    especie: string;
  }>;
  ciudadesActivas: number;
};

export async function getTransparenciaStats(): Promise<TransparenciaStats> {
  const sql = db.raw;
  const empty: TransparenciaStats = {
    totalCasos: 0,
    casosActivos: 0,
    reencontrados: 0,
    aliadosVerificados: 0,
    avistamientos: 0,
    donacionesMxn: 0,
    donacionesCount: 0,
    topCasosApoyados: [],
    ciudadesActivas: 0,
  };
  if (!sql) return empty;

  try {
    const [casoStats] = (await sql`
      select
        count(*)::int as total,
        count(*) filter (where estado = 'activo')::int as activos,
        count(*) filter (where estado = 'reencontrado')::int as reencontrados,
        count(distinct ciudad)::int as ciudades
      from casos
    `) as unknown as Array<{
      total: number;
      activos: number;
      reencontrados: number;
      ciudades: number;
    }>;

    const [aliadoStats] = (await sql`
      select count(*)::int as c
      from aliados where estado = 'verificado'
    `) as unknown as Array<{ c: number }>;

    const [avistStats] = (await sql`
      select count(*)::int as c from caso_avistamientos
    `) as unknown as Array<{ c: number }>;

    const [donStats] = (await sql`
      select
        coalesce(sum(amount), 0)::int as total,
        count(*) filter (where status = 'completed')::int as c
      from donaciones where status = 'completed'
    `) as unknown as Array<{ total: number; c: number }>;

    const topRows = (await sql`
      select c.slug, c.nombre, c.ciudad, c.donado_mxn, c.especie
      from casos c
      where c.donado_mxn > 0
      order by c.donado_mxn desc
      limit 5
    `) as unknown as Array<{
      slug: string;
      nombre: string | null;
      ciudad: string;
      donado_mxn: number;
      especie: string;
    }>;

    return {
      totalCasos: casoStats?.total ?? 0,
      casosActivos: casoStats?.activos ?? 0,
      reencontrados: casoStats?.reencontrados ?? 0,
      ciudadesActivas: casoStats?.ciudades ?? 0,
      aliadosVerificados: aliadoStats?.c ?? 0,
      avistamientos: avistStats?.c ?? 0,
      donacionesMxn: donStats?.total ?? 0,
      donacionesCount: donStats?.c ?? 0,
      topCasosApoyados: topRows ?? [],
    };
  } catch (err) {
    console.error("[stats:error]", err);
    return empty;
  }
}
