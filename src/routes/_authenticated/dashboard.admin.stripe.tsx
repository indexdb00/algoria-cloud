import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Save, ExternalLink, KeyRound, Webhook, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/admin/stripe")({
  head: () => ({ meta: [{ title: "Stripe — Admin" }] }),
  component: AdminStripe,
});

type Cfg = {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  priceStarter: string;
  pricePlus: string;
  priceBusiness: string;
  pixEnabled: boolean;
  mode: "test" | "live";
};

const EMPTY: Cfg = {
  publishableKey: "",
  secretKey: "",
  webhookSecret: "",
  priceStarter: "",
  pricePlus: "",
  priceBusiness: "",
  pixEnabled: true,
  mode: "test",
};

const KEY = "algoria.admin.stripe";

function AdminStripe() {
  const [cfg, setCfg] = useState<Cfg>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCfg({ ...EMPTY, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(cfg));
      setSaved(true);
      toast.success("Stripe configuration saved locally. Add the secret key to the backend secrets to enable charging.");
      setTimeout(() => setSaved(false), 2500);
    } catch { toast.error("Could not save."); }
  }

  function set<K extends keyof Cfg>(k: K, v: Cfg[K]) {
    setCfg((c) => ({ ...c, [k]: v }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#635BFF]/10 to-brand-surface ring-1 ring-brand-border p-5 md:p-6 flex items-start gap-4">
        <div className="size-12 rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#3F38E0] flex items-center justify-center shadow-[0_10px_30px_-10px_#635BFF]">
          <CreditCard className="size-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-neon">Payments</div>
          <h2 className="font-heading text-xl md:text-2xl tracking-tight">Stripe Configuration</h2>
          <p className="text-xs text-brand-muted mt-1">
            Connect your Stripe account to charge Algoria subscriptions. PIX is enabled for Brazilian customers automatically.
          </p>
        </div>
        <a
          href="https://dashboard.stripe.com/apikeys"
          target="_blank" rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg ring-1 ring-brand-border hover:ring-neon/40 text-brand-muted hover:text-neon"
        >
          Stripe dashboard <ExternalLink className="size-3" />
        </a>
      </div>

      {/* Mode toggle */}
      <div className="rounded-2xl bg-brand-surface ring-1 ring-brand-border p-5">
        <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-3">Environment</div>
        <div className="flex gap-2">
          {(["test", "live"] as const).map((m) => (
            <button
              key={m}
              onClick={() => set("mode", m)}
              className={"text-xs px-4 py-2 rounded-lg ring-1 transition " + (cfg.mode === m ? "ring-neon text-neon bg-neon/5" : "ring-brand-border text-brand-muted hover:text-brand-text")}
            >
              {m === "test" ? "Test mode" : "Live mode"}
            </button>
          ))}
        </div>
      </div>

      {/* Credentials */}
      <section className="rounded-2xl bg-brand-surface ring-1 ring-brand-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-neon" />
          <h3 className="text-sm font-medium">API Credentials</h3>
        </div>
        <Field label="Publishable key" placeholder="pk_test_…" value={cfg.publishableKey} onChange={(v) => set("publishableKey", v)} />
        <Field label="Secret key (server)" placeholder="sk_test_…" value={cfg.secretKey} onChange={(v) => set("secretKey", v)} mono />
        <p className="text-[11px] text-brand-muted">
          The secret key is stored in your browser only for this preview. To actually charge cards, also add it to the backend Secrets vault as <code className="text-neon">STRIPE_SECRET_KEY</code>.
        </p>
      </section>

      {/* Webhook */}
      <section className="rounded-2xl bg-brand-surface ring-1 ring-brand-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Webhook className="size-4 text-neon" />
          <h3 className="text-sm font-medium">Webhook</h3>
        </div>
        <Field
          label="Webhook signing secret"
          placeholder="whsec_…"
          value={cfg.webhookSecret}
          onChange={(v) => set("webhookSecret", v)}
          mono
        />
        <div className="text-[11px] text-brand-muted">
          Endpoint URL to register in Stripe:
          <code className="ml-1 text-neon break-all">/api/public/stripe/webhook</code>
        </div>
      </section>

      {/* Prices */}
      <section className="rounded-2xl bg-brand-surface ring-1 ring-brand-border p-5 space-y-4">
        <h3 className="text-sm font-medium">Plan price IDs</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Starter" placeholder="price_…" value={cfg.priceStarter} onChange={(v) => set("priceStarter", v)} compact />
          <Field label="Plus" placeholder="price_…" value={cfg.pricePlus} onChange={(v) => set("pricePlus", v)} compact />
          <Field label="Business" placeholder="price_…" value={cfg.priceBusiness} onChange={(v) => set("priceBusiness", v)} compact />
        </div>
      </section>

      {/* PIX */}
      <section className="rounded-2xl bg-brand-surface ring-1 ring-brand-border p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={cfg.pixEnabled} onChange={(e) => set("pixEnabled", e.target.checked)} className="mt-1 accent-[var(--neon)]" />
          <div>
            <div className="text-sm font-medium">PIX automático (Brazilian customers)</div>
            <div className="text-[11px] text-brand-muted mt-0.5">Enables recurring PIX payments when the customer's billing country is Brazil.</div>
          </div>
        </label>
      </section>

      <div className="flex justify-end gap-2">
        <button onClick={save} className="btn-neon-solid text-sm py-2.5 px-5 inline-flex items-center gap-2">
          {saved ? <CheckCircle2 className="size-4" /> : <Save className="size-3.5" />}
          {saved ? "Saved" : "Save configuration"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, mono, compact,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean; compact?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-brand-muted mb-1.5 block">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={"input-base w-full " + (mono ? "font-mono text-xs " : "") + (compact ? "" : "")}
        autoComplete="off"
        spellCheck={false}
      />
    </label>
  );
}
