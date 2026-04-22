"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

type Props = {
  children: ReactNode;
  strength?: number;
  className?: string;
  as?: "div" | "span" | "button" | "a";
};

/**
 * Magnetic — tracks cursor within its bounds and nudges children toward
 * the pointer. Adds a premium tactile feel to CTAs. Reverts smoothly on
 * mouse leave. No-op on touch devices (pointer events still fire but the
 * reset on pointerleave/up clears instantly).
 */
export function Magnetic({ children, strength = 0.28, className, as: Tag = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
  };
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate3d(0,0,0)";
  };

  const Comp = Tag as "div";
  return (
    <Comp
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onBlur={reset}
      className={className}
      style={{ display: "inline-block", transition: "transform 0.25s cubic-bezier(0.2,0.8,0.2,1)", willChange: "transform" }}
    >
      {children}
    </Comp>
  );
}
