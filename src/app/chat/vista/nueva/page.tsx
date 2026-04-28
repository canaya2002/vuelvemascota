import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { FLAGS } from "@/lib/flags";
import { NuevaVistaForm } from "@/components/NuevaVistaForm";

export const metadata: Metadata = {
  title: "Nueva vista · Comunidad · VuelveaCasa MX",
  description: "Crea una vista guardada con filtros para ver solo lo que te importa.",
  robots: { index: false, follow: true },
};

export default async function NuevaVistaPage() {
  if (FLAGS.auth) {
    const u = await currentUser();
    if (!u) redirect("/entrar?next=/chat/vista/nueva");
  }
  return (
    <>
      <PageHero
        eyebrow="Nueva vista"
        title={
          <>
            Filtra solo lo que <span className="vc-gradient-text">te importa</span>.
          </>
        }
        subtitle="Da nombre a tu filtro. Solo tú lo verás, salvo que lo marques pública."
        imageSeed={20}
      />
      <section className="py-10 md:py-14">
        <div className="vc-container max-w-2xl">
          <NuevaVistaForm />
        </div>
      </section>
    </>
  );
}
