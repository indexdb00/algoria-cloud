import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";

/**
 * Post-login splash: Algoria mark + wordmark + animated blue progress bar.
 * Auto-dismisses after ~1.4s; shown once per session via sessionStorage flag.
 */
export function SplashLoader({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1300);
    const t2 = setTimeout(() => onDone(), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className={
        "fixed inset-0 z-[100] grid place-items-center bg-brand-bg transition-opacity duration-500 " +
        (leaving ? "opacity-0 pointer-events-none" : "opacity-100")
      }
      aria-hidden={leaving}
    >
      <div className="flex flex-col items-center gap-7 px-8">
        <div className="flex items-center gap-4">
          <BrandMark size={48} className="splash-float" />
          <span className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
            Algoria
          </span>
        </div>
        <div className="splash-bar-track">
          <div className="splash-bar-fill" />
        </div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-brand-muted">
          Loading your workspace
        </div>
      </div>
    </div>
  );
}
