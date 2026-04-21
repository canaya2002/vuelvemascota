import { NextResponse } from "next/server";
import {
  handleOptions,
  jsonOk,
  jsonErr,
  requireAuth,
  enforceRateLimit,
} from "@/lib/api";
import { casosRepo } from "@/lib/casos";
import { uploadPhoto, storageEnabled } from "@/lib/storage";
import { moderateImage } from "@/lib/moderationImage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = Promise<{ slug: string }>;

export async function POST(
  req: Request,
  { params }: { params: Params }
) {
  const rl = await enforceRateLimit(req, "casos:fotos", {
    limit: 12,
    windowSec: 60,
  });
  if (rl) return rl;

  const me = await requireAuth(req);
  if (me instanceof NextResponse) return me;
  const { slug } = await params;

  const caso = await casosRepo.getMineBySlug(me.clerkUserId, slug);
  if (!caso) return jsonErr(req, "not_found", "Caso no encontrado.", { status: 404 });
  if (!storageEnabled()) {
    return jsonErr(
      req,
      "storage_disabled",
      "El almacenamiento de fotos aún no está configurado.",
      { status: 503 }
    );
  }

  const existing = await casosRepo.countPhotos(caso.id);
  const slots = Math.max(0, 6 - existing);
  if (slots === 0) {
    return jsonErr(req, "max_photos", "Alcanzaste el máximo de 6 fotos.", {
      status: 409,
    });
  }

  const form = await req.formData();
  const files = form
    .getAll("fotos")
    .filter((v): v is File => v instanceof File && v.size > 0)
    .slice(0, slots);

  if (files.length === 0) {
    return jsonErr(req, "no_files", "No seleccionaste fotos.", { status: 400 });
  }

  let added = 0;
  let rejected = 0;
  const rejections: string[] = [];

  for (const file of files) {
    const mime = file.type || "image/jpeg";
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mod = await moderateImage(bytes, mime);
    if (!mod.ok) {
      rejected += 1;
      rejections.push(mod.reason);
      continue;
    }
    const ext = (mime.split("/")[1] || "jpg").toLowerCase();
    const name = `${crypto.randomUUID()}.${ext}`;
    const path = `${caso.id}/${name}`;
    const up = await uploadPhoto({ path, bytes, contentType: mime });
    if (up.ok) {
      await casosRepo.addPhoto(caso.id, up.url, existing + added);
      added += 1;
    }
  }

  return jsonOk(req, { added, rejected, rejections });
}

export { handleOptions as OPTIONS };
