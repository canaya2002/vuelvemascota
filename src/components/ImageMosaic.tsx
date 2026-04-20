import Image from "next/image";
import { pickMany } from "@/lib/images";

export function ImageMosaic({
  count = 6,
  offset = 0,
  caption,
}: {
  count?: number;
  offset?: number;
  caption?: string;
}) {
  const imgs = pickMany(count, offset);
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {imgs.map((src, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl aspect-square ${
              i === 0 ? "col-span-2 row-span-2 aspect-auto md:aspect-square" : ""
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 16vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {caption && (
        <p className="mt-4 text-sm text-[var(--muted)] text-center">{caption}</p>
      )}
    </div>
  );
}
