import { useEffect, useState } from "react";

/** Neon cursor overlay — only visible on hover, lightweight, no listeners outside this component. */
export function ConsumoCursor() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    function onMove(e: MouseEvent) { setPos({ x: e.clientX, y: e.clientY }); }
    function onLeave() { setPos(null); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseleave", onLeave); };
  }, []);
  if (!pos) return null;
  return (
    <>
      <div
        className="pointer-events-none fixed z-[60] -translate-x-1/2 -translate-y-1/2 size-8 rounded-full mix-blend-screen"
        style={{
          left: pos.x, top: pos.y,
          background: "radial-gradient(circle, color-mix(in oklab, var(--neon) 45%, transparent), transparent 70%)",
          boxShadow: "0 0 30px color-mix(in oklab, var(--neon) 60%, transparent)",
          transition: "transform 60ms linear",
        }}
      />
      <div
        className="pointer-events-none fixed z-[60] -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-neon"
        style={{ left: pos.x, top: pos.y, boxShadow: "0 0 10px var(--neon)" }}
      />
    </>
  );
}
