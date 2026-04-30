import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CTA } from "@/components/CTA";
import { DonationWidget } from "@/components/DonationWidget";
import { TransparenciaPanel } from "@/components/TransparenciaPanel";
import { FeatureCard } from "@/components/FeatureCard";
import { PhotoMarquee } from "@/components/PhotoMarquee";
import {
  IconHeart,
  IconShield,
  IconMoney,
  IconStethoscope,
  IconHome,
  IconCheck,
  IconArrow,
  IconPaw,
} from "@/components/Icons";
import { pickRange } from "@/lib/images";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Donar a VuelveaCasa MX · Apoya rescates y mascotas en riesgo",
  description:
    "Dona para apoyar casos verificados de mascotas en riesgo en México: veterinaria, alimento, traslados, rescate y sostenimiento de la red. Pago seguro con Stripe. 100% transparente.",
  alternates: { canonical: "/donar" },
  keywords: [
    "donar rescate animal México",
    "donación mascotas MX",
    "apoyar rescate animal México",
    "Stripe donación mascotas",
    "transparencia donación",
    "ayudar rescatistas México",
  ],
};

// Pool dedicado, sin chocar con PageHero seed=16 + accents 39,40 ni CTA seed=22.
const STORIES_IMGS = pickRange(23, 6); // 23..28
const MARQUEE_IMGS = pickRange(0, 14); // 0..13 (PhotoMarquee duplicará solo)

