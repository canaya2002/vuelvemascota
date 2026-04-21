import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  parseJson,
} from "@/lib/api";
import { casosRepo, type CasoInput } from "@/lib/casos";
import { isEstadoMx } from "@/lib/estados";
import { moderate } from "@/lib/moderation";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

/* ------------------------- GET detail -------------------------- */

export async function GET(req: Request, { params }: { params: Params }) {
  const { slug } = await params;
  const caso = await casosRepo.getBySlug(slug);
  if (!caso) return jsonErr(req, "not_found", "Caso no encontrado.", { status: 404 });

  // best-effort view count
  casosRepo.incrementViews(caso.id).catch(() => {});

  const [avistamientos, updates] = await Promise.all([
    casosRepo.listAvistamientos(caso.id),
    casosRepo.listUpdates(caso.id),
  ]);
  return jsonOk(
    req,
    { caso, avistamientos, updates },
    { cache: "public, max-age=15, stale-while-revalidate=60" }
  );
}

/* ------------------------- PATCH update ------------------------ */

type UpdateBody = Partial<CasoInput>;

export async function PATCH(
  req: Request,
  { params }: { params: Params }
) {
  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  const { slug } = await params;
  const body = await parseJson<UpdateBody>(req);
  if (!body) return jsonErr(req, "bad_json", "JSON inválido.", { status: 400 });

  if (body.descripcion) {
    const mod = await moderate(body.descripcion, "caso", {
      userId: me.clerkUserId,
    });
    if (!mod.ok) {
      return jsonErr(req, "moderation", mod.reason, { status: 422 });
    }
    body.descripcion = mod.clean;
  }

  const patch: Partial<CasoInput> = {
    nombre: body.nombre,
    raza: body.raza,
    color: body.color,
    tamano: (body.tamano as CasoInput["tamano"]) ?? null,
    edad_aprox: body.edad_aprox,
    sexo: (body.sexo as CasoInput["sexo"]) ?? null,
    senas: body.senas,
    descripcion: body.descripcion,
    estado:
      body.estado && isEstadoMx(body.estado) ? body.estado : null,
    ciudad: body.ciudad ?? undefined,
    municipio: body.municipio,
    colonia: body.colonia,
    lat: typeof body.lat === "number" ? body.lat : null,
    lng: typeof body.lng === "number" ? body.lng : null,
    radio_m: body.radio_m,
    tiene_chip: body.tiene_chip ?? null,
    tiene_collar: body.tiene_collar ?? null,
    contacto_nombre: body.contacto_nombre,
    contacto_telefono: body.contacto_telefono,
    contacto_whatsapp: body.contacto_whatsapp,
    contacto_email: body.contacto_email,
  };

  const res = await casosRepo.updateBySlug(me.clerkUserId, slug, patch);
  if (!res.ok) {
    return jsonErr(req, "forbidden_or_missing", "No pudimos actualizar el caso.", {
      status: 403,
    });
  }
  return jsonOk(req, { updated: true });
}

export { handleOptions as OPTIONS };
