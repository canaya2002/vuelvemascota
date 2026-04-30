#!/usr/bin/env bash
# ============================================================================
# VuelveaCasa — Smoke test producción
# Uso:  ./scripts/smoke-prod.sh [BASE_URL]
# Default BASE_URL = https://www.vuelvecasa.com
#
# Sale con código 0 si todo OK; 1 si algún check falló.
# Pensado para correr post-deploy y antes de submit a stores.
# ============================================================================

set -u

BASE="${1:-https://www.vuelvecasa.com}"
PASS=0
FAIL=0
WARN=0

# Colores (degradan a sin color si no hay TTY)
if [ -t 1 ]; then
  G="\033[32m"; R="\033[31m"; Y="\033[33m"; D="\033[2m"; B="\033[1m"; N="\033[0m"
else
  G=""; R=""; Y=""; D=""; B=""; N=""
fi

ok()   { echo -e "  ${G}✓${N} $1"; PASS=$((PASS+1)); }
err()  { echo -e "  ${R}✗${N} $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "  ${Y}!${N} $1"; WARN=$((WARN+1)); }
info() { echo -e "  ${D}·${N} $1"; }

http_status() {
  curl -s -o /dev/null -w "%{http_code}" -L --max-time 15 "$1"
}

http_body() {
  curl -s -L --max-time 15 "$1"
}

http_post_json() {
  curl -s -L --max-time 15 -X POST \
    -H "Content-Type: application/json" \
    -d "$2" \
    -w "\n__HTTP_CODE__%{http_code}" \
    "$1"
}

echo -e "${B}VuelveaCasa smoke test${N}  →  $BASE"
echo

# ── 1) /api/health ──────────────────────────────────────────────────────────
echo -e "${B}1) Health${N}"
HEALTH=$(http_body "$BASE/api/health")
HEALTH_CODE=$(http_status "$BASE/api/health")
if [ "$HEALTH_CODE" = "200" ] && echo "$HEALTH" | grep -q '"ok":true'; then
  ok "/api/health → 200 ok:true"
  # Sub-checks útiles
  echo "$HEALTH" | grep -q '"db":{"connected":true' && ok "DB conectada" || warn "DB no conectada — revisa DATABASE_URL"
  echo "$HEALTH" | grep -q '"stripe_live":true'      && ok "Stripe live ON"  || warn "Stripe live OFF — falta STRIPE_SECRET_KEY=sk_live_..."
  echo "$HEALTH" | grep -q '"push":true'             && ok "Push activo"     || warn "Push inactivo — faltan VAPID keys"
  echo "$HEALTH" | grep -q '"email":true'            && ok "Email activo"    || warn "Email inactivo — falta RESEND_API_KEY"
else
  err "/api/health → HTTP $HEALTH_CODE"
fi
echo

# ── 2) /api/v1/casos ────────────────────────────────────────────────────────
echo -e "${B}2) API casos públicos${N}"
CASOS_CODE=$(http_status "$BASE/api/v1/casos?limit=5")
CASOS=$(http_body "$BASE/api/v1/casos?limit=5")
if [ "$CASOS_CODE" = "200" ] && echo "$CASOS" | grep -q '"ok":true'; then
  ok "/api/v1/casos → 200 ok:true"
  COUNT=$(echo "$CASOS" | grep -o '"id"' | wc -l | tr -d ' ')
  if [ "$COUNT" -ge "1" ]; then
    ok "$COUNT casos retornados (seed cargado)"
  else
    warn "0 casos — corre db/seed/demo_casos.sql en Supabase"
  fi
else
  err "/api/v1/casos → HTTP $CASOS_CODE"
fi
echo

# ── 3) /api/v1/vistas (debe ser 401) ────────────────────────────────────────
echo -e "${B}3) Auth gate (vistas requiere login)${N}"
VISTAS_CODE=$(http_status "$BASE/api/v1/vistas")
if [ "$VISTAS_CODE" = "401" ]; then
  ok "/api/v1/vistas → 401 (auth bloqueando bien)"
else
  err "/api/v1/vistas → HTTP $VISTAS_CODE (esperaba 401)"
fi
echo

# ── 4) /api/donar/checkout ──────────────────────────────────────────────────
echo -e "${B}4) Donar checkout${N}"
DONAR_RESP=$(http_post_json "$BASE/api/donar/checkout" '{"amount":100,"causa":"fondo","currency":"mxn"}')
DONAR_CODE=$(echo "$DONAR_RESP" | sed -n 's/.*__HTTP_CODE__\([0-9]*\).*/\1/p')
DONAR_BODY=$(echo "$DONAR_RESP" | sed 's/__HTTP_CODE__[0-9]*//')
if [ "$DONAR_CODE" = "200" ]; then
  if echo "$DONAR_BODY" | grep -q 'checkout.stripe.com'; then
    ok "/api/donar/checkout → URL Stripe Checkout válida"
  elif echo "$DONAR_BODY" | grep -q '"preview":true'; then
    warn "/api/donar/checkout → modo preview (Stripe no configurado en live)"
  else
    warn "/api/donar/checkout → 200 pero sin URL Stripe; revisa body"
  fi
else
  err "/api/donar/checkout → HTTP $DONAR_CODE"
fi
echo

# ── 5) Páginas críticas (200) ───────────────────────────────────────────────
echo -e "${B}5) Páginas web públicas${N}"
for path in "/" "/donar" "/privacidad" "/terminos" "/contacto" "/casos"; do
  C=$(http_status "$BASE$path")
  if [ "$C" = "200" ]; then ok "$path → 200"; else err "$path → $C"; fi
done
echo

# ── 6) SEO básicos ──────────────────────────────────────────────────────────
echo -e "${B}6) SEO${N}"
ROBOTS=$(http_status "$BASE/robots.txt")
SITEMAP=$(http_status "$BASE/sitemap.xml")
[ "$ROBOTS"  = "200" ] && ok "/robots.txt"  || warn "/robots.txt → $ROBOTS"
[ "$SITEMAP" = "200" ] && ok "/sitemap.xml" || warn "/sitemap.xml → $SITEMAP"
echo

# ── Resumen ─────────────────────────────────────────────────────────────────
echo -e "${B}Resumen${N}  →  ${G}$PASS pass${N}, ${R}$FAIL fail${N}, ${Y}$WARN warn${N}"
if [ "$FAIL" -gt 0 ]; then
  echo -e "${R}❌ Smoke test FALLÓ${N}"
  exit 1
fi
if [ "$WARN" -gt 0 ]; then
  echo -e "${Y}⚠️  Pasó con warnings — revísalos antes de submit${N}"
fi
echo -e "${G}✅ Smoke test OK${N}"
exit 0
