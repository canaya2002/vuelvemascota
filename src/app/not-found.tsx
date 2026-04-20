import Link from "next/link";
import Image from "next/image";
import { pickImage } from "@/lib/images";

export default function NotFound() {
  return (
    <section className="py-24 md:py-32">
      <div className="vc-container grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="vc-eyebrow">Error 404</span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold">Se nos escapó esta página.</h1>
          <p className="mt-5 text-lg text-[var(--ink-soft)] max-w-lg">
            Pero no la mascota. Volvamos al inicio o al registro para activar tu zona.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/" className="vc-btn vc-btn-primary">
              Ir al inicio
            </Link>
            <Link href="/registro" className="vc-btn vc-btn-outline">
              Registrarme
            </Link>
          </div>
        </div>
        <div className="relative aspect-square rounded-[32px] overflow-hidden">
          <Image
            src={pickImage(30)}
            alt=""
            fill
            sizes="(max-width:768px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
