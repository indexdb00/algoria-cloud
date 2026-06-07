import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Zap, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  head: () => ({ meta: [{ title: "Billing — Aurevia" }] }),
  component: BillingPage,
});

const PACKS = [
  { id: "starter", credits: 500, price: "€19", per: "€0.038 / credit", features: ["2 active agents", "Weekly performance reports", "Email support"] },
  { id: "growth", credits: 2500, price: "€59", per: "€0.024 / credit", featured: true, features: ["All 5 agents", "Daily performance pulse", "All 7 integrations", "Priority routing"] },
  { id: "scale", credits: 12000, price: "€199", per: "€0.017 / credit", features: ["Custom agents", "Dedicated success engineer", "SSO + data residency"] },
];

function BillingPage() {
  const [country, setCountry] = useState<string>("");

  useEffect(() => {
    supabase.from("profiles").select("country").maybeSingle().then(({ data }) => {
      setCountry((data?.country ?? "").toUpperCase());
    });
  }, []);

  const isBR = country === "BR" || country === "BRASIL" || country === "BRAZIL";

  return (
    <div className="px-5 md:px-10 py-10 md:py-12 max-w-6xl">
      <div className="mb-10">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-3">Billing & Credits</div>
        <h1 className="font-heading text-4xl font-medium tracking-tight">Top up your workspace</h1>
        <p className="text-sm text-brand-muted mt-3 max-w-xl">
          Credits power every agent action and every conversion you ship. Pay-as-you-go via Stripe — no contracts.
        </p>
        {isBR && (
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500/15 to-emerald-700/10 ring-1 ring-emerald-500/30 text-xs">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <strong className="text-emerald-300">PIX automático disponível</strong>
            <span className="text-brand-muted">— pague com PIX recorrente direto na assinatura.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {PACKS.map((p) => (
          <div
            key={p.id}
            className={
              "p-6 rounded-2xl flex flex-col " +
              (p.featured
                ? "bg-brand-surface ring-1 ring-neon shadow-[0_0_40px_-12px_var(--neon)]"
                : "bg-brand-surface ring-1 ring-brand-border")
            }
          >
            {p.featured && (
              <span className="self-start text-[10px] uppercase tracking-widest text-neon mb-3 inline-flex items-center gap-1">
                <Zap className="size-3" /> Most popular
              </span>
            )}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-heading text-4xl font-medium">{p.price}</span>
              <span className="text-xs text-brand-muted">one-time</span>
            </div>
            <div className="text-sm text-brand-muted mb-1">{p.credits.toLocaleString()} credits</div>
            <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-6">{p.per}</div>
            <ul className="space-y-2 mb-6 flex-grow">
              {p.features.map((f) => (
                <li key={f} className="text-xs text-brand-muted flex items-center gap-2">
                  <Check className="size-3.5 text-neon" /> {f}
                </li>
              ))}
              {isBR && (
                <li className="text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="size-3.5 text-emerald-400" /> Pagamento via PIX automático
                </li>
              )}
            </ul>
            <button
              onClick={() => toast.info("Connect Stripe to enable checkout — Settings → Payments.")}
              className={p.featured ? "btn-neon-solid text-sm py-2" : "btn-neon text-sm py-2"}
            >
              <CreditCard className="size-4 inline mr-1.5" />
              {isBR ? "Comprar (Cartão / PIX)" : "Buy credits"}
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border text-xs text-brand-muted leading-relaxed">
        Stripe checkout activates once payments are enabled on this workspace. Brazilian users can pay using <strong className="text-brand-text">PIX automático</strong> (recurring PIX) or card; European users use card or SEPA.
      </div>
    </div>
  );
}
