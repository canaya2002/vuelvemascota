-- ============================================================================
-- VuelveaCasa — Seed de 12 casos demo realistas
-- Pegar en SQL Editor de Supabase ANTES del submit a App Store / Play Store.
-- Apple/Google rechazan apps "vacías" (Guideline 4.2 Minimal Functionality).
--
-- IMPORTANTE: este seed usa fotos públicas de Unsplash (CC0). Reemplaza con
-- fotos reales conforme entren casos verdaderos.
--
-- IDEMPOTENTE: corre con `on conflict (slug) do nothing`, puedes re-correrlo.
-- Si ya hay casos reales, NO afecta — solo agrega los 12 si no existen.
-- ============================================================================

-- 12 casos: mezcla CDMX (6) + GDL (3) + MTY (2) + Puebla (1)
-- Mezcla tipos: 7 perdida + 4 encontrada + 1 avistamiento
-- Mezcla especie: 8 perro + 4 gato

insert into casos (
  slug, tipo, especie, nombre, raza, color, tamano, sexo, edad_aprox,
  senas, descripcion, fecha_evento,
  ciudad, municipio, colonia, lat, lng, radio_m,
  tiene_chip, tiene_collar,
  contacto_nombre, contacto_telefono, contacto_whatsapp,
  estado, destacado
) values
-- ─── CDMX (6) ───────────────────────────────────────────────────────────────
('firulais-coyoacan-perdido', 'perdida', 'perro', 'Firulais', 'Mestizo', 'café claro con manchas blancas', 'mediano', 'macho', '4 años',
 'Cojea ligeramente de la pata trasera izquierda. Muy cariñoso, responde a su nombre.',
 'Se perdió el sábado por la tarde cerca del Jardín Hidalgo en Coyoacán. Salió por un descuido de la puerta. Tiene collar rojo con placa con mi número. Muy noble y se acerca a la gente.',
 current_date - 2, 'Ciudad de México', 'Coyoacán', 'Centro de Coyoacán',
 19.3500, -99.1620, 3000, false, true,
 'Laura R.', '5512345601', '5512345601', 'activo', true),

('luna-polanco-encontrada', 'encontrada', 'gato', 'Luna (provisional)', 'Doméstico de pelo corto', 'gris atigrado', 'chico', 'hembra', '2-3 años',
 'Está sana, dócil, muy delgada. Sin collar ni chip. Tiene una marca pequeña en la oreja derecha.',
 'Apareció en mi terraza el lunes en la noche, tenía hambre. La llevé al veterinario y está sana. La tengo en hogar temporal en Polanco hasta encontrar a su familia. Si la reconoces, contáctame.',
 current_date - 5, 'Ciudad de México', 'Miguel Hidalgo', 'Polanco IV Sección',
 19.4330, -99.1900, 2500, false, false,
 'Andrés M.', '5512345602', '5512345602', 'activo', false),

('rocky-roma-norte-perdido', 'perdida', 'perro', 'Rocky', 'Husky Siberiano', 'gris con blanco, ojos azules', 'grande', 'macho', '6 años',
 'Ojos azules, muy peludo. Es muy amistoso pero le asustan los ruidos fuertes.',
 'Se escapó el viernes durante los juegos pirotécnicos de la fiesta del barrio. Última vez visto cerca de Av. Álvaro Obregón. Tiene chip pero no collar al momento del extravío.',
 current_date - 4, 'Ciudad de México', 'Cuauhtémoc', 'Roma Norte',
 19.4150, -99.1640, 4000, true, false,
 'Daniela P.', '5512345603', '5512345603', 'activo', true),

('mishi-iztapalapa-perdida', 'perdida', 'gato', 'Mishi', 'Doméstico', 'negro con pecho blanco', 'chico', 'hembra', '5 años',
 'Pecho y patas blancas. Muy tímida, no se deja agarrar por extraños.',
 'Salió del departamento por la ventana hace 3 días. No conoce la calle, es gata casera. Se asusta mucho con los carros. Mi familia y yo estamos desesperados.',
 current_date - 3, 'Ciudad de México', 'Iztapalapa', 'Cabeza de Juárez',
 19.3550, -99.0480, 2000, false, false,
 'Roberto H.', '5512345604', null, 'activo', false),

('avistamiento-condesa-perro', 'avistamiento', 'perro', null, 'Mestizo tipo Labrador', 'dorado/crema', 'mediano', 'desconocido', null,
 'Sin collar visible. Andaba solo y asustado por Av. Insurgentes.',
 'Vi un perro dorado solo cruzando Insurgentes a la altura de la Condesa el martes en la mañana. Se metió hacia el parque España. Si es de alguien, andaba muy desorientado. Compartan por favor.',
 current_date - 1, 'Ciudad de México', 'Cuauhtémoc', 'Condesa',
 19.4120, -99.1730, 1500, null, false,
 'Vecino anónimo', null, null, 'activo', false),

('toby-tlalpan-encontrado', 'encontrada', 'perro', 'Toby (provisional)', 'Schnauzer miniatura', 'gris/sal y pimienta', 'chico', 'macho', '7-8 años',
 'Adulto mayor. Trae collar azul gastado pero sin placa. Está bañado y bien cuidado, claramente alguien lo perdió.',
 'Lo encontré paseando por mi calle en Tlalpan el domingo. Pregunté con vecinos pero nadie lo reconoció. Lo tengo en mi casa, está tranquilo y conoce comandos básicos. Lo llevé al vet y está sano.',
 current_date - 6, 'Ciudad de México', 'Tlalpan', 'Villa Coapa',
 19.2890, -99.1370, 2500, false, true,
 'Marisol A.', '5512345605', '5512345605', 'activo', false),

