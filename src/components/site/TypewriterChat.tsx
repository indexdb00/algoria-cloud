import { useEffect, useState } from "react";
import { Sparkles, Send, Activity } from "lucide-react";

/**
 * Animated illustration: a chat composer where prompts type, pause, erase and
 * a new prompt is written. Visual-only — no real submissions.
 */
export function TypewriterChat({ prompts }: { prompts: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"typing" | "pausing" | "erasing">("typing");
  const [reply, setReply] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const current = prompts[index % prompts.length];
    if (mode === "typing") {
      if (text.length < current.length) {
        timer = setTimeout(() => setText(current.slice(0, text.length + 1)), 38 + Math.random() * 35);
      } else {
        // Simulated assistant reply after a short delay
        timer = setTimeout(() => {
          setReply("✓ Drafting campaign · selecting audience · running policy check…");
          setTimeout(() => setMode("pausing"), 900);
        }, 350);
      }
    } else if (mode === "pausing") {
      timer = setTimeout(() => { setReply(null); setMode("erasing"); }, 1300);
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), 18);
      } else {
        timer = setTimeout(() => { setIndex((i) => i + 1); setMode("typing"); }, 250);
      }
    }
    return () => clearTimeout(timer);
  }, [text, mode, index, prompts]);

  return (
    <div className="relative rounded-3xl bg-brand-surface/80 ring-1 ring-brand-border shadow-2xl shadow-black/40 overflow-hidden backdrop-blur">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(var(--neon) 1px, transparent 1px), linear-gradient(90deg, var(--neon) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* topbar */}
      <div className="relative h-11 px-4 border-b border-brand-border flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-neon shadow-[0_0_8px_var(--neon)]" />
        <div className="ml-3 text-[10px] uppercase tracking-widest text-brand-muted flex items-center gap-1.5">
          <Activity className="size-3 text-neon animate-pulse" /> Algoria · live
        </div>
      </div>

      <div className="relative p-5 md:p-6 min-h-[280px] flex flex-col gap-4">
        {/* assistant intro bubble */}
        <div className="flex items-start gap-2">
          <div className="size-7 rounded-lg icon-3d flex items-center justify-center shrink-0">
            <Sparkles className="size-3.5 text-[oklch(0.16_0.01_160)]" />
          </div>
          <div className="rounded-2xl rounded-tl-sm px-3.5 py-2 bg-brand-bg ring-1 ring-brand-border text-xs text-brand-muted max-w-[85%]">
            Hi — describe a campaign, drop a creative, or ask about today's pulse.
          </div>
        </div>

        {/* user bubble (typing) */}
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm px-3.5 py-2 bg-neon/15 ring-1 ring-neon/40 text-xs text-brand-text max-w-[85%] min-h-[2.25rem]">
            <span>{text}</span>
            <span className="inline-block w-[2px] h-3 ml-[1px] bg-neon align-middle animate-pulse" />
          </div>
        </div>

        {/* assistant reply */}
        {reply && (
          <div className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="size-7 rounded-lg icon-3d flex items-center justify-center shrink-0">
              <Sparkles className="size-3.5 text-[oklch(0.16_0.01_160)]" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-3.5 py-2 bg-brand-bg ring-1 ring-neon/30 text-xs text-brand-text max-w-[85%]">
              <span className="size-1.5 rounded-full bg-neon animate-pulse inline-block mr-1.5" />
              {reply}
            </div>
          </div>
        )}

        {/* composer */}
        <div className="mt-auto pt-3 flex items-center gap-2 border-t border-brand-border/60">
          <div className="flex-1 h-9 rounded-xl bg-brand-bg ring-1 ring-brand-border px-3 flex items-center text-xs text-brand-muted">
            Ask Algoria…
          </div>
          <button className="size-9 rounded-xl btn-neon-solid flex items-center justify-center" aria-hidden>
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
