import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { FLAGS } from "@/lib/flags";
import { PageHero } from "@/components/PageHero";
import { AuthFrame } from "@/components/AuthFrame";

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
    <AuthFrame
      mode="signup"
      bottomNote={
        <>
          Al continuar aceptas los{" "}
          <Link
            href="/terminos"
            className="underline underline-offset-4 hover:text-[var(--brand)]"
          >
            términos
          </Link>{" "}
          y el{" "}
          <Link
            href="/privacidad"
            className="underline underline-offset-4 hover:text-[var(--brand)]"
          >
            aviso de privacidad
          </Link>
          .
        </>
      }
    >
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-lg border border-[var(--line)] rounded-2xl bg-white",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
          },
        }}
        routing="path"
        path="/crear-cuenta"
        signInUrl="/entrar"
      />
    </AuthFrame>
  );
}
