import { NextResponse } from "next/server";
import { validateContact } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const result = validateContact(form);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors },
      { status: 400 }
    );
  }
  // TODO: persist + notify team
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ service: "contacto", status: "ready" });
}
