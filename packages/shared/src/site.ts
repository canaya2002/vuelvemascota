/**
 * Fuente única de verdad para metadata del sitio y catálogo de ciudades.
 * Usado por la web (Next.js) y la app móvil (Expo).
 */

export const SITE = {
  name: "VuelveaCasa",
  tagline: "Reporta, encuentra y ayuda a que vuelvan a casa.",
  description:
    "VuelveaCasa es la red comunitaria de México para reportar mascotas perdidas, avistar mascotas encontradas, activar alertas por zona, ofrecer hogares temporales y donar para apoyar rescates verificados.",
  url: "https://vuelvecasa.com",
  locale: "es-MX",
  country: "MX",
  contact: {
    // email queda como reply-to interno y fallback en código de outbound
    // (no expuesto a usuarios — el dominio aún no recibe correo entrante).
    // Para canal público usar `formUrl` (ruta /contacto del sitio).
    email: "hola@vuelvecasa.com",
    ayuda: "ayuda@vuelvecasa.com",
    prensa: "prensa@vuelvecasa.com",
    phone: "+52 55 0000 0000",
    formUrl: "https://www.vuelvecasa.com/contacto",
  },
  social: {
    instagram: "https://instagram.com/vuelvecasa.mx",
    tiktok: "https://tiktok.com/@vuelvecasa.mx",
    facebook: "https://facebook.com/vuelvecasa",
    x: "https://x.com/vuelvecasa",
  },
  founded: "2026",
  legal: {
    razonSocial: "VuelveaCasa México",
  },
} as const;

export const CITIES = [
  { slug: "cdmx", name: "Ciudad de México", short: "CDMX", state: "Ciudad de México" },
  { slug: "guadalajara", name: "Guadalajara", short: "GDL", state: "Jalisco" },
  { slug: "monterrey", name: "Monterrey", short: "MTY", state: "Nuevo León" },
  { slug: "puebla", name: "Puebla", short: "PUE", state: "Puebla" },
  { slug: "queretaro", name: "Querétaro", short: "QRO", state: "Querétaro" },
  { slug: "merida", name: "Mérida", short: "MID", state: "Yucatán" },
  { slug: "tijuana", name: "Tijuana", short: "TIJ", state: "Baja California" },
  { slug: "leon", name: "León", short: "LEN", state: "Guanajuato" },
  { slug: "toluca", name: "Toluca", short: "TLC", state: "Estado de México" },
  { slug: "cancun", name: "Cancún", short: "CUN", state: "Quintana Roo" },
] as const;

export type CitySlug = (typeof CITIES)[number]["slug"];
