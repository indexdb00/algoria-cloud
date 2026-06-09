import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

export type TutorialStep = { title: string; body: string };

/**
 * Elegant first-visit "push" tutorial.
 * Uses BrandMark + Fraunces titles, slim neon progress bar, gradient buttons.
 */
export function Tutorial({ id, steps, title }: { id: string; steps: TutorialStep[]; title?: string }) {
  const key = `algoria.tour.${id}`;
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(key);
      if (!seen) setOpen(true);
    } catch { /* ignore */ }
  }, [key]);

  function close() {
    setOpen(false);
    try { localStorage.setItem(key, "1"); } catch { /* ignore */ }
  }

  if (!open || steps.length === 0) return null;
  const step = steps[i];
  const last = i === steps.length - 1;
  const progress = ((i + 1) / steps.length) * 100;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-4"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-brand-surface ring-1 ring-brand-border shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden fade-up relative"
      >
        {/* Decorative gradient backdrop */}
        <div className="absolute -top-24 -right-24 size-64 rounded-full blur-3xl pointer-events-none opacity-30 bg-gradient-to-br from-sky-400 to-blue-700" />

        {/* Slim progress bar */}
        <div className="relative h-[2px] bg-brand-border/60">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 transition-all duration-500 shadow-[0_0_10px_var(--neon)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="relative flex items-start gap-4 px-7 pt-7 pb-3">
          <BrandMark size={36} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.25em] text-neon mb-1">
              {title ?? "Algoria"}
            </div>
            <h3 className="font-heading text-2xl font-medium leading-tight tracking-tight">
              {step.title}
            </h3>
          </div>
          <button onClick={close} aria-label="Skip" className="text-brand-muted hover:text-brand-text -mr-2 -mt-1">
            <X className="size-4" />
          </button>
        </div>

        <div className="relative px-7 pb-6 pt-2 text-[15px] text-brand-muted leading-relaxed min-h-[100px]" style={{ fontFamily: "var(--font-sans, Inter, system-ui)" }}>
          {step.body}
        </div>

        <div className="relative flex items-center justify-between gap-2 px-7 py-4 border-t border-brand-border/70 bg-brand-bg/30">
          <div className="text-[11px] text-brand-muted font-medium tabular-nums">
            {i + 1} <span className="opacity-50">/ {steps.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {i > 0 && (
              <button onClick={() => setI(i - 1)} className="btn-dark text-xs px-3 py-2 inline-flex items-center gap-1 rounded-lg">
                <ChevronLeft className="size-3.5" /> Back
              </button>
            )}
            {!last ? (
              <button onClick={() => setI(i + 1)} className="text-xs px-4 py-2 inline-flex items-center gap-1.5 rounded-lg font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-[0_8px_24px_-8px_var(--neon)] transition-all">
                Next <ChevronRight className="size-3.5" />
              </button>
            ) : (
              <button onClick={close} className="text-xs px-5 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-[0_8px_24px_-8px_var(--neon)] transition-all">
                Got it
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
