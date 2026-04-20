import Image from "next/image";
import Link from "next/link";
import { pickImage } from "@/lib/images";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  imageSeed = 3,
  primary,
  secondary,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  imageSeed?: number;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-alt)]">
      <div className="vc-container py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          {eyebrow && <span className="vc-eyebrow">{eyebrow}</span>}
          <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-[1.05]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 text-lg md:text-xl text-[var(--ink-soft)] max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
          {(primary || secondary) && (
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {primary && (
                <Link href={primary.href} className="vc-btn vc-btn-primary">
                  {primary.label}
                </Link>
              )}
              {secondary && (
                <Link href={secondary.href} className="vc-btn vc-btn-outline">
                  {secondary.label}
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="lg:col-span-5">
          <div className="relative aspect-[5/6] rounded-[32px] overflow-hidden shadow-lg">
            <Image
              src={pickImage(imageSeed)}
              alt=""
              fill
              priority
              sizes="(max-width:1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