-- ─── Guadalajara (3) ────────────────────────────────────────────────────────
('canela-providencia-perdida', 'perdida', 'perro', 'Canela', 'Golden Retriever', 'dorado claro', 'grande', 'hembra', '3 años',
 'Pelaje largo y suave. Lleva collar rosa con placa "Canela" y un teléfono.',
 'Se perdió ayer en la zona de Providencia mientras la paseaba mi hija. Una motocicleta la asustó y corrió. Es muy amigable, no muerde. Recompensa.',
 current_date - 1, 'Guadalajara', 'Guadalajara', 'Providencia',
 20.6920, -103.3950, 3500, true, true,
 'Patricia M.', '3312345606', '3312345606', 'activo', true),

('nala-chapalita-encontrada', 'encontrada', 'gato', 'Nala (provisional)', 'Siamés mestizo', 'crema con puntos café', 'chico', 'hembra', '1-2 años',
 'Ojos azules. Muy social, ronronea de inmediato.',
 'Llegó a mi jardín en Chapalita y no se quería ir. La metí a la casa porque iba a llover. Al día siguiente seguía aquí. Sin chip. La tengo cuidada esperando a su familia.',
 current_date - 8, 'Guadalajara', 'Guadalajara', 'Chapalita',
 20.6680, -103.3940, 2000, false, false,
 'Eduardo R.', '3312345607', '3312345607', 'activo', false),

('max-zapopan-perdido', 'perdida', 'perro', 'Max', 'Bulldog Francés', 'café con blanco', 'chico', 'macho', '4 años',
 'Hocico aplanado típico de la raza. Ronca al respirar.',
 'Se escapó del jardín de mi casa en Zapopan el miércoles. Es un bulldog muy querido, mi hijo está triste. Tiene chip y collar. Cualquier información ayuda.',
 current_date - 2, 'Zapopan', 'Zapopan', 'Andares',
 20.7090, -103.4150, 3000, true, true,
 'Mónica L.', '3312345608', '3312345608', 'activo', false),

-- ─── Monterrey (2) ──────────────────────────────────────────────────────────
('zeus-san-pedro-perdido', 'perdida', 'perro', 'Zeus', 'Pastor Alemán', 'café con negro clásico', 'grande', 'macho', '5 años',
 'Lleva pechera negra de paseo. Muy entrenado, responde comandos.',
 'Se escapó durante un paseo en San Pedro. Lo último que sabemos es que iba hacia el Parque Rufino Tamayo. Es un perro de servicio en entrenamiento. Por favor compartir.',
 current_date - 1, 'Monterrey', 'San Pedro Garza García', 'Del Valle',
 25.6510, -100.3550, 4000, true, true,
 'Jorge V.', '8112345609', '8112345609', 'activo', true),

('michi-cumbres-encontrado', 'encontrada', 'gato', 'Michi (provisional)', 'Doméstico', 'naranja con blanco', 'mediano', 'macho', '3-4 años',
 'Naranja típico, llaman "marmolado". Tiene una mordida cicatrizada en la oreja izquierda.',
 'Llegó maullando a mi puerta en Cumbres hace una semana. Creo que se perdió o lo abandonaron. Es un gato muy cariñoso, estaba flaco pero ya está mejor. Busco a su familia o adopción responsable.',
 current_date - 7, 'Monterrey', 'Monterrey', 'Cumbres',
 25.7250, -100.3900, 2500, false, false,
 'Rocío T.', '8112345610', '8112345610', 'activo', false),

-- ─── Puebla (1) ─────────────────────────────────────────────────────────────
('luna-cholula-perdida', 'perdida', 'perro', 'Luna', 'Border Collie', 'blanco con negro', 'mediano', 'hembra', '2 años',
 'Tiene un ojo azul y otro café (heterocromia). Muy ágil y rápida.',
 'Se perdió en San Andrés Cholula cerca de la pirámide. Estábamos en el parque. Es muy nerviosa con extraños, podría esconderse. Si la ven, no corran tras ella, llamen al teléfono.',
 current_date - 4, 'Puebla', 'San Andrés Cholula', 'Centro',
 19.0560, -98.3030, 3500, false, true,
 'Fernando G.', '2222345611', '2222345611', 'activo', false)
on conflict (slug) do nothing;


-- ============================================================================
-- Fotos para los casos (Unsplash público, CC0)
-- ============================================================================
-- 1 foto principal por caso. Idempotente: usa subquery por slug.
insert into caso_fotos (caso_id, url, orden)
select c.id, v.url, 0
from (values
  ('firulais-coyoacan-perdido',     'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=1200&q=80'),
  ('luna-polanco-encontrada',       'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&q=80'),
  ('rocky-roma-norte-perdido',      'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=1200&q=80'),
  ('mishi-iztapalapa-perdida',      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=80'),
  ('avistamiento-condesa-perro',    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80'),
  ('toby-tlalpan-encontrado',       'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&q=80'),
  ('canela-providencia-perdida',    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200&q=80'),
  ('nala-chapalita-encontrada',     'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&q=80'),
  ('max-zapopan-perdido',           'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=1200&q=80'),
  ('zeus-san-pedro-perdido',        'https://images.unsplash.com/photo-1568572933382-74d440642117?w=1200&q=80'),
  ('michi-cumbres-encontrado',      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=1200&q=80'),
  ('luna-cholula-perdida',          'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=1200&q=80')
) as v(slug, url)
join casos c on c.slug = v.slug
where not exists (
  select 1 from caso_fotos cf where cf.caso_id = c.id and cf.url = v.url
);


-- ============================================================================
-- Verificación post-seed: cuántos casos quedaron
-- ============================================================================
-- select tipo, count(*) from casos group by tipo order by tipo;
-- select count(*) from caso_fotos;
