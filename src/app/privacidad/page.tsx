import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aviso de privacidad — VuelveaCasa",
  description:
    "Aviso de privacidad de VuelveaCasa. Cómo tratamos tus datos personales conforme a la LFPDPPP en México.",
  alternates: { canonical: "/privacidad" },
  robots: { index: true, follow: false },
};

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Aviso de privacidad"
        subtitle="En construcción conforme a la LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares). Esta es una versión inicial y orientativa."
        imageSeed={40}
      />

      <Section>
        <article className="prose prose-lg max-w-3xl mx-auto text-[var(--ink-soft)]">
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-0">1. Responsable del tratamiento</h2>
          <p>
            {SITE.legal.razonSocial} (en adelante, “VuelveaCasa”, “nosotros”) con domicilio en México es responsable del tratamiento de tus datos personales.
          </p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">2. Datos que recabamos</h2>
          <ul>
            <li>Datos de identificación: nombre, ciudad y rol dentro de la plataforma.</li>
            <li>Datos de contacto: correo electrónico y, en algunos casos, teléfono.</li>
            <li>Datos de navegación: IP, tipo de dispositivo, páginas visitadas, con fines analíticos.</li>
            <li>Datos relacionados con donaciones: procesados exclusivamente por Stripe; no almacenamos datos completos de tarjetas.</li>
          </ul>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">3. Finalidades</h2>
          <p>Utilizamos tus datos para:</p>
          <ul>
            <li>Operar la plataforma: creación de reportes, alertas, coordinación con aliados.</li>
            <li>Enviarte notificaciones relacionadas con casos o actualizaciones del servicio.</li>
            <li>Procesar donaciones y emitir comprobantes.</li>
            <li>Comunicación sobre aliados, mejoras y lanzamientos.</li>
          </ul>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">4. Derechos ARCO</h2>
          <p>
            Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición escribiendo a {SITE.contact.email}. Atenderemos tu solicitud en los plazos previstos por la ley.
          </p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">5. Terceros</h2>
          <p>
            Compartimos datos mínimos con proveedores como Stripe (pagos), servicios de email transaccional, analítica y hosting, todos bajo contratos que protegen tu información.
          </p>
          <h2 className="text-2xl font-bold text-[var(--ink)] mt-8">6. Cambios al aviso</h2>
          <p>
            Podemos actualizar este aviso. Publicaremos la versión vigente en esta misma página, con la fecha de actualización.
          </p>
          <p className="text-sm">Última actualización: abril 2026.</p>
        </article>
      </Section>
    </>
  );
}
