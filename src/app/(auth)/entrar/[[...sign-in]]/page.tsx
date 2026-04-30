import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { FLAGS } from "@/lib/flags";
import { PageHero } from "@/components/PageHero";
import { AuthFrame } from "@/components/AuthFrame";

export const metadata: Metadata = {
  title: "Entrar — VuelveaCasa",
  description: "Entra a tu cuenta de VuelveaCasa.",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (!FLAGS.auth) {
    return (
      <PageHero
        eyebrow="Muy pronto"
        title="Cuentas personales en camino"
        subtitle="Aún estamos activando el acceso con cuenta. Mientras tanto puedes registrarte a la waitlist para que te avisemos apenas esté listo."
        imageSeed={6}
        primary={{ href: "/registro", label: "Registrarme gratis" }}
        secondary={{ href: "/", label: "Volver al inicio" }}
      />
    );
  }

  return (
    <AuthFrame
      mode="signin"
      bottomNote={
        <>
          ¿Problemas para entrar?{" "}
          <Link
            href="/contacto"
            className="text-[var(--brand-ink)] font-semibold hover:text-[var(--brand)]"
          >
            Contáctanos
          </Link>
        </>
      }
    >
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-lg border border-[var(--line)] rounded-2xl bg-white",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
          },
        }}
        routing="path"
        path="/entrar"
        signUpUrl="/crear-cuenta"
      />
    </AuthFrame>
  );
}
