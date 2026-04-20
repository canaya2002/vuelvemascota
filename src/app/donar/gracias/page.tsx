import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { pickImage } from "@/lib/images";
import { IconHeart } from "@/components/Icons";

export const metadata: Metadata = {
  title: "¡Gracias por tu donación! — VuelveaCasa",
  description: "Gracias por apoyar a la red comunitaria VuelveaCasa.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/donar/gracias" },
};

export default function Page() {
  return (
    <section className="py-24 md:py-32">
      <div className="vc-container grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[#0d6b52] font-semibold text-xs uppercase tracking-wider">
            <IconHeart size={14} /> Donación recibida
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold">¡Gracias, de verdad!</h1>
          <p className="mt-5 text-lg text-[var(--ink-soft)] max-w-lg">
            Tu donación ayuda a que más mascotas vuelvan a casa. Te enviaremos un correo con el resumen y la manera de seguir el destino de tu apoyo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/" className="vc-btn vc-btn-primary">Volver al inicio</Link>
            <Link href="/casos-de-uso" className="vc-btn vc-btn-outline">Ver casos que apoyas</Link>
          </div>
        </div>
        <div className="relative aspect-square rounded-[32px] overflow-hidden">
          <Image src={pickImage(44)} alt="" fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
