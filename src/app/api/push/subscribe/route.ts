import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { pushRepo } from "@/lib/push";
import { FLAGS } from "@/lib/flags";

export const dynamic = "force-dynamic";

type Body = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const endpoint = body.endpoint;
  const p256dh = body.keys?.p256dh;
  const auth = body.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Suscripción incompleta" }, { status: 400 });
  }

  let clerkUserId: string | null = null;
  if (FLAGS.auth) {
    const user = await currentUser();
    clerkUserId = user?.id ?? null;
  }

  const userAgent = req.headers.get("user-agent") ?? undefined;
  const res = await pushRepo.save(
    clerkUserId,
    { endpoint, keys: { p256dh, auth } },
    userAgent ?? undefined
  );
  if (!res.ok)
    return NextResponse.json({ error: "No pudimos guardar" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  let endpoint: string | null = null;
  try {
    const body = (await req.json()) as { endpoint?: string };
    endpoint = body.endpoint ?? null;
  } catch {
    endpoint = null;
  }
  if (!endpoint)
    return NextResponse.json({ error: "endpoint requerido" }, { status: 400 });
  await pushRepo.remove(endpoint);
  return NextResponse.json({ ok: true });
}
