# Imágenes

Necesitas **1 archivo fuente** que tú provees:

- `source.png` — tu logo centrado, 1024×1024 PNG, fondo transparente de preferencia

Y el script `scripts/generate-assets.mjs` genera los 5 finales:

- `icon.png` — 1024×1024, fondo opaco (App Store)
- `icon-foreground.png` — 1024×1024 con safe area 74% (Android adaptive)
- `splash.png` — 1242×2436 sobre fondo crema `#fbf7f1`
- `notification-icon.png` — 96×96 silueta blanca (Android)
- `favicon.png` — 48×48

## Uso

```bash
# Desde la raíz del monorepo:
npm i -D sharp -w @vuelvecasa/mobile

# Luego:
cd apps/mobile
node scripts/generate-assets.mjs
```
