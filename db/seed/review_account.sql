-- ============================================================================
-- Cuenta de PRUEBA para App Store / Play Store review
--
-- IMPORTANTE — orden correcto:
--   1. Crea la cuenta en Clerk Dashboard PRIMERO con:
--        Email:     review-apple@vuelvecasa.com
--        Password:  fWRafvc62$Uh6&sx
--      (mismo password en ASC App Review Information y Play Console).
--
--   2. El webhook /api/clerk/webhook (user.created) auto-creará el row en
--      `usuarios` con el clerk_user_id. NO necesitas correr este SQL si el
--      webhook está activo.
--
--   3. Si el webhook NO está activo aún, corre el bloque DE ABAJO MANUAL
--      reemplazando el clerk_user_id con el real (lo ves en Clerk Dashboard
--      → Users → click el user → "User ID" arriba).
-- ============================================================================

-- Reemplaza 'user_XXXXXXXXXXXXXXX' con el clerk_user_id real de Clerk
-- (formato: user_2abcDEFghi456...)
insert into usuarios (
  clerk_user_id, email, nombre, ciudad, estado, rol, verificado, bio
) values (
  'user_REPLACE_WITH_CLERK_ID',
  'review-apple@vuelvecasa.com',
  'App Store Reviewer',
  'Ciudad de México',
  'CDMX',
  'voluntario',
  true,
  'Cuenta de prueba para revisión de App Store Connect / Google Play Console.'
)
on conflict (clerk_user_id) do nothing;

-- Verifica:
-- select id, email, nombre, rol from usuarios where email = 'review-apple@vuelvecasa.com';
