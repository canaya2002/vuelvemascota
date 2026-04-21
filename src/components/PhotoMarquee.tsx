import Image from "next/image";

type Props = {
  images: string[];
  speed?: "normal" | "slow";
  direction?: "left" | "right";
  size?: "sm" | "md" | "lg";
  rounded?: "full" | "xl" | "2xl";
  label?: string;
};

const sizes = {
  sm: "w-36 h-36 md:w-40 md:h-40",
  md: "w-48 h-48 md:w-56 md:h-56",
  lg: "w-64 h-64 md:w-72 md:h-72",
};

const radii = {
  full: "rounded-full",
  xl: "rounded-[22px]",
  "2xl": "rounded-[28px]",
};

export function PhotoMarquee({
  images,
  speed = "normal",
  direction = "left",
  size = "md",
  rounded = "2xl",
  label,
}: Props) {
  if (!images.length) return null;
  // Duplicamos la lista para un loop visualmente continuo sin saltos.
  const loop = [...images, ...images];
  return (
    <div
      className="vc-marquee-mask"
      role={label ? "region" : undefined}
      aria-label={label}
    >
      <div
        className={`vc-marquee ${speed === "slow" ? "vc-marquee-slow" : ""} ${
          direction === "right" ? "vc-marquee-reverse" : ""
        }`}
      >
        {loop.map((src, i) => (
          <div
            key={i}
            className={`relative overflow-hidden ring-1 ring-black/5 shadow-sm mr-4 ${sizes[size]} ${radii[rounded]}`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="288px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
