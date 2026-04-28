/**
 * Tipos compartidos entre web y app móvil.
 * Reflejan los contratos de la API `/api/v1/*`.
 *
 * Si cambia el schema de la DB, actualizar aquí y las apps consumidoras
 * quedan sincronizadas vía TypeScript.
 */

/* --------------------------- Casos ----------------------------- */

export type CasoTipo = "perdida" | "encontrada" | "avistamiento";
export type CasoEspecie = "perro" | "gato" | "otro";
export type CasoEstado = "activo" | "cerrado" | "reencontrado" | "archivado";
export type CasoTamano = "chico" | "mediano" | "grande";
export type CasoSexo = "hembra" | "macho" | "desconocido";

export type CasoFoto = {
  id: string;
  url: string;
  orden: number;
};

export type Caso = {
  id: string;
  slug: string;
  tipo: CasoTipo;
  especie: CasoEspecie;
  estado: CasoEstado;
  nombre: string | null;
  raza: string | null;
  color: string | null;
  tamano: CasoTamano | null;
  edad_aprox: string | null;
  sexo: CasoSexo | null;
  senas: string | null;
  descripcion: string | null;
  fecha_evento: string;
  ciudad: string;
  municipio: string | null;
  colonia: string | null;
  lat: number | null;
  lng: number | null;
  radio_m: number;
  tiene_chip: boolean | null;
  tiene_collar: boolean | null;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  contacto_whatsapp: string | null;
  contacto_email: string | null;
  /** usuarios.id del creador. Null si fue creado anónimo o el usuario fue borrado. */
  creado_por: string | null;
  destacado: boolean;
  vistas: number;
  donado_mxn: number;
  meta_donacion: number | null;
  fotos: CasoFoto[];
  distancia_km?: number | null;
  created_at: string;
  updated_at: string;
};

export type CasoInput = {
  tipo: CasoTipo;
  especie: CasoEspecie;
  fecha_evento: string;
  ciudad: string;
  nombre?: string | null;
  raza?: string | null;
  color?: string | null;
  tamano?: CasoTamano | null;
  edad_aprox?: string | null;
  sexo?: CasoSexo | null;
  senas?: string | null;
  descripcion?: string | null;
  estado?: string | null;
  municipio?: string | null;
  colonia?: string | null;
  lat?: number | null;
  lng?: number | null;
  radio_m?: number;
  tiene_chip?: boolean | null;
  tiene_collar?: boolean | null;
  contacto_nombre?: string | null;
  contacto_telefono?: string | null;
  contacto_whatsapp?: string | null;
  contacto_email?: string | null;
  photo_urls?: string[];
};

export type Avistamiento = {
  id: string;
  caso_id: string;
  autor_usuario_id: string | null;
  autor_nombre: string | null;
  autor_contacto: string | null;
  lat: number | null;
  lng: number | null;
  fecha_avistado: string;
  descripcion: string;
  estado: string;
  created_at: string;
};

export type CasoUpdate = {
  id: string;
  caso_id: string;
  autor_usuario_id: string | null;
  mensaje: string;
  created_at: string;
};

export type CasoDetailResponse = {
  caso: Caso;
  avistamientos: Avistamiento[];
  updates: CasoUpdate[];
};

/* -------------------------- Alertas ---------------------------- */

export type AlertaCanal = "email" | "push" | "whatsapp";

export type Alerta = {
  id: string;
  usuario_id: string;
  ciudad: string | null;
  colonia: string | null;
  lat: number | null;
  lng: number | null;
  radio_m: number;
  especies: CasoEspecie[];
  canales: AlertaCanal[];
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
};

/* --------------------------- Foros ----------------------------- */

export type ForoCategoria =
  | "experiencias"
  | "consejos"
  | "rescates"
  | "busqueda"
  | "adopcion"
  | "otros";

export type ForoHilo = {
  id: string;
  autor_usuario_id: string | null;
  autor_nombre?: string | null;
  titulo: string;
  cuerpo: string;
  categoria: ForoCategoria;
  ciudad: string | null;
  respuestas_count: number;
  created_at: string;
};

export type ForoRespuesta = {
  id: string;
  hilo_id: string;
  autor_usuario_id: string | null;
  autor_nombre?: string | null;
  cuerpo: string;
  created_at: string;
};

export type ForoHiloDetail = {
  hilo: ForoHilo;
  respuestas: ForoRespuesta[];
};

export type ForoHiloInput = {
  titulo: string;
  cuerpo: string;
  categoria: ForoCategoria;
  ciudad?: string | null;
};

/* --------------------------- Chat ------------------------------ */

/**
 * Canales legacy (general/urgencias/veterinarias/rescatistas) ya no se usan
 * en el cliente: el backend los mapea al canal único 'comunidad'. Mantenemos
 * los strings en el tipo para no romper Validations viejas que aún los usen.
 */
export type ChatCanal =
  | "comunidad"
  | "general"
  | "urgencias"
  | "veterinarias"
  | "rescatistas";

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

/* --------------------------- Vistas ---------------------------- */

export type VistaFiltros = {
  radio_km?: number;
  especies?: CasoEspecie[];
  tipo?: CasoTipo[];
  ciudad?: string;
  municipio?: string;
  colonia?: string;
  estado_caso?: Array<"activo" | "cerrado" | "reencontrado">;
  solo_verificados?: boolean;
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

export type VistaInput = {
  nombre: string;
  filtros: VistaFiltros;
  publica?: boolean;
};

/* --------------------------- Perfil ---------------------------- */

export type PerfilRol =
  | "dueño"
  | "voluntario"
  | "rescatista"
  | "veterinaria"
  | "aliado";

export type Perfil = {
  nombre: string | null;
  ciudad: string | null;
  estado: string | null;
  rol: PerfilRol | null;
  bio: string | null;
  foto_url: string | null;
  verificado: boolean;
};

export type PerfilMe = Perfil & {
  clerk_user_id: string;
  email: string;
  usuario_id: string | null;
  /** ISO timestamp si el usuario está bajo shadow-ban; null si no. */
  shadow_until?: string | null;
  /** Cuántos casos cerró como reencontrado — gate de reputación. */
  casos_verificados?: number;
};

export type PerfilInput = {
  nombre?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  rol?: PerfilRol | null;
  bio?: string | null;
};

/* -------------------------- Push ------------------------------- */

export type PushPlatform = "ios" | "android" | "web";

export type PushRegisterInput = {
  token: string;
  platform: PushPlatform;
  device_name?: string | null;
};

/* ------------------------ API envelope ------------------------- */

export type ApiOk<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErr = {
  ok: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export type ApiResult<T> = ApiOk<T> | ApiErr;
