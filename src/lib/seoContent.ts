export type SeoHub = {
  slug: string;
  title: string;
  h1: string;
  intro: string;
  description: string;
  primaryCta: { label: string; href: string };
  steps: { t: string; b: string }[];
  tips: string[];
  related: { href: string; label: string }[];
  seed: number;
};

export const HUBS: Record<string, SeoHub> = {
  "mascota-perdida": {
    slug: "mascota-perdida",
    title: "Mascota perdida en México — Qué hacer ahora | VuelveaCasa",
    description:
      "¿Perdiste a tu mascota? Guía paso a paso para actuar en las primeras 24 horas. Publica un reporte gratis, activa tu zona y recibe pistas.",
    h1: "Mascota perdida: qué hacer en las primeras horas",
    intro:
      "Las primeras 24 horas son críticas. Respira, activa tu red y sigue estos pasos. VuelveaCasa te ayuda a coordinar la búsqueda sin depender solo de un post.",
    primaryCta: { label: "Reportar ahora mi mascota perdida", href: "/registro?rol=dueño" },
    steps: [
      { t: "Regresa al punto de extravío", b: "Muchas mascotas se quedan cerca de donde se perdieron las primeras horas. Si es un perro, lleva su correa; si es un gato, su transportadora o una cobija con olor familiar." },
      { t: "Difunde con fotos claras", b: "Sube una ficha con señas, colores y una foto de buena calidad. Entre más claro el caso, más probable que alguien lo reconozca." },
      { t: "Activa tu zona con alertas", b: "En VuelveaCasa tu reporte llega a vecinos, rescatistas y veterinarias aliadas de tu colonia." },
      { t: "Revisa refugios y clínicas cercanas", b: "Mascotas rescatadas suelen llegar ahí. Deja tu ficha y teléfono; pide que te avisen si ingresa algo parecido." },
    ],
    tips: [
      "Ofrecer recompensa en redes suele atraer fraudes. Mejor pide pruebas claras antes de entregar dinero.",
      "Si tiene chip, contacta al proveedor para actualizar tus datos y dejar aviso de extravío.",
      "Imprime volantes con enlace corto de tu caso para repartir en la zona.",
      "No te rindas: casos se resuelven incluso semanas después.",
    ],
    related: [
      { href: "/perro-perdido", label: "Perro perdido: guía específica" },
      { href: "/gato-perdido", label: "Gato perdido: guía específica" },
      { href: "/reportar-mascota", label: "Reportar mascota en VuelveaCasa" },
      { href: "/donar", label: "Apoyar rescates comunitarios" },
    ],
    seed: 1,
  },
  "mascota-encontrada": {
    slug: "mascota-encontrada",
    title: "Mascota encontrada — Qué hacer si rescataste un perro o gato | VuelveaCasa",
    description:
      "Guía para publicar correctamente una mascota encontrada en México: fotos, ubicación, hogar temporal y cómo conectar con quien la busca.",
    h1: "Encontré a una mascota: ¿qué hago ahora?",
    intro:
      "Agradecemos lo que hiciste. Aquí te explicamos cómo darle las mayores probabilidades de volver a casa o encontrar un hogar responsable.",
    primaryCta: { label: "Publicar mascota encontrada", href: "/registro?rol=encontre" },
    steps: [
      { t: "Documenta bien", b: "Fotos nítidas, ubicación exacta del hallazgo y cualquier dato (collar, chip, señas). Entre más claro el caso, más rápido la reconoce alguien." },
      { t: "Publica en VuelveaCasa", b: "Tu caso se conecta con personas que buscan una mascota con esas características, vecinos y aliados locales." },
      { t: "Revisa chip y veterinarias", b: "Una clínica aliada puede leer el chip gratis. Si no lo tiene, puedes pedir hogar temporal mientras aparece su familia." },
      { t: "Espera con prudencia", b: "Muchos dueños tardan horas en notar la pérdida. Dales tiempo antes de mover a la mascota o buscar adopción definitiva." },
    ],
    tips: [
      "No publiques tu dirección exacta. Usa tu colonia o un punto cercano.",
      "Pide pruebas claras antes de entregarla: fotos previas, veterinario, evidencia de su historia.",
      "Si no puedes resguardarla, activa la red de hogar temporal.",
      "Si está herida, busca atención inmediata; la red cubre casos de emergencia verificables.",
    ],
    related: [
      { href: "/encontre-un-perro", label: "Encontré un perro: guía" },
      { href: "/encontre-un-gato", label: "Encontré un gato: guía" },
      { href: "/hogar-temporal", label: "Ofrecer hogar temporal" },
      { href: "/rescatistas", label: "Para rescatistas y refugios" },
    ],
    seed: 11,
  },
  "perro-perdido": {
    slug: "perro-perdido",
    title: "Perro perdido en México — Guía rápida | VuelveaCasa",
    description:
      "Qué hacer cuando tu perro se pierde. Zonas típicas de búsqueda, cómo publicar, alertas por colonia y red de apoyo.",
    h1: "Perro perdido: actúa rápido, recupera confianza",
    intro:
      "Los perros suelen moverse en círculos amplios. Conviene cubrir radio de varios kilómetros y activar a los vecinos. Aquí lo esencial.",
    primaryCta: { label: "Publicar a mi perro perdido", href: "/registro?rol=dueño" },
    steps: [
      { t: "Recorre su ruta habitual", b: "Parques, paseos frecuentes, zonas con comida accesible. Pregunta a personas que pasan tiempo en la calle: vendedores, repartidores." },
      { t: "Publica con señas clave", b: "Raza aparente, tamaño, collar, cicatrices, chip, comportamiento ante desconocidos." },
      { t: "Activa alertas", b: "La red local recibe el aviso; pide compartir en chats de vecinos y grupos de la colonia." },
      { t: "Coordina con refugios", b: "Deja tu ficha en albergues cercanos. Si alguien lo recoge, revisa el chip primero." },
    ],
    tips: [
      "Evita perseguirlo si lo ves lejos: puede salir corriendo. Llámalo con calma y una prenda conocida.",
      "Ofrece su comida o juguete favorito; el olor familiar ayuda.",
      "En noche, usa linternas. Muchos perros aparecen por patios, bardas o locales semi-abiertos.",
    ],
    related: [
      { href: "/mascota-perdida", label: "Guía general: mascota perdida" },
      { href: "/reportar-mascota", label: "Reportar una mascota en VuelveaCasa" },
      { href: "/donar", label: "Apoyar a la red de rescate" },
    ],
    seed: 5,
  },
  "gato-perdido": {
    slug: "gato-perdido",
    title: "Gato perdido en México — Guía específica | VuelveaCasa",
    description:
      "Tips reales para buscar gatos perdidos: se esconden cerca, suelen salir de noche y responden al olor y sonidos conocidos.",
    h1: "Gato perdido: están más cerca de lo que parece",
    intro:
      "La mayoría de los gatos perdidos se mantienen a menos de 500 metros de casa. El secreto está en paciencia, sonido y olor familiar, más que en buscar a metros de distancia.",
    primaryCta: { label: "Publicar a mi gato perdido", href: "/registro?rol=dueño" },
    steps: [
      { t: "Busca cerca y en silencio", b: "Revisa patios, azoteas, estacionamientos, jardines, huecos, autos cercanos. Prefiere horarios de baja actividad (madrugada)." },
      { t: "Usa olores familiares", b: "Coloca su arenero usado y una cobija cerca de la puerta. Los gatos siguen rastros olfativos." },
      { t: "Publica y activa alertas", b: "Fotos claras, señas específicas y punto de extravío en VuelveaCasa." },
      { t: "Involucra vecinos", b: "Pide revisar patios, azoteas y sótanos. La mayoría aparece por vecinos que lo escuchan o ven." },
    ],
    tips: [
      "No lo llames fuerte de día: los gatos asustados se esconden más.",
      "En la noche, llama con voz baja y escucha maullidos en respuesta.",
      "Si hay cámaras de vigilancia alrededor, pide revisarlas.",
    ],
    related: [
      { href: "/mascota-perdida", label: "Guía general: mascota perdida" },
      { href: "/encontre-un-gato", label: "Encontré un gato: qué hago" },
      { href: "/donar", label: "Apoyar rescates felinos" },
    ],
    seed: 9,
  },
  "encontre-un-perro": {
    slug: "encontre-un-perro",
    title: "Encontré un perro — Qué hacer ahora | VuelveaCasa",
    description:
      "Guía para encontrar al dueño de un perro que acabas de rescatar. Revisión de chip, fotos, zona y red de apoyo.",
    h1: "Encontré un perro en la calle: paso a paso",
    intro:
      "Un perro en la calle no siempre es abandonado. Aquí cómo verificar si tiene familia y cómo actuar mientras aparece.",
    primaryCta: { label: "Publicar perro encontrado", href: "/registro?rol=encontre" },
    steps: [
      { t: "Observa y acércate con calma", b: "Evalúa si es sociable. Si no, pide apoyo a rescatistas en vez de arriesgarte." },
      { t: "Busca identificación", b: "Collar con placa, chip, aspecto general. Una veterinaria aliada puede leer el chip gratis." },
      { t: "Publica en VuelveaCasa", b: "Zona del hallazgo, fotos y cualquier dato relevante. Conectamos con quien lo busca." },
      { t: "Piensa el corto plazo", b: "¿Puedes quedártelo unos días? Si no, activa la red de hogar temporal." },
    ],
    tips: [
      "Antes de entregarlo, pide pruebas claras al supuesto dueño: fotos, veterinario, historial.",
      "Si está herido, llévalo con veterinaria aliada; la red puede apoyar con donaciones.",
    ],
    related: [
      { href: "/mascota-encontrada", label: "Guía general: mascota encontrada" },
      { href: "/hogar-temporal", label: "Ofrecer hogar temporal" },
    ],
    seed: 13,
  },
  "encontre-un-gato": {
    slug: "encontre-un-gato",
    title: "Encontré un gato — Qué hacer | VuelveaCasa",
    description:
      "Un gato aparece en tu colonia o casa: cómo diferenciar gato perdido, comunitario o abandonado, y qué pasos dar.",
    h1: "Encontré un gato: cómo saber si tiene familia",
    intro:
      "Los gatos son más difíciles de leer que los perros. A veces son comunitarios, otras veces son gatos perdidos que llevan días fuera. Aquí una guía realista.",
    primaryCta: { label: "Publicar gato encontrado", href: "/registro?rol=encontre" },
    steps: [
      { t: "Observa su estado", b: "Peso, pelaje, si responde a humanos. Un gato bien cuidado probablemente tiene familia cerca." },
      { t: "Publica con fotos nítidas", b: "Colores, ojos, patrón. Un gato con marcas claras es mucho más fácil de identificar." },
      { t: "Pregunta a vecinos", b: "Muchas veces aparecen cerca de donde vivían. Una publicación en la colonia puede resolverlo en horas." },
      { t: "Considera chip y esterilización", b: "Si llegan a rescatistas o veterinarias aliadas, pueden revisar chip y estado reproductivo." },
    ],
    tips: [
      "No lo muevas lejos de donde apareció: reduce probabilidad de reencuentro.",
      "Si está enfermo o es muy chiquito, busca atención inmediata.",
    ],
    related: [
      { href: "/mascota-encontrada", label: "Guía general: mascota encontrada" },
      { href: "/hogar-temporal", label: "Ofrecer hogar temporal" },
    ],
    seed: 15,
  },
  "reportar-mascota": {
    slug: "reportar-mascota",
    title: "Reportar mascota perdida o encontrada | VuelveaCasa",
    description:
      "Publica un reporte gratis y moviliza a la red comunitaria de VuelveaCasa en tu ciudad de México.",
    h1: "Reportar una mascota en VuelveaCasa",
    intro:
      "Publicar bien tu caso aumenta drásticamente las probabilidades de reencuentro. Aquí lo esencial.",
    primaryCta: { label: "Crear mi reporte gratis", href: "/registro" },
    steps: [
      { t: "Elige el tipo", b: "Perdida, encontrada o avistamiento. Cada tipo tiene flujos y visibilidad distinta." },
      { t: "Agrega fotos y señas", b: "Fotos con luz natural, de cuerpo completo y detalles. Señas específicas ayudan mucho." },
      { t: "Selecciona ubicación", b: "Punto del extravío o hallazgo. No hace falta dirección exacta." },
      { t: "Activa alertas", b: "Elige radio de difusión y recibe actualizaciones del caso en tu correo o WhatsApp." },
    ],
    tips: [
      "Usa nombres y contactos reales: genera confianza.",
      "Actualiza el caso cuando haya avance; la red sigue pendiente.",
    ],
    related: [
      { href: "/mascota-perdida", label: "Guía: mascota perdida" },
      { href: "/mascota-encontrada", label: "Guía: mascota encontrada" },
    ],
    seed: 20,
  },
  "ayuda-rescate": {
    slug: "ayuda-rescate",
    title: "Ayuda para rescate de mascotas en México | VuelveaCasa",
    description:
      "Dona, ofrece hogar temporal o sumate como voluntario. La red comunitaria que empuja casos reales de rescate.",
    h1: "Ayuda real para rescates de mascotas",
    intro:
      "Rescatar es más que recoger. Implica traslados, veterinaria, hogar temporal, difusión y adopción. Todos podemos sumar algo.",
    primaryCta: { label: "Apoyar con una donación", href: "/donar" },
    steps: [
      { t: "Dona a casos verificados", b: "Cada peso se documenta. Puedes elegir fondo comunitario o caso específico." },
      { t: "Ofrece hogar temporal", b: "Salvar vidas desde tu casa mientras encuentran hogar definitivo o aparece su familia." },
      { t: "Súmate como voluntario", b: "Traslados, difusión, avistamientos y apoyo operativo en tu zona." },
      { t: "Convertite en aliado", b: "Si tienes marca, clínica o refugio, entra a la red de aliados verificados." },
    ],
    tips: [
      "Un caso difundido por tu colonia puede ser el clic que faltaba.",
      "Hogar temporal por una semana puede cambiar una vida.",
    ],
    related: [
      { href: "/donar", label: "Cómo ayudar / donar" },
      { href: "/rescatistas", label: "Para rescatistas" },
      { href: "/veterinarias", label: "Para veterinarias" },
    ],
    seed: 22,
  },
  "hogar-temporal": {
    slug: "hogar-temporal",
    title: "Hogar temporal para perro o gato — Salva vidas desde tu casa | VuelveaCasa",
    description:
      "Un hogar temporal puede ser la diferencia entre calle y adopción. Guía para ofrecer y pedir resguardo en México.",
    h1: "Hogar temporal: ayuda sin tener que adoptar",
    intro:
      "No todos podemos adoptar, pero muchos podemos resguardar unos días o semanas. Aquí cómo funciona en la red comunitaria.",
    primaryCta: { label: "Ofrecer hogar temporal", href: "/registro?rol=voluntario" },
    steps: [
      { t: "Regístrate", b: "Nos dices tu ciudad, espacio, experiencia y preferencias (tamaño, especie, tiempos)." },
      { t: "Te conectamos", b: "Cuando un caso encaje con tu perfil, te avisamos. Tú decides si puedes." },
      { t: "Recibes apoyo", b: "Coordinamos con rescatistas y veterinarias aliadas. Si hay donaciones al caso, cubren gastos." },
      { t: "Se transiciona", b: "Buscamos hogar definitivo o reencuentro con familia. Tú estás en el centro de la operación." },
    ],
    tips: [
      "El resguardo temporal no obliga a adopción.",
      "Si nunca lo has hecho, empieza con casos cortos o menos demandantes.",
    ],
    related: [
      { href: "/mascota-encontrada", label: "Guía: mascota encontrada" },
      { href: "/donar", label: "Apoyar rescates" },
    ],
    seed: 24,
  },
};

export const HUB_SLUGS = Object.keys(HUBS);
