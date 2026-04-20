import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { FLAGS } from "@/lib/flags";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Entrar — VuelveaCasa",
  description: "Entra a tu cuenta de VuelveaCasa.",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (!FLAGS.auth) {
    return (
      <>
        <PageHero
          eyebrow="Muy pronto"
          title="Cuentas personales en camino"
          subtitle="Aún estamos activando el acceso con cuenta. Mientras tanto puedes registrarte a la waitlist para que te avisemos apenas esté listo."
          imageSeed={6}
          primary={{ href: "/registro", label: "Registrarme gratis" }}
          secondary={{ href: "/", label: "Volver al inicio" }}
        />
      </>
    );
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-20 bg-[var(--bg-alt)]">
      <div className="vc-container flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Bienvenido de vuelta</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Entra para seguir tus casos, donaciones y alertas.
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full flex justify-center",
              card: "shadow-lg border border-[var(--line)] rounded-2xl",
            },
          }}
          routing="path"
          path="/entrar"
          signUpUrl="/crear-cuenta"
        />
        <p className="mt-8 text-sm text-[var(--muted)]">
          ¿Problemas para entrar?{" "}
          <Link href="/contacto" className="text-[var(--brand-ink)] font-semibold">
            Contáctanos
          </Link>
        </p>
      </div>
    </section>
  );
}
