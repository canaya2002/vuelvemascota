/**
 * AmbientOrbs — 3 softly-drifting gradient orbs rendered in the background
 * of a container. CSS-only (no JS), pointer-events none. Use inside a
 * section with `position: relative; overflow: hidden` to clip them.
 */

export function AmbientOrbs({
  variant = "rose",
}: {
  variant?: "rose" | "sky" | "forest" | "sunrise";
}) {
  const palette =
    variant === "sky"
      ? { a: "rgba(14,165,233,0.28)", b: "rgba(167,139,250,0.22)", c: "rgba(59,130,246,0.18)" }
      : variant === "forest"
        ? { a: "rgba(16,160,121,0.26)", b: "rgba(134,239,172,0.28)", c: "rgba(253,224,71,0.22)" }
        : variant === "sunrise"
          ? { a: "rgba(253,186,116,0.32)", b: "rgba(251,113,133,0.30)", c: "rgba(147,51,234,0.20)" }
          : { a: "rgba(225,29,72,0.28)", b: "rgba(244,114,182,0.24)", c: "rgba(14,165,233,0.18)" };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div
        className="absolute vc-blob"
        style={{
          top: "-12%",
          left: "-8%",
          width: "520px",
          height: "520px",
          background: `radial-gradient(circle at 30% 30%, ${palette.a}, transparent 65%)`,
          filter: "blur(8px)",
        }}
      />
      <div
        className="absolute vc-blob"
        style={{
          top: "20%",
          right: "-10%",
          width: "460px",
          height: "460px",
          background: `radial-gradient(circle at 60% 40%, ${palette.b}, transparent 60%)`,
          animationDelay: "-6s",
          filter: "blur(10px)",
        }}
      />
      <div
        className="absolute vc-blob"
        style={{
          bottom: "-14%",
          left: "20%",
          width: "500px",
          height: "500px",
          background: `radial-gradient(circle at 40% 60%, ${palette.c}, transparent 60%)`,
          animationDelay: "-11s",
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}
