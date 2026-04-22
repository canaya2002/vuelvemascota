/**
 * generate-assets.mjs
 *
 * Toma un único PNG 1024x1024 con tu logo (centrado, fondo blanco o crema)
 * y genera todas las variantes que la app necesita:
 *   - icon.png           (1024x1024, fondo opaco — obligatorio para App Store)
 *   - icon-foreground.png (1024x1024, logo centrado con 26% de padding para Android adaptive)
 *   - splash.png         (1242x2436, logo al centro sobre #fbf7f1)
 *   - notification-icon.png (96x96, silueta blanca para Android)
 *   - favicon.png        (48x48)
 *
 * Uso:
 *   1) Guarda tu logo cuadrado como apps/mobile/assets/images/source.png
 *      (1024×1024, PNG, fondo transparente es MEJOR porque el script añade fondos).
 *   2) cd apps/mobile
 *   3) node scripts/generate-assets.mjs
 *
 * Dependencia: sharp (se instala automáticamente si no está).
 */

import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const IMG = resolve(ROOT, "assets/images");
const SRC = resolve(IMG, "source.png");

if (!existsSync(SRC)) {
  console.error(`❌ No encontré: ${SRC}`);
  console.error("   Guarda tu logo como apps/mobile/assets/images/source.png");
  console.error("   Recomendado: 1024×1024 PNG con fondo transparente.");
  process.exit(1);
}

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("❌ Falta la dep 'sharp'. Instálala una vez:");
  console.error("   npm i -D sharp -w apps/mobile");
  process.exit(1);
}

mkdirSync(IMG, { recursive: true });

const BRAND_BG = { r: 251, g: 247, b: 241, alpha: 1 }; // #fbf7f1

// 1. icon.png — fondo opaco crema (Apple rechaza PNG con alpha como icono)
await sharp(SRC)
  .resize(1024, 1024, { fit: "contain", background: BRAND_BG })
  .flatten({ background: BRAND_BG })
  .png({ compressionLevel: 9 })
  .toFile(resolve(IMG, "icon.png"));
console.log("✓ icon.png (1024×1024)");

// 2. icon-foreground.png — Android adaptive: logo al 74% del canvas (26% padding seguro)
// Genera un 1024x1024 con alpha; Android aplica el fondo (definido en app.config.ts).
const logoSize = Math.round(1024 * 0.74);
const pad = Math.round((1024 - logoSize) / 2);
await sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    {
      input: await sharp(SRC).resize(logoSize, logoSize, { fit: "contain" }).toBuffer(),
      top: pad,
      left: pad,
    },
  ])
  .png()
  .toFile(resolve(IMG, "icon-foreground.png"));
console.log("✓ icon-foreground.png (1024×1024, safe area 74%)");

// 3. splash.png — 1242×2436 con logo al centro sobre crema
const splashLogo = 520;
await sharp({
  create: {
    width: 1242,
    height: 2436,
    channels: 4,
    background: BRAND_BG,
  },
})
  .composite([
    {
      input: await sharp(SRC).resize(splashLogo, splashLogo, { fit: "contain" }).toBuffer(),
      top: Math.round((2436 - splashLogo) / 2),
      left: Math.round((1242 - splashLogo) / 2),
    },
  ])
  .png()
  .toFile(resolve(IMG, "splash.png"));
console.log("✓ splash.png (1242×2436)");

// 4. notification-icon.png — Android exige silueta blanca pura sobre transparente
await sharp(SRC)
  .resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .threshold(128) // convierte todo lo visible a blanco puro
  .toColorspace("b-w")
  .ensureAlpha()
  .tint({ r: 255, g: 255, b: 255 })
  .png()
  .toFile(resolve(IMG, "notification-icon.png"));
console.log("✓ notification-icon.png (96×96, silueta blanca)");

// 5. favicon.png
await sharp(SRC)
  .resize(48, 48, { fit: "contain", background: BRAND_BG })
  .flatten({ background: BRAND_BG })
  .png()
  .toFile(resolve(IMG, "favicon.png"));
console.log("✓ favicon.png (48×48)");

console.log("\n🎉 Todas las imágenes generadas en apps/mobile/assets/images/");
