import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { LegalDoc, LegalList } from "@/components/LegalDoc";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aviso de privacidad — VuelveaCasa",
  description:
    "Aviso de privacidad de VuelveaCasa. Cómo tratamos tus datos personales conforme a la LFPDPPP en México.",
  alternates: { canonical: "/privacidad" },
  robots: { index: true, follow: false },
};

const LAST_UPDATED = "abril 2026";

export default function Page() {
  const sections = [
    {
      id: "responsable",
      title: "Responsable del tratamiento",
      body: (
        <>
          <p>
            <strong>{SITE.legal.razonSocial}</strong> (en adelante,
            «VuelveaCasa», «nosotros») con domicilio en México es responsable
            del tratamiento de tus datos personales conforme a la{" "}
            <strong>
              Ley Federal de Protección de Datos Personales en Posesión de los
              Particulares (LFPDPPP)
            </strong>{" "}
            y su reglamento.
          </p>
          <p>
            Para cualquier comunicación relacionada con privacidad, ARCO o
            cumplimiento puedes escribirnos desde nuestro{" "}
            <Link href="/contacto?tema=privacidad">
              formulario de contacto
            </Link>
            .
          </p>
        </>
      ),
    },
    {
      id: "datos",
      title: "Datos que recabamos",
      body: (
        <>
          <p>Tratamos únicamente los datos necesarios para operar el servicio:</p>
          <LegalList
            items={[
              <>
                <strong>Identificación</strong>: nombre, ciudad y rol dentro de
                la plataforma.
              </>,
              <>
                <strong>Contacto</strong>: correo electrónico y, en algunos
                casos, número telefónico.
              </>,
              <>
                <strong>Navegación</strong>: dirección IP, dispositivo, páginas
                visitadas, con fines analíticos y de seguridad.
              </>,
              <>
                <strong>Donaciones</strong>: procesadas exclusivamente por
                Stripe. No almacenamos datos completos de tarjetas.
              </>,
              <>
                <strong>Geolocalización aproximada</strong>: solo cuando creas
                un caso o activas alertas por zona, y siempre con tu
                consentimiento.
              </>,
            ]}
          />
        </>
      ),
    },
    {
      id: "finalidades",
      title: "Finalidades",
      body: (
        <>
          <p>Utilizamos tus datos para:</p>
          <LegalList
            items={[
              "Operar la plataforma: creación de reportes, alertas, coordinación con aliados.",
              "Enviarte notificaciones relacionadas con tus casos y actualizaciones del servicio.",
              "Procesar donaciones y emitir comprobantes de las mismas.",
              "Comunicar mejoras, lanzamientos y oportunidades para sumarse como aliado.",
              "Cumplir con obligaciones legales y resolver controversias.",
            ]}
          />
        </>
      ),
    },
    {
      id: "arco",
      title: "Derechos ARCO y cancelación",
      body: (
        <>
          <p>
            Puedes ejercer tus derechos de{" "}
            <strong>Acceso, Rectificación, Cancelación y Oposición</strong>{" "}
            (ARCO), así como revocar tu consentimiento en cualquier momento.
          </p>
          <p>
            Para hacerlo escríbenos desde el{" "}
            <Link href="/contacto?tema=privacidad">
              formulario de contacto
            </Link>{" "}
            indicando el tema «privacidad». Atenderemos tu solicitud en un plazo
            máximo de 20 días hábiles, conforme a la LFPDPPP.
          </p>
          <p>
            Para borrar tu cuenta dentro de la app, ve a{" "}
            <strong>Ajustes → Borrar cuenta</strong>. La eliminación es
            inmediata y permanente.
          </p>
        </>
      ),
    },
    {
      id: "terceros",
      title: "Terceros y proveedores",
      body: (
        <>
          <p>
            Compartimos datos mínimos con proveedores de infraestructura, todos
            sujetos a cláusulas de confidencialidad y tratamiento de datos:
          </p>
          <LegalList
            items={[
              <>
                <strong>Stripe</strong> — procesamiento de pagos y donaciones.
              </>,
              <>
                <strong>Resend</strong> — entrega de emails transaccionales.
              </>,
              <>
                <strong>Supabase</strong> — almacenamiento seguro de datos y
                fotos.
              </>,
              <>
                <strong>Clerk</strong> — autenticación y gestión de cuentas.
              </>,
              <>
                <strong>Vercel</strong> — hosting y entrega de contenidos.
              </>,
              <>
                <strong>Google Analytics</strong> — métricas anónimas de uso.
              </>,
            ]}
          />
          <p>
            No vendemos ni cedemos tus datos a terceros con fines comerciales.
          </p>
        </>
      ),
    },
    {
      id: "seguridad",
      title: "Seguridad y conservación",
      body: (
        <>
          <p>
            Aplicamos medidas técnicas y administrativas razonables para
            proteger tus datos: cifrado en tránsito (TLS), control de accesos
            por roles, registros de auditoría y respaldos cifrados.
          </p>
          <p>
            Conservamos tus datos mientras tu cuenta exista y por los plazos
            adicionales que la ley exija (por ejemplo, comprobantes fiscales).
            Al borrar tu cuenta eliminamos tu información salvo lo que estemos
            obligados a conservar.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies y tecnologías similares",
      body: (
        <>
          <p>
            Usamos cookies estrictamente necesarias para autenticación y
            preferencias del sitio, además de cookies analíticas anónimas para
            mejorar la experiencia. No usamos cookies con fines publicitarios
            de terceros sin tu consentimiento explícito.
          </p>
        </>
      ),
    },
    {
      id: "menores",
      title: "Menores de edad",
      body: (
        <>
          <p>
            VuelveaCasa no está dirigido a menores de 13 años. Si detectamos
            que un menor ha creado una cuenta sin autorización de sus tutores,
            la eliminaremos junto con sus datos asociados.
          </p>
        </>
      ),
    },
    {
      id: "cambios",
      title: "Cambios al aviso",
      body: (
        <>
          <p>
            Podemos actualizar este aviso. Publicaremos la versión vigente en
            esta página con su fecha de actualización y, cuando los cambios
            sean materiales, te avisaremos por correo o dentro de la app.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <span id="top" />
      <PageHero
        eyebrow="Legal · Privacidad"
        title={
          <>
            Aviso de <span className="text-[var(--brand)]">privacidad</span>
          </>
        }
        subtitle="Tratamos tus datos personales conforme a la LFPDPPP. Aquí explicamos qué recabamos, para qué, con quién lo compartimos y cómo ejercer tus derechos."
        imageSeed={40}
      />

      <LegalDoc
        sections={sections}
        lastUpdated={LAST_UPDATED}
        contactTema="privacidad"
        intro={
          <>
            En VuelveaCasa creemos que la transparencia en el manejo de datos
            es tan importante como la privacidad misma. Este aviso es claro,
            corto y respetuoso. Si algo no te queda claro,{" "}
            <Link href="/contacto?tema=privacidad">escríbenos</Link> y te
            respondemos en menos de 48 horas hábiles.
          </>
        }
      />
    </>
  );
}
