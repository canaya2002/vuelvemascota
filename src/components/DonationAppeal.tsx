import Link from "next/link";
import Image from "next/image";
import { pickImage } from "@/lib/images";
import { IconHeart, IconArrow } from "./Icons";

type Variant =
  | "caso-publicado"
  | "foro-publicado"
  | "avistamiento"
  | "reencuentro"
  | "generic";

const COPIES: Record<
  Variant,
  { eyebrow: string; title: string; body: string; seed: number }
> = {
  "caso-publicado": {
    eyebrow: "Gracias por publicar",
    title: "Tu caso ya está en la red. ¿Nos ayudas a seguir aquí?",
    body: "Somos un equipo pequeño que sostiene VuelveaCasa con donaciones. Cada peso paga servidores, SMS, emails y la red que hoy difundió tu caso. Sin tu apoyo esto no sobrevive otro mes.",
    seed: 45,
  },
  "foro-publicado": {
    eyebrow: "Gracias por compartir",
    title: "Tu historia ayuda a otras personas. Ayúdanos a mantener el foro vivo.",
    body: "Moderación, infraestructura y soporte cuestan todos los meses. Si lo que lees en VuelveaCasa te ha servido, aporta lo que puedas — aunque sea $20 MXN — para que sigamos existiendo.",
    seed: 46,
  },
  avistamiento: {
    eyebrow: "Gracias por reportar",
    title: "Tu avistamiento puede cambiar todo. Nosotros seguimos aquí.",
    body: "Mantener la red activa 24/7 tiene costos reales: SMS, emails, servidores, almacenamiento de fotos. No recibimos subsidios. Nos sostenemos con donaciones de personas como tú.",
    seed: 43,
  },
  reencuentro: {
    eyebrow: "¡Qué alegría!",
    title: "Celebra con nosotros — ayuda a que la red alcance a más familias.",
    body: "Tu mascota volvió a casa gracias a vecinos, rescatistas y veterinarias. Si puedes, regrésale el gesto a la comunidad: una donación mantiene vivo lo que hoy te ayudó.",
    seed: 44,
  },
  generic: {
    eyebrow: "Sostén la red",
    title: "VuelveaCasa vive gracias a personas como tú.",
    body: "No tenemos publicidad ni inversionistas que paguen la infraestructura. Cada donación, por pequeña que sea, mantiene viva la red de reencuentros.",
    seed: 42,
  },
};

type Props = {
  variant?: Variant;
  className?: string;
  compact?: boolean;
};

export function DonationAppeal({
  variant = "generic",
  className = "",
  compact = false,
}: Props) {
  const copy = COPIES[variant];
  if (compact) {
    return (
      <div
        className={`vc-card-glass !p-5 flex flex-col md:flex-row items-start md:items-center gap-4 ${className}`}
      >
        <span className="inline-flex w-12 h-12 rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center shrink-0">
          <IconHeart size={22} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--ink)]">
            {copy.title}
          </p>
          <p className="mt-1 text-xs text-[var(--ink-soft)] leading-relaxed">
            {copy.body}
          </p>
        </div>
        <Link
          href="/donar"
          className="vc-btn vc-btn-primary text-sm !py-2.5 !px-4 shrink-0"
        >
          Donar <IconArrow size={14} />
        </Link>
      </div>
    );
  }

  return (
    <section
      className={`relative overflow-hidden rounded-[28px] bg-white ring-1 ring-[var(--line)] shadow-sm ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="relative md:col-span-5 aspect-[4/3] md:aspect-auto">
          <Image
            src={pickImage(copy.seed)}
            alt=""
            fill
            sizes="(max-width:768px) 100vw, 40vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, rgba(225,29,72,0) 0%, rgba(225,29,72,0.25) 100%)",
            }}
          />
        </div>
        <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-center">
          <span className="vc-eyebrow vc-eyebrow-accent self-start">
            <IconHeart size={14} /> {copy.eyebrow}
          </span>
          <h3 className="mt-4 text-2xl md:text-3xl font-bold leading-tight">
            {copy.title}
          </h3>
          <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">
            {copy.body}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/donar" className="vc-btn vc-btn-primary vc-shine">
              Donar a la red <IconArrow size={16} />
            </Link>
            <Link
              href="/donar#transparencia"
              className="vc-btn vc-btn-outline"
            >
              Ver cómo se usa
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Donaciones procesadas con Stripe · Desglose público en{" "}
            <Link href="/donar#transparencia" className="underline">
              transparencia
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
