"use client";

import { Children, isValidElement, type ReactNode, type ReactElement } from "react";
import { Reveal } from "./Reveal";

type Props = {
  children: ReactNode;
  step?: number;
  initialDelay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
};

/**
 * Stagger — wraps each direct child in a <Reveal> with incremental delay.
 * Use for lists of cards, steps, features, etc.
 */
export function Stagger({
  children,
  step = 90,
  initialDelay = 40,
  direction = "up",
  className,
  as: Tag = "div",
}: Props) {
  const Comp = Tag as "div";
  return (
    <Comp className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        return (
          <Reveal delay={initialDelay + i * step} direction={direction} key={(child as ReactElement).key ?? i}>
            {child as ReactElement}
          </Reveal>
        );
      })}
    </Comp>
  );
}
