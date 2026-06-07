import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export type TutorialStep = { title: string; body: string };

/**
 * Lightweight first-visit "push" tutorial. Stores completion in localStorage by id.
 * Displays a small modal stack of steps; auto-shows the first time a page mounts.
 */
export function Tutorial({ id, steps, title }: { id: string; steps: TutorialStep[]; title?: string }) {
  const key = `aurevia.tour.${id}`;
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

  return (
    <div className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={close}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-brand-surface ring-1 ring-brand-border shadow-2xl shadow-black/40 overflow-hidden fade-up"
      >
        <div className="flex items-start gap-3 p-5 border-b border-brand-border">
          <div className="size-9 rounded-xl icon-3d flex items-center justify-center shrink-0">
            <Sparkles className="size-4" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-neon">{title ?? "Quick tour"}</div>
            <h3 className="font-heading text-lg leading-tight mt-0.5">{step.title}</h3>
          </div>
          <button onClick={close} aria-label="Skip" className="text-brand-muted hover:text-brand-text">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5 text-sm text-brand-muted leading-relaxed min-h-[88px]">
          {step.body}
        </div>
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-brand-border">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <span key={idx} className={"size-1.5 rounded-full transition-all " + (idx === i ? "bg-neon w-4" : "bg-brand-border")} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {i > 0 && (
              <button onClick={() => setI(i - 1)} className="btn-dark text-xs px-2.5 py-1.5 inline-flex items-center gap-1">
                <ChevronLeft className="size-3" /> Back
              </button>
            )}
            {!last ? (
              <button onClick={() => setI(i + 1)} className="btn-neon-solid text-xs px-3 py-1.5 inline-flex items-center gap-1">
                Next <ChevronRight className="size-3" />
              </button>
            ) : (
              <button onClick={close} className="btn-neon-solid text-xs px-3 py-1.5">Got it</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
