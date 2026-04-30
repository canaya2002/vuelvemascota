#!/usr/bin/env bash
# ============================================================================
# VuelveaCasa — Backup manual de Supabase Postgres
# Uso:
#   export DATABASE_URL="postgres://postgres.xxx:pwd@host:5432/postgres"
#   ./scripts/backup-db.sh
#
# El backup se guarda en backups/AAAA-MM-DD_HHMM.sql.gz
# El .gitignore ya tiene backups/ (si no, este script lo agrega).
#
# IMPORTANTE: usa la conexión DIRECTA (puerto 5432), NO la pooler
# (puerto 6543). pg_dump no funciona vía pgbouncer en transaction mode.
# Cópiala desde Supabase → Settings → Database → "Connection string"
# (NO "Connection pooling").
# ============================================================================

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ Falta DATABASE_URL en el entorno."
  echo
  echo "Pon la connection string DIRECTA (puerto 5432) de Supabase:"
  echo
  echo '  export DATABASE_URL="postgres://postgres.xxx:[password]@aws-...:5432/postgres"'
  echo
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "❌ pg_dump no está instalado."
  echo "   Windows:  https://www.postgresql.org/download/windows/"
  echo "   macOS:    brew install postgresql"
  echo "   Linux:    apt-get install postgresql-client"
  exit 1
fi

# Si la URL apunta a pooler (puerto 6543) avisa pero deja seguir.
if echo "$DATABASE_URL" | grep -q ':6543/'; then
  echo "⚠️  DATABASE_URL apunta al pooler (6543). pg_dump puede fallar."
  echo "   Usa la conexión DIRECTA (5432). Continuando de todos modos..."
  sleep 2
fi

mkdir -p backups
STAMP=$(date +%Y-%m-%d_%H%M)
OUT="backups/${STAMP}.sql.gz"

# Asegura que backups/ está gitignored
if [ -f .gitignore ] && ! grep -q '^backups/' .gitignore; then
  echo "backups/" >> .gitignore
  echo "✓ Agregado backups/ a .gitignore"
fi

echo "→ Backup de DB a $OUT ..."
pg_dump \
  --no-owner \
  --no-privileges \
  --quote-all-identifiers \
  --format=plain \
  "$DATABASE_URL" \
  | gzip -9 > "$OUT"

SIZE=$(du -h "$OUT" | cut -f1)
echo "✓ Backup OK — $OUT ($SIZE)"

# Limpieza: deja solo los últimos 14 backups
echo "→ Limpiando backups viejos (conservando últimos 14) ..."
ls -1t backups/*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm -v
echo "✓ Listo"
