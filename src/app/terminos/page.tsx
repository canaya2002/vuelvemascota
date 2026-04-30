import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { LegalDoc, LegalList } from "@/components/LegalDoc";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y condiciones — VuelveaCasa",
  description:
    "Términos y condiciones de uso de VuelveaCasa, red comunitaria para mascotas en México.",
  alternates: { canonical: "/terminos" },
  robots: { index: true, follow: false },
};

const LAST_UPDATED = "abril 2026";

export default function Page() {
  const sections = [
    {
      id: "aceptacion",
      title: "Aceptación de los términos",
      body: (
        <>
          <p>
            Al acceder y usar VuelveaCasa (sitio web y aplicación móvil)
            aceptas estos términos. Si no estás de acuerdo con alguna parte,
            por favor no utilices la plataforma.
          </p>
          <p>
            VuelveaCasa es operado por <strong>{SITE.legal.razonSocial}</strong>{" "}
            con sede en México.
          </p>
        </>
      ),
    },
    {
      id: "que-es",
      title: "Qué es VuelveaCasa",
      body: (
        <>
          <p>
            Una red comunitaria enfocada en mascotas perdidas, encontradas y en
            riesgo. Conectamos a personas, rescatistas, refugios y veterinarias
            para coordinar reportes, alertas, hogar temporal y donaciones.
          </p>
          <p>
            VuelveaCasa <strong>no</strong> sustituye servicios veterinarios,
            autoridades civiles ni servicios de emergencia. En caso de
            urgencia médica, acude a una clínica veterinaria de inmediato.
          </p>
        </>
      ),
    },
    {
      id: "cuenta",
      title: "Cuenta de usuario",
      body: (
        <>
          <p>
            Para crear casos o donar necesitas una cuenta. Eres responsable de
            la veracidad de los datos que proporcionas y de mantener la
            confidencialidad de tus credenciales.
          </p>
          <LegalList
            items={[
              "Una sola cuenta por persona; no se permiten cuentas múltiples para evadir reglas.",
              "Debes ser mayor de edad o contar con autorización de tutor.",
              "Eres responsable de la actividad que ocurra bajo tu cuenta.",
            ]}
          />
        </>
      ),
    },
    {
      id: "contenido",
      title: "Contenido publicado por usuarios",
      body: (
        <>
          <p>
            Eres responsable del contenido que publicas (textos, fotos,
            ubicaciones). Al subirlo nos otorgas una licencia limitada,
            no exclusiva y revocable para mostrarlo dentro del servicio con el
            fin de coordinar el caso, generar alertas y construir reportes
            agregados.
          </p>
          <p>
            <strong>Está prohibido publicar</strong>:
          </p>
          <LegalList
            items={[
              "Contenido falso, engañoso o que vulnere a terceros.",
              "Material gráfico explícito sin advertencia.",
              "Datos personales de terceros sin su consentimiento.",
              "Promociones comerciales no autorizadas.",
              "Cualquier contenido ilegal o que incite a la violencia.",
            ]}
          />
          <p>
            Podemos eliminar contenido y suspender cuentas cuando sea
            necesario para proteger a la comunidad.
          </p>
        </>
      ),
    },
    {
      id: "donaciones",
      title: "Donaciones",
      body: (
        <>
          <p>
            Las donaciones son <strong>voluntarias</strong> y se procesan a
            través de Stripe. Publicamos criterios de asignación y reportes
            periódicos de uso.
          </p>
          <p>
            Las donaciones son no reembolsables salvo error técnico
            verificable. Para reportes de cobro indebido escríbenos desde el{" "}
            <Link href="/contacto?tema=donaciones">formulario de contacto</Link>{" "}
            con tema «donaciones» dentro de los 7 días posteriores al cargo.
          </p>
          <p>
            VuelveaCasa no garantiza resultados individuales por caso, pero sí
            que toda donación se aplique conforme a los criterios publicados.
          </p>
        </>
      ),
    },
    {
      id: "aliados",
      title: "Aliados (rescatistas, refugios, veterinarias)",
      body: (
        <>
          <p>
            Los aliados pasan un proceso básico de verificación antes de
            aparecer en el directorio. VuelveaCasa{" "}
            <strong>no es empleador, agente ni representante legal</strong> de
            ningún aliado. Cualquier acuerdo entre usuarios y aliados es de su
            exclusiva responsabilidad.
          </p>
        </>
      ),
    },
    {
      id: "limitaciones",
      title: "Limitaciones de responsabilidad",
      body: (
        <>
          <p>
            VuelveaCasa se ofrece «tal cual» y «según disponibilidad». No
            garantizamos disponibilidad ininterrumpida, exactitud absoluta de
            la información publicada por usuarios, ni resultados específicos
            (como reencuentros).
          </p>
          <p>
            En la medida permitida por la ley, no somos responsables por daños
            indirectos, lucro cesante o pérdida de oportunidades derivados del
            uso del servicio.
          </p>
        </>
      ),
    },
    {
      id: "propiedad",
      title: "Propiedad intelectual",
      body: (
        <>
          <p>
            La marca «VuelveaCasa», logos, código y diseños son propiedad de{" "}
            <strong>{SITE.legal.razonSocial}</strong>. No autorizamos su uso
            comercial sin permiso por escrito.
          </p>
        </>
      ),
    },
    {
      id: "ley",
      title: "Ley aplicable y jurisdicción",
      body: (
        <>
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos
            Mexicanos. Cualquier controversia se someterá a los tribunales
            competentes en la Ciudad de México, renunciando a cualquier otro
            fuero que pudiera corresponder.
          </p>
        </>
      ),
    },
    {
      id: "cambios",
      title: "Cambios a estos términos",
      body: (
        <>
          <p>
            Podemos actualizar estos términos. La versión vigente se publica
            en esta página con su fecha. Cuando los cambios sean materiales,
            te avisaremos por correo o dentro de la app.
          </p>
        </>
      ),
    },
    {
      id: "contacto",
      title: "Contacto",
      body: (
        <>
          <p>
            Dudas, reclamaciones o reportes legales: usa nuestro{" "}
            <Link href="/contacto">formulario de contacto</Link>. Respondemos
            en menos de 48 horas hábiles.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <span id="top" />
      <PageHero
        eyebrow="Legal · Términos"
        title={
          <>
            Términos y <span className="text-[var(--brand)]">condiciones</span>
          </>
        }
        subtitle="Reglas claras para mantener una comunidad sana. Léelas con calma; son cortas y directas."
        imageSeed={42}
      />

      <LegalDoc
        sections={sections}
        lastUpdated={LAST_UPDATED}
        intro={
          <>
            Estos términos rigen el uso de VuelveaCasa. Buscamos un balance
            entre proteger a la comunidad, ser transparentes con las
            donaciones y dejar claras las responsabilidades. Si hay dudas, la
            puerta está abierta:{" "}
            <Link href="/contacto">contáctanos</Link>.
          </>
        }
      />
    </>
  );
}
