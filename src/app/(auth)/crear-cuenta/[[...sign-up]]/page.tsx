import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { FLAGS } from "@/lib/flags";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Crear cuenta — VuelveaCasa",
  description: "Crea tu cuenta en VuelveaCasa y actívate en la red comunitaria.",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (!FLAGS.auth) {
    return (
      <PageHero
        eyebrow="Muy pronto"
        title="Creación de cuenta en camino"
        subtitle="Aún no hemos habilitado el acceso con cuenta personal. Regístrate a la waitlist y te avisamos apenas esté activo."
        imageSeed={9}
        primary={{ href: "/registro", label: "Unirme a la waitlist" }}
        secondary={{ href: "/", label: "Volver al inicio" }}
      />
    );
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-20 bg-[var(--bg-alt)]">
      <div className="vc-container flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Crea tu cuenta</h1>
          <p className="mt-2 text-[var(--ink-soft)]">
            Te tomará menos de un minuto. Gratis siempre.
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full flex justify-center",
              card: "shadow-lg border border-[var(--line)] rounded-2xl",
            },
          }}
          routing="path"
          path="/crear-cuenta"
          signInUrl="/entrar"
        />
        <p className="mt-8 text-sm text-[var(--muted)] max-w-md text-center">
          Al continuar aceptas los{" "}
          <Link href="/terminos" className="underline">
            términos
          </Link>{" "}
          y el{" "}
          <Link href="/privacidad" className="underline">
            aviso de privacidad
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
