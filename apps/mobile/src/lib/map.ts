/**
 * Configuración de Mapbox. El token se lee de expo-constants (bundled en
 * build). Nuestro componente <Map /> llama `ensureMapbox()` una vez antes
 * de renderizar — Mapbox solo acepta el set una vez y lanza si lo repetimos
 * con otro valor.
 */

import Mapbox from "@rnmapbox/maps";
import { MAPBOX_PUBLIC_TOKEN } from "./constants";

let configured = false;

export function ensureMapbox() {
  if (configured) return;
  if (!MAPBOX_PUBLIC_TOKEN) return;
  Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);
  Mapbox.setTelemetryEnabled(false);
  configured = true;
}

export const MAP_STYLE_LIGHT = "mapbox://styles/mapbox/light-v11";
export const MAP_STYLE_STREETS = "mapbox://styles/mapbox/streets-v12";

export const MEXICO_CENTER: [number, number] = [-99.1332, 19.4326]; // [lng, lat] CDMX
