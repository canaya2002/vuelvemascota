import type { Metadata } from "next";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";

export const metadata: Metadata = {
  title: "Preguntas frecuentes — VuelveaCasa",
  description:
    "Respuestas sobre cómo reportar mascotas perdidas, publicar avistamientos, donar, sumarse como rescatista o veterinaria y usar VuelveaCasa en México.",
  alternates: { canonical: "/faq" },
};

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "General",
    items: [
      {
        q: "¿Qué es VuelveaCasa?",
        a: "Una red comunitaria mexicana para reportar mascotas perdidas, subir avistamientos, activar alertas por zona, ofrecer hogar temporal y donar a rescates verificados.",
      },
      {
        q: "¿Es gratis?",
        a: "Sí, siempre. Reportar, recibir alertas, ofrecer resguardo y sumarse como voluntario son gratuitos. Las donaciones son opcionales.",
      },
      {
        q: "¿Dónde están activos?",
        a: "Comenzamos en ciudades clave de México como CDMX, Guadalajara y Monterrey. Se activa más cobertura conforme crezca la comunidad. Regístrate para recibir aviso cuando tu zona esté activa.",
      },
    ],
  },
  {
    title: "Reportes y casos",
    items: [
      {
        q: "¿Qué pongo en un reporte?",
        a: "Fotos claras, colores, señas particulares, última ubicación con hora aproximada, teléfono o forma de contacto y si usa collar, chip o placa.",
      },
      {
        q: "¿Puedo editar mi caso?",
        a: "Sí. Puedes agregar fotos, avistamientos y cambiar estatus de ‘perdida’ a ‘encontrada’ cuando aparezca.",
      },
      {
        q: "¿Qué pasa con datos sensibles como mi dirección?",
        a: "Nunca publicamos tu dirección exacta. Trabajamos con radios de zona y tú decides qué datos mostrar.",
      },
    ],
  },
  {
    title: "Donaciones",
    items: [
      {
        q: "¿Cómo sé que una donación llega a quien la necesita?",
        a: "Cada caso verificado muestra el destino. Conciliamos los fondos por Stripe y publicamos reportes periódicos de uso.",
      },
      {
        q: "¿Emiten facturas o recibos?",
        a: "En el arranque emitimos comprobantes simples. Los recibos deducibles estarán disponibles conforme se formalicen los convenios con aliados autorizados.",
      },
      {
        q: "¿Puedo donar mensual?",
        a: "Sí. En el formulario puedes marcar ‘mensual’ para crear una donación recurrente y cancelarla cuando quieras.",
      },
    ],
  },
  {
    title: "Aliados",
    items: [
      {
        q: "¿Cómo me sumo como rescatista?",
        a: "En la sección Rescatistas llenas una postulación. Revisamos con un proceso básico de verificación y te contactamos.",
      },
      {
        q: "¿Tiene costo para veterinarias?",
        a: "No mientras estemos en fase inicial. Solo pedimos cumplir estándares básicos de atención.",
      },
      {
        q: "¿Puedo proponer una alianza de marca?",
        a: "Sí. Escríbenos desde Contacto con tema ‘Aliados’ y te compartimos los formatos disponibles.",
      },
    ],
  },
];

export default function Page() {
  const flat = GROUPS.flatMap((g) => g.items);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: flat.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
  return (
    <>
      <Script id="ld-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="Preguntas frecuentes"
        title={<>Resolvemos lo <span className="text-[var(--brand)]">más común</span>.</>}
        subtitle="Si no encuentras la respuesta, escríbenos. Respondemos en menos de 48h hábiles."
        imageSeed={17}
      />

      <Section>
        <div className="space-y-16">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{g.title}</h2>
              <FAQ items={g.items} />
            </div>
          ))}
        </div>
      </Section>

      <CTA seed={18} title="¿Tu pregunta no está aquí?" subtitle="Escríbenos. Somos un equipo pequeño y respondemos personalmente." primaryHref="/contacto" primaryLabel="Ir a contacto" secondaryHref="/registro" secondaryLabel="Registrarme" />
    </>
  );
}
