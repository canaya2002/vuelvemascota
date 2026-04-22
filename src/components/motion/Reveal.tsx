"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

type Props = {
  children: ReactNode;
  as?: "div" | "section" | "article" | "li" | "ul" | "ol" | "span";
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
  className?: string;
};

/**
 * Reveal — fades + slides `children` into view when they intersect the
 * viewport. Server-side renders the element already in its "visible" state
 * (opacity 0 but transform identity + will-change) and the client swaps
 * `data-in` once IntersectionObserver fires, so no JS-less flash happens.
 *
 * Respects prefers-reduced-motion via the global CSS rule in globals.css.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  direction = "up",
  distance = 18,
  duration = 620,
  once = true,
  threshold = 0.12,
  className = "",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Above-the-fold elements: reveal on next paint so the first scroll
    // position already looks animated without waiting for user scroll.
    if (typeof window !== "undefined") {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) {
        const id = window.requestAnimationFrame(() => setVisible(true));
        if (once) return () => cancelAnimationFrame(id);
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  const tx =
    direction === "left" ? -distance :
    direction === "right" ? distance :
    0;
  const ty =
    direction === "up" ? distance :
    direction === "down" ? -distance :
    0;

  const style: React.CSSProperties = {
    transition: `opacity ${duration}ms cubic-bezier(0.2,0.8,0.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.2,0.8,0.2,1) ${delay}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0,0,0)" : `translate3d(${tx}px, ${ty}px, 0)`,
    willChange: "opacity, transform",
  };

  // Tag is a union of valid HTML tags; cast ref accordingly.
  const Comp = Tag as "div";
  return (
    <Comp
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={style}
      data-in={visible ? "1" : "0"}
    >
      {children}
    </Comp>
  );
}
