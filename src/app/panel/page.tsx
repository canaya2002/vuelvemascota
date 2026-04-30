import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { FLAGS } from "@/lib/flags";
import {
  IconPaw,
  IconBell,
  IconHeart,
  IconArrow,
  IconSearch,
  IconCheck,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Panel — Tus casos, alertas y donaciones",
  description:
    "Tu espacio personal en VuelveaCasa: gestiona los casos de mascotas que reportaste, tus alertas por zona y tus donaciones.",
  alternates: { canonical: "/panel" },
  robots: { index: false, follow: false },
};

function greetByHour(): string {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default async function Page() {
  const user = FLAGS.auth ? await currentUser() : null;
  const displayName =
    user?.firstName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "comunidad";

  return (
    <div>
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-br from-[var(--ink)] to-[#1a2640] text-white p-8 md:p-10 mb-10 shadow-lg">
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[var(--brand)]/30 blur-[100px]"
        />
        <div
          aria-hidden
          className="absolute bottom-[-6rem] left-[-4rem] w-72 h-72 rounded-full bg-white/8 blur-[120px]"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/10 border border-white/15 backdrop-blur-md text-xs uppercase tracking-[0.12em] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            Sesión activa
          </span>
          <h1 className="mt-5 text-3xl md:text-[2.5rem] font-semibold tracking-tight leading-tight">
            {greetByHour()},{" "}
            <span className="text-white/85">{displayName}</span>.
          </h1>
          <p className="mt-3 text-white/80 max-w-xl leading-relaxed">
            Tu panel en VuelveaCasa. Aquí gestionas tus casos, alertas y
            donaciones — todo en un solo lugar.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/panel/casos/nuevo"
              className="vc-btn vc-btn-brand text-sm !py-2.5 !px-5"
            >
              <IconPaw size={15} /> Nuevo caso
            </Link>
            <Link
              href="/casos"
              className="vc-btn vc-btn-ghost text-sm !py-2.5 !px-5"
            >
              <IconSearch size={15} /> Explorar casos
            </Link>
          </div>
        </div>
      </header>

      {/* Quick actions */}
      <section>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">
            Accesos rápidos
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PanelCard
            title="Crear un caso"
            body="Reporta una mascota perdida o encontrada con fotos y ubicación. Activa tu zona en segundos."
            href="/panel/casos/nuevo"
            cta="Nuevo caso"
            icon={<IconPaw size={20} />}
            tone="brand"
          />
          <PanelCard
            title="Mis alertas"
            body="Define tu radio y canal preferido. Te avisaremos solo de lo cercano y relevante."
            href="/panel/alertas"
            cta="Configurar"
            icon={<IconBell size={20} />}
          />
          <PanelCard
            title="Donaciones"
            body="Historial, suscripciones mensuales y comprobantes en un solo lugar."
            href="/panel/donaciones"
            cta="Ver historial"
            icon={<IconHeart size={20} />}
          />
        </div>
      </section>

      {/* Recommended next step */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">
            Siguiente paso
          </h2>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-sm hover:shadow-md transition-shadow">
          <div
            aria-hidden
            className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none"
            style={{
              background:
                "radial-gradient(closest-side, rgba(184,38,74,0.08), transparent)",
            }}
          />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
            <span className="inline-flex w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center shrink-0">
              <IconCheck size={22} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--ink)]">
                Completa tu perfil
              </p>
              <p className="text-sm text-[var(--ink-soft)] mt-1 leading-relaxed">
                Agrega tu ciudad y foto para sumar credibilidad a tus reportes
                y aparecer correctamente en alertas locales.
              </p>
            </div>
            <Link
              href="/panel/perfil"
              className="vc-btn vc-btn-primary text-sm !py-2.5 !px-5 shrink-0"
            >
              Completar perfil <IconArrow size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PanelCard({
  title,
  body,
  href,
  cta,
  icon,
  tone = "neutral",
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
  tone?: "neutral" | "brand";
}) {
  const isBrand = tone === "brand";
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isBrand
          ? "border-[var(--brand)]/30 hover:border-[var(--brand)]"
          : "border-[var(--line)] hover:border-[var(--ink)]"
      } flex flex-col`}
    >
      {isBrand && (
        <div
          aria-hidden
          className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[var(--brand-soft)] blur-2xl opacity-70 -translate-y-12 translate-x-12 pointer-events-none"
        />
      )}
      <span
        className={`relative inline-flex w-11 h-11 rounded-xl items-center justify-center transition-transform group-hover:scale-105 ${
          isBrand
            ? "bg-[var(--brand)] text-white shadow-[0_8px_18px_-6px_rgba(184,38,74,0.45)]"
            : "bg-[var(--brand-soft)] text-[var(--brand-ink)]"
        }`}
      >
        {icon}
      </span>
      <h3 className="relative mt-5 text-lg font-semibold text-[var(--ink)]">
        {title}
      </h3>
      <p className="relative mt-1.5 text-sm text-[var(--ink-soft)] leading-relaxed flex-1">
        {body}
      </p>
      <span className="relative mt-5 inline-flex items-center gap-1.5 text-[var(--brand-ink)] font-semibold text-sm">
        {cta}
        <span className="transition-transform group-hover:translate-x-0.5">
          <IconArrow size={14} />
        </span>
      </span>
    </Link>
  );
}
