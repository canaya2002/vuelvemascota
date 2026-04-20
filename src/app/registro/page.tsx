import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { FeatureCard } from "@/components/FeatureCard";
import { IconBell, IconHeart, IconShield, IconSpark } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Regístrate gratis — VuelveaCasa",
  description:
    "Sumate a VuelveaCasa: recibe alertas cuando tu zona se active, sé el primero en reportar casos y acceder a la red comunitaria de mascotas en México.",
  alternates: { canonical: "/registro" },
};

type SearchParams = Promise<{ rol?: string }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { rol } = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="Registro anticipado"
        title={<>Reserva tu lugar en la red <span className="text-[var(--brand)]">comunitaria</span>.</>}
        subtitle="Avisa cuando abramos tu zona, recibe alertas tempranas y entra antes a la red de vecinos, rescatistas y veterinarias aliadas."
        imageSeed={7}
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <WaitlistForm defaultRol={rol} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <FeatureCard icon={<IconBell size={22} />} title="Alertas por zona" body="Te avisamos apenas se active tu colonia o ciudad." />
            <FeatureCard icon={<IconHeart size={22} />} title="Acceso temprano" body="Entras antes a funcionalidades de casos, seguimiento y donaciones." tint="accent" />
            <FeatureCard icon={<IconShield size={22} />} title="Red verificada" body="Te conectamos con rescatistas y veterinarias aliadas de tu zona." tint="ink" />
            <FeatureCard icon={<IconSpark size={22} />} title="Sin letras chiquitas" body="Es gratis. Puedes desuscribirte cuando quieras con un clic." />
          </div>
        </div>
      </Section>
    </>
  );
}
