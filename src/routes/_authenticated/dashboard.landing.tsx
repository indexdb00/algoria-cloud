import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2, Globe, Link2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/landing")({
  head: () => ({ meta: [{ title: "Landing Builder — Aurevia" }] }),
  component: LandingBuilder,
});

const THEMES = [
  { id: "neon-noir", name: "Neon Noir", hint: "Dark + electric green", colors: ["#0a1410", "#0f1f18", "#7dff8a"] },
  { id: "arctic", name: "Arctic Glass", hint: "Frosted minimal", colors: ["#0f1419", "#1e293b", "#67e8f9"] },
  { id: "editorial", name: "Editorial Serif", hint: "Magazine-style", colors: ["#1a1a1a", "#2d2d2d", "#f0d78c"] },
  { id: "brutalist", name: "Brutalist Pop", hint: "High contrast", colors: ["#000000", "#ffffff", "#ff5722"] },
  { id: "luxe", name: "Luxe Emerald", hint: "Premium gold-on-green", colors: ["#064e3b", "#0d7a5f", "#c9a84c"] },
  { id: "vapor", name: "Vapor Chrome", hint: "Iridescent Y2K", colors: ["#1a1a2e", "#4ade80", "#a78bfa"] },
];

function LandingBuilder() {
  const [theme, setTheme] = useState("neon-noir");
  const [title, setTitle] = useState("Skyline — Premium European Real Estate");
  const [headline, setHeadline] = useState("Apartments built for the next decade.");
  const [cta, setCta] = useState("Book a viewing");
  const [goal, setGoal] = useState("leads");

  const active = THEMES.find((t) => t.id === theme)!;

  return (
    <div className="px-10 py-12 max-w-7xl">
      <div className="mb-10 flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neon mb-3">Conversion pages</div>
          <h1 className="font-heading text-4xl font-medium tracking-tight">Landing Builder</h1>
          <p className="text-sm text-brand-muted mt-3 max-w-xl">
            Spin up high-converting landing pages backed by your agents. Pick a theme, set the goal, hit publish.
          </p>
        </div>
        <button
          onClick={() => toast.success("Page queued for generation — your Brand Agent will draft copy in seconds.")}
          className="btn-neon-solid text-sm py-2 px-4 inline-flex items-center gap-2"
        >
          <Wand2 className="size-4" /> Generate page
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* Config */}
        <div className="space-y-6">
          <Field label="Page title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
          </Field>
          <Field label="Hero headline">
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="input" />
          </Field>
          <Field label="Primary CTA">
            <input value={cta} onChange={(e) => setCta(e.target.value)} className="input" />
          </Field>
          <Field label="Conversion goal">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "leads", l: "Leads" },
                { id: "sales", l: "Sales" },
                { id: "bookings", l: "Bookings" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={
                    "py-2 text-xs rounded-md transition-all " +
                    (goal === g.id
                      ? "bg-neon/15 text-neon ring-1 ring-neon"
                      : "btn-dark")
                  }
                >
                  {g.l}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Theme">
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className={
                    "p-3 rounded-xl text-left transition-all " +
                    (theme === th.id
                      ? "ring-1 ring-neon bg-brand-surface"
                      : "ring-1 ring-brand-border bg-brand-surface/60 hover:ring-neon/50")
                  }
                >
                  <div className="flex gap-1 mb-2">
                    {th.colors.map((c) => (
                      <span key={c} className="size-4 rounded-full ring-1 ring-black/30" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="text-xs font-medium">{th.name}</div>
                  <div className="text-[10px] text-brand-muted">{th.hint}</div>
                </button>
              ))}
            </div>
          </Field>
          <div className="p-4 rounded-xl bg-brand-surface ring-1 ring-brand-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <Link2 className="size-3.5 text-neon" />
              <span>aurevia.app/p/your-slug</span>
            </div>
            <button onClick={() => toast.success("Link copied")} className="btn-dark text-xs px-2 py-1">Copy</button>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl ring-1 ring-brand-border overflow-hidden bg-brand-surface">
          <div className="h-8 bg-brand-bg border-b border-brand-border flex items-center px-3 gap-1.5">
            <span className="size-2 rounded-full bg-red-500/60" />
            <span className="size-2 rounded-full bg-yellow-500/60" />
            <span className="size-2 rounded-full bg-neon/80" />
            <div className="ml-3 text-[10px] text-brand-muted flex items-center gap-1">
              <Globe className="size-3" /> {title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.aurevia.app
            </div>
          </div>
          <div
            className="p-10 min-h-[480px]"
            style={{
              background: `linear-gradient(135deg, ${active.colors[0]}, ${active.colors[1]})`,
              color: active.colors[2],
            }}
          >
            <div className="text-[10px] uppercase tracking-widest opacity-70 mb-6">{active.name}</div>
            <h2 className="font-heading text-4xl font-medium tracking-tight mb-4 leading-tight">{headline}</h2>
            <p className="opacity-80 text-sm mb-8 max-w-md">
              Generated by your Brand Agent. Optimized continuously by the Ads & Leads agents based on live performance.
            </p>
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium"
              style={{ background: active.colors[2], color: active.colors[0] }}
            >
              <Sparkles className="size-4" /> {cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-2">{label}</div>
      {children}
    </label>
  );
}
