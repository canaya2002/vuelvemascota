import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { HiloForm } from "@/components/forms/HiloForm";
import { CATEGORIAS } from "@/lib/foros";

export const metadata: Metadata = {
  title: "Abrir un tema · Foros de VuelveaCasa",
  description:
    "Comparte una experiencia, pide consejo o abre un caso de rescate. Publicación moderada para cuidar la comunidad.",
  alternates: { canonical: "/foros/nuevo" },
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Abrir un tema"
        title={<>Comparte lo que quieras <span className="vc-gradient-text">contar</span>.</>}
        subtitle="Los hilos son públicos. Pasa por un filtro automático para cuidar a todas las personas que entren."
        imageSeed={14}
      />
      <Section>
        <div className="max-w-2xl mx-auto vc-card !p-6 md:!p-8">
          <HiloForm categorias={CATEGORIAS} />
        </div>
      </Section>
    </>
  );
}
