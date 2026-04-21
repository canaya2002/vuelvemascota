import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { FLAGS } from "@/lib/flags";
import { IconPaw, IconBell, IconHeart, IconArrow } from "@/components/Icons";

export default async function Page() {
  const user = FLAGS.auth ? await currentUser() : null;
  const displayName =
    user?.firstName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "comunidad";

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">
          Hola, {displayName} 👋
        </h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          Este es tu panel en VuelveaCasa. Aquí ves tus casos, alertas y donaciones.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <PanelCard
          title="Crear un caso"
          body="Reporta una mascota perdida o encontrada con fotos y ubicación. Activa tu zona."
          href="/panel/casos/nuevo"
          cta="Nuevo caso"
          icon={<IconPaw size={22} />}
        />
        <PanelCard
          title="Configura alertas"
          body="Define tu radio y canal preferido. Te avisaremos solo de lo cercano."
          href="/panel/alertas"
          cta="Configurar"
          icon={<IconBell size={22} />}
        />
        <PanelCard
          title="Tus donaciones"
          body="Historial, suscripciones mensuales y comprobantes en un solo lugar."
          href="/panel/donaciones"
          cta="Ver historial"
          icon={<IconHeart size={22} />}
        />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Siguiente paso recomendado</h2>
        <div className="vc-card flex items-center justify-between flex-col md:flex-row gap-4">
          <div>
            <p className="font-semibold">Completa tu perfil</p>
            <p className="text-sm text-[var(--ink-soft)]">
              Agrega tu ciudad y foto para sumar credibilidad a tus reportes.
            </p>
          </div>
          <Link href="/panel/perfil" className="vc-btn vc-btn-primary">
            Completar perfil <IconArrow size={16} />
          </Link>
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
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="vc-card hover:border-[var(--ink)] flex flex-col">
      <span className="inline-flex w-10 h-10 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-ink)] items-center justify-center">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--ink-soft)] flex-1">{body}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-[var(--brand-ink)] font-semibold text-sm">
        {cta} <IconArrow size={14} />
      </span>
    </Link>
  );
}
