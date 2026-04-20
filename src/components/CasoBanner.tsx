import Link from "next/link";
import { IconCheck, IconHeart, IconX } from "./Icons";

type Variant = "creado" | "gracias" | "canceled";

export function CasoBanner({ variant }: { variant: Variant }) {
  if (variant === "creado") {
    return (
      <Banner tone="accent" icon={<IconCheck size={20} />}>
        <strong>Tu caso ya está publicado.</strong> Compártelo ahora con vecinos y grupos de WhatsApp — mientras más lo vean, más rápido vuelve a casa.
      </Banner>
    );
  }
  if (variant === "gracias") {
    return (
      <Banner tone="accent" icon={<IconHeart size={20} />}>
        <strong>¡Gracias por tu donación!</strong> Verás tu aporte reflejado en el progreso de este caso en unos segundos.{" "}
        <Link href="/panel/donaciones" className="underline font-semibold">
          Ver mis donaciones
        </Link>
      </Banner>
    );
  }
  return (
    <Banner tone="warn" icon={<IconX size={20} />}>
      Cancelaste el pago. Si tuviste un problema, escríbenos desde{" "}
      <Link href="/contacto?tema=soporte" className="underline font-semibold">
        contacto
      </Link>
      .
    </Banner>
  );
}

function Banner({
  tone,
  icon,
  children,
}: {
  tone: "accent" | "warn";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const cls =
    tone === "accent"
      ? "bg-[var(--accent-soft)] text-[#0d6b52] border-[var(--accent)]/30"
      : "bg-[#fff4d1] text-[#6b4a00] border-[#e8a500]/30";
  return (
    <div className={`mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3 ${cls}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}
