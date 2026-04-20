import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { FLAGS } from "@/lib/flags";
import {
  IconHome,
  IconPaw,
  IconBell,
  IconHeart,
  IconShield,
  IconSpark,
  IconSearch,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: {
    default: "Panel — VuelveaCasa",
    template: "%s · Panel · VuelveaCasa",
  },
  robots: { index: false, follow: false },
};

const BASE_NAV = [
  { href: "/panel", label: "Inicio", icon: <IconHome size={18} /> },
  { href: "/panel/casos", label: "Mis casos", icon: <IconPaw size={18} /> },
  { href: "/panel/avistamientos", label: "Avistamientos", icon: <IconSearch size={18} /> },
  { href: "/panel/alertas", label: "Alertas", icon: <IconBell size={18} /> },
  { href: "/panel/donaciones", label: "Donaciones", icon: <IconHeart size={18} /> },
  { href: "/panel/cuenta", label: "Cuenta", icon: <IconShield size={18} /> },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!FLAGS.auth) {
    return (
      <div className="vc-container py-20 text-center">
        <h1 className="text-3xl font-bold">Panel no disponible todavía</h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Estamos activando cuentas personales. Suma tu correo a la waitlist.
        </p>
        <Link href="/registro" className="vc-btn vc-btn-primary mt-6">
          Ir a la waitlist
        </Link>
      </div>
    );
  }

  const user = await currentUser();
  const meta = user?.publicMetadata as { rol?: string } | undefined;
  const isAdmin = meta?.rol === "admin";
  const nav = [
    ...BASE_NAV,
    ...(isAdmin
      ? [{ href: "/panel/admin", label: "Admin", icon: <IconSpark size={18} /> }]
      : []),
  ];

  return (
    <div className="vc-container py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
      <aside className="lg:sticky lg:top-24 self-start">
        <nav aria-label="Panel" className="flex flex-row lg:flex-col gap-1 overflow-x-auto">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)] font-medium whitespace-nowrap"
            >
              <span className="text-[var(--brand-ink)]">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
