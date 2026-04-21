import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
  enforceRateLimit,
} from "@/lib/api";
import { alertasRepo } from "@/lib/alertas";
import type { CasoEspecie } from "@/lib/casos";

export const dynamic = "force-dynamic";

/* -------------------------- GET list --------------------------- */

export async function GET(req: Request) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  const alertas = await alertasRepo.listMine(me.clerkUserId);
  return jsonOk(req, alertas);
}

/* -------------------------- POST create ------------------------- */

type CreateBody = {
  ciudad?: string | null;
  colonia?: string | null;
  lat?: number | null;
  lng?: number | null;
  radio_m?: number;
  especies?: string[];
};

export async function POST(req: Request) {
  const rl = await enforceRateLimit(req, "alertas:create", {
    limit: 10,
    windowSec: 600,
  });
  if (rl) return rl;

  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  const body = await parseJson<CreateBody>(req);
  if (!body) return jsonErr(req, "bad_json", "JSON inválido.", { status: 400 });

  const ciudad = body.ciudad ?? null;
  const lat = typeof body.lat === "number" ? body.lat : null;
  const lng = typeof body.lng === "number" ? body.lng : null;
  if (!ciudad && (lat == null || lng == null)) {
    return jsonErr(
      req,
      "missing_geo",
      "Elige una ciudad o un punto en el mapa.",
      { status: 422 }
    );
  }

  const especies: CasoEspecie[] = (
    Array.isArray(body.especies) && body.especies.length
      ? body.especies
      : ["perro", "gato", "otro"]
  ).filter((e): e is CasoEspecie =>
    ["perro", "gato", "otro"].includes(e as string)
  );

  const res = await alertasRepo.create(me.clerkUserId, {
    ciudad,
    colonia: body.colonia ?? null,
    lat,
    lng,
    radio_m: Math.max(500, Math.min(50000, body.radio_m ?? 3000)),
    especies,
    canales: ["email", "push"],
  });
  if (!res.ok) {
    return jsonErr(req, "db_error", "No pudimos crear la alerta.", {
      status: 500,
    });
  }
  return jsonOk(req, { created: true }, { status: 201 });
}

export { handleOptions as OPTIONS };
