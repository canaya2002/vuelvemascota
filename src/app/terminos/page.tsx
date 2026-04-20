import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y condiciones — VuelveaCasa",
  description:
    "Términos y condiciones de uso de VuelveaCasa, red comunitaria para mascotas en México.",
  alternates: { canonical: "/terminos" },
  robots: { index: true, follow: false },
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Términos y condiciones"
        subtitle="Estos términos rigen el uso de VuelveaCasa. Son una versión inicial que evolucionará con la plataforma."
        imageSeed={42}
      />

      <Section>
        <article className="prose prose-lg max-w-3xl mx-auto text-[var(--ink-soft)]">
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-0">1. Aceptación</h2>
          <p>Al usar VuelveaCasa aceptas estos términos. Si no estás de acuerdo, por favor no utilices la plataforma.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">2. Qué es VuelveaCasa</h2>
          <p>VuelveaCasa es una red comunitaria enfocada en mascotas perdidas, encontradas y en riesgo. No sustituye servicios veterinarios ni autoridades.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">3. Contenido de usuarios</h2>
          <p>Eres responsable del contenido que publicas. Al subir fotos, textos o ubicaciones nos otorgas una licencia limitada para mostrarlos dentro del servicio y ayudar con la coordinación del caso.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">4. Donaciones</h2>
          <p>Las donaciones son voluntarias. Se procesan con Stripe. Publicamos criterios de asignación y reportes. VuelveaCasa no garantiza resultados individuales, pero sí opera con transparencia.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">5. Aliados</h2>
          <p>Rescatistas, refugios y veterinarias aliadas pasan un proceso básico de verificación. VuelveaCasa no es empleador ni representante legal de dichos aliados.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">6. Limitaciones</h2>
          <p>VuelveaCasa se ofrece &ldquo;tal cual&rdquo;. No garantizamos disponibilidad ininterrumpida ni resultados específicos. No somos responsables por daños indirectos.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">7. Cambios</h2>
          <p>Podemos actualizar estos términos. La versión vigente se publica en esta página.</p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">8. Contacto</h2>
          <p>Dudas o reclamaciones: {SITE.contact.email}.</p>
          <p className="text-sm">Última actualización: abril 2026.</p>
        </article>
      </Section>
    </>
  );
}
