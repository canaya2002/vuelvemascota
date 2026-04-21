const RAW = [
  "gettyimages-10093564-612x612 (1).jpg",
  "gettyimages-1060529042-612x612 (1).jpg",
  "gettyimages-1220822325-612x612.jpg",
  "gettyimages-1276788283-612x612 (1).jpg",
  "gettyimages-1295859169-612x612.jpg",
  "gettyimages-1300404055-612x612 (1).jpg",
  "gettyimages-1300658241-612x612.jpg",
  "gettyimages-1302836174-612x612 (1).jpg",
  "gettyimages-1302836174-612x612.jpg",
  "gettyimages-1302849963-612x612.jpg",
  "gettyimages-1307238003-612x612 (1).jpg",
  "gettyimages-1317523051-612x612 (1).jpg",
  "gettyimages-1345473066-612x612.jpg",
  "gettyimages-1348512805-612x612 (1).jpg",
  "gettyimages-1352214572-612x612.jpg",
  "gettyimages-1355274470-612x612 (1).jpg",
  "gettyimages-1357930308-612x612.jpg",
  "gettyimages-1367150296-612x612 (1).jpg",
  "gettyimages-1372099513-612x612.jpg",
  "gettyimages-1388833297-612x612 (1).jpg",
  "gettyimages-1388993174-612x612.jpg",
  "gettyimages-1392114708-612x612 (1).jpg",
  "gettyimages-1406278696-612x612.jpg",
  "gettyimages-1416869287-612x612 (1).jpg",
  "gettyimages-1450877757-612x612.jpg",
  "gettyimages-1452687636-612x612 (1).jpg",
  "gettyimages-1457916748-612x612.jpg",
  "gettyimages-1464498740-612x612 (1).jpg",
  "gettyimages-1472634899-612x612.jpg",
  "gettyimages-1473173661-612x612 (1).jpg",
  "gettyimages-1475033186-612x612.jpg",
  "gettyimages-1479175615-612x612.jpg",
  "gettyimages-1479372114-612x612 (1).jpg",
  "gettyimages-1598193080-612x612.jpg",
  "gettyimages-1661329207-612x612.jpg",
  "gettyimages-1840405915-612x612.jpg",
  "gettyimages-1994900578-612x612 (1).jpg",
  "gettyimages-2160576555-612x612.jpg",
  "gettyimages-2160576568-612x612 (1).jpg",
  "gettyimages-2172558364-612x612 (1).jpg",
  "gettyimages-2182319490-612x612.jpg",
  "gettyimages-2184260648-612x612.jpg",
  "gettyimages-2198220933-612x612.jpg",
  "gettyimages-539234375-612x612 (1).jpg",
  "gettyimages-618635454-612x612 (1).jpg",
  "gettyimages-912760940-612x612 (1).jpg",
  "gettyimages-979251076-612x612 (1).jpg",
  "gettyimages-sb10066465l-001-612x612 (1).jpg",
];

export const GALLERY: string[] = RAW.map(
  (name) => `/generales/${name.replace(/ /g, "%20")}`
);

export const HERO_VIDEO = "/videos/vuelveacasalanding.mp4";
// Poster fuera del rango usado por la home (0..18) para evitar duplicados visibles.
export const HERO_POSTER = GALLERY[19];

export function pickImage(seed: number): string {
  const i = ((seed % GALLERY.length) + GALLERY.length) % GALLERY.length;
  return GALLERY[i];
}

export function pickMany(count: number, offset = 0): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(pickImage(i + offset));
  return out;
}

/**
 * Rango sin duplicados. Útil para secciones que necesitan N imágenes únicas
 * y distintas a las de otras secciones.
 */
export function pickRange(start: number, count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(pickImage(start + i));
  return out;
}