export default function Page() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Donar", item: `${SITE.url}/donar` },
    ],
  };
  const donateLd = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    agent: { "@type": "Organization", name: SITE.name, url: SITE.url },
    recipient: { "@type": "Organization", name: SITE.name, url: SITE.url },
    description:
      "Apoya rescates de mascotas en México con donación única o mensual.",
  };

  return (
    <>
      <Script
        id="ld-donar"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumb, donateLd]),
        }}
      />
      <PageHero
        eyebrow="Donar · Apoyar"
        title={
          <>
            Cada donación se convierte en{" "}
            <span className="vc-gradient-text">ayuda real</span>.
          </>
        }
        subtitle="Apoyas veterinaria de emergencia, alimento, traslados, rescate y el sostenimiento de la red. Transparente y rastreable desde el primer peso, 100% para México."
        imageSeed={16}
        primary={{ href: "#donar-ahora", label: "Donar ahora" }}
        secondary={{ href: "#transparencia", label: "Ver transparencia" }}
      />

      {/* Carrusel emocional */}
      <section className="py-8 bg-white border-b border-[var(--line)]">
        <PhotoMarquee
          images={MARQUEE_IMGS}
          size="sm"
          rounded="2xl"
          label="Historias que tu donación hace posibles"
        />
      </section>

      {/* Hook emocional */}
      <section className="py-16 md:py-20 bg-white">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <span className="vc-eyebrow vc-eyebrow-accent">
              <IconHeart size={14} /> El porqué
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold leading-tight">
              No somos una ONG millonaria. Somos un equipo chico que sostiene
              esta red con donaciones.
            </h2>
            <p className="mt-5 text-lg text-[var(--ink-soft)] leading-relaxed">
              Cada mes pagamos servidores, SMS, emails, almacenamiento de fotos
              y moderación. Lo hacemos porque creemos que las mascotas no deberían
              depender de que un post se haga viral. Pero no podemos hacerlo solos.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Sin publicidad invasiva, sin vender datos.",
                "Sin inversionistas que exijan monetizar a los usuarios.",
                "Sin costo para quienes reportan o buscan una mascota.",
                "Todo lo que sostiene la red sale de donaciones como la tuya.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[var(--ink)]">
                  <span className="mt-1 text-[var(--accent)]">
                    <IconCheck size={18} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {STORIES_IMGS.slice(0, 4).map((src, i) => (
              <div
                key={i}
                className={`relative aspect-square rounded-2xl overflow-hidden ring-1 ring-[var(--line)] ${
                  i % 2 === 0 ? "" : "translate-y-6"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width:1024px) 50vw, 20vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Widget de donación + cómo se usa */}
      <section id="donar-ahora" className="py-16 md:py-20">
        <div className="vc-container grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <span className="vc-eyebrow vc-eyebrow-accent">
              Cómo se usa tu donación
            </span>
            <h2 className="mt-5 text-3xl md:text-4xl font-bold">
              Tu apoyo activa la red cuando más urge.
            </h2>
            <p className="mt-4 text-lg text-[var(--ink-soft)] leading-relaxed">
              Puedes elegir un destino específico o donar al fondo comunitario,
              que se asigna a los casos más críticos de la semana.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard
                icon={<IconStethoscope size={22} />}
                title="Veterinaria de emergencia"
                body="Cirugías, hospitalización y atención urgente para casos de rescate activos."
              />
              <FeatureCard
                icon={<IconHome size={22} />}
                title="Hogar temporal y alimento"
                body="Apoyo a familias de resguardo con alimento, arena y kits básicos."
                tint="accent"
              />
              <FeatureCard
                icon={<IconShield size={22} />}
                title="Rescatistas aliados"
                body="Recursos para rescatistas y refugios verificados que operan todos los días."
                tint="ink"
              />
              <FeatureCard
                icon={<IconMoney size={22} />}
                title="Operación y logística"
                body="Traslados, capturas seguras y sostenimiento de la plataforma."
              />
            </div>

            <h3 id="transparencia" className="mt-14 text-2xl font-semibold">
              Transparencia · números en vivo
            </h3>
            <p className="mt-2 text-[var(--ink-soft)]">
              Actualizados automáticamente desde nuestra base de datos y el
              historial de Stripe.
            </p>
            <div className="mt-4">
              <TransparenciaPanel />
            </div>

            <h3 className="mt-14 text-2xl font-semibold">Criterios</h3>
            <ul className="mt-4 space-y-3">
              {trans.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 text-[var(--accent)]">
                    <IconCheck size={18} />
                  </span>
                  <span className="text-[var(--ink-soft)]">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <DonationWidget />
            </div>
          </div>
        </div>
      </section>

      {/* En qué se traduce tu apoyo (sin montos — el usuario elige) */}
      <Section
        tone="alt"
        eyebrow="En qué se traduce tu apoyo"
        title="Cada aportación se convierte en algo concreto"
        subtitle="Tu donación se suma al fondo común o a un caso específico y cubre, entre otras cosas, estos ítems reales de operación."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Infraestructura",
              desc: "Servidores, almacenamiento de fotos y push notifications que sostienen la red 24/7.",
            },
            {
              title: "Alertas",
              desc: "Emails y mensajes que envían los avisos por zona a vecinos registrados.",
            },
            {
              title: "Atención veterinaria",
              desc: "Primera revisión y tratamientos para mascotas rescatadas que llegan sin dueño.",
            },
            {
              title: "Operación y logística",
              desc: "Traslados, capturas seguras, hogar temporal y moderación de la comunidad.",
            },
          ].map((t) => (
            <div key={t.title} className="vc-card-glass !p-6">
              <h3 className="text-lg font-bold vc-gradient-text inline-block">
                {t.title}
              </h3>
              <p className="mt-3 text-sm text-[var(--ink-soft)] leading-relaxed">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ de donaciones */}
      <Section eyebrow="Preguntas frecuentes" title="Sobre tus donaciones">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqDonaciones.map((q) => (
            <div key={q.q} className="vc-card !p-5">
              <h3 className="text-base font-semibold flex gap-2 items-start">
                <span className="text-[var(--brand)]">
                  <IconPaw size={18} />
                </span>
                {q.q}
              </h3>
              <p className="mt-2 text-sm text-[var(--ink-soft)] leading-relaxed">
                {q.a}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Otras formas */}
      <Section
        tone="alt"
        eyebrow="Formas de apoyar"
        title="No solo es dinero"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<IconHeart size={22} />}
            title="Difunde casos"
            body="Compartir un caso en tu red puede ser la diferencia entre que aparezca o no."
          />
          <FeatureCard
            icon={<IconHome size={22} />}
            title="Ofrece resguardo"
            body="Un hogar temporal puede salvar vidas mientras se encuentra dueño o adoptante."
            tint="accent"
          />
          <FeatureCard
            icon={<IconShield size={22} />}
            title="Únete como aliado"
            body="Si representas una marca u organización, tenemos formatos de alianza transparentes."
            tint="ink"
          />
        </div>
        <div className="mt-8 flex gap-3 flex-wrap">
          <Link href="/hogar-temporal" className="vc-btn vc-btn-outline">
            Ofrecer hogar temporal
          </Link>
          <Link href="/rescatistas" className="vc-btn vc-btn-outline">
            Sumar mi colectivo
          </Link>
          <Link href="/contacto?tema=aliados" className="vc-btn vc-btn-primary">
            Proponer alianza <IconArrow size={14} />
          </Link>
        </div>
      </Section>

      <CTA
        seed={22}
        title="¿Tu empresa quiere activar una alianza?"
        subtitle="Tenemos formatos de patrocinio transparentes con impacto medible y local en México."
        primaryHref="/contacto?tema=aliados"
        primaryLabel="Proponer alianza"
        secondaryHref="/rescatistas"
        secondaryLabel="Ver red de rescatistas"
      />
    </>
  );
}

const trans = [
  "Cada donación se procesa con Stripe — no guardamos datos de tu tarjeta.",
  "Publicamos reportes periódicos con el destino de los fondos.",
  "Los casos verificados pasan un proceso básico de validación con aliados.",
  "Puedes cancelar donaciones recurrentes cuando quieras, desde tu correo.",
  "Al principio operamos con fondos acotados; ampliamos cobertura conforme crece la comunidad.",
  "Si tu donación financia un caso específico, recibes actualización cuando se resuelva.",
];

const faqDonaciones = [
  {
    q: "¿Puedo donar desde México con tarjeta de débito?",
    a: "Sí. Stripe acepta débito, crédito y OXXO Pay en México. La donación se procesa en pesos mexicanos.",
  },
  {
    q: "¿Puedo hacer una donación mensual?",
    a: "Sí. Tenemos montos mensuales preconfigurados y puedes cancelar cuando quieras desde tu correo con un clic.",
  },
  {
    q: "¿Dan recibo deducible de impuestos?",
    a: "No. VuelveaCasa no es donataria autorizada por SAT, así que no emitimos CFDI con deducción fiscal. Tus donaciones son apoyo voluntario al proyecto. Recibirás un comprobante interno de Stripe por email para tu propio control.",
  },
  {
    q: "¿Cómo sé que mi donación llegó a un caso real?",
    a: "Cada caso verificado muestra las donaciones recibidas y al cerrarse, un resumen del uso. También publicamos reportes mensuales.",
  },
  {
    q: "¿Puedo donar productos en vez de dinero?",
    a: "Sí, pero ese flujo lo coordinamos directamente con rescatistas aliados. Escríbenos desde /contacto indicando el tema 'donaciones en especie'.",
  },
  {
    q: "¿Puedo donar a un rescatista específico?",
    a: "Sí. En cada caso verificado aparece el rescatista o refugio responsable, y tu donación va 100% a ese destino (menos comisión Stripe).",
  },
];
