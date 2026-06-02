import { createFileRoute } from "@tanstack/react-router";
import { Plug, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Aurevia" }] }),
  component: IntegrationsPage,
});

const INTEGRATIONS = [
  {
    id: "meta-ads",
    name: "Meta Ads",
    desc: "Facebook + Instagram campaigns, audiences, retargeting and creative testing piloted by the Ads Agent.",
    scopes: ["ads_management", "business_management", "pages_read_engagement"],
    accent: "from-[#1877F2]/30",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    desc: "Search, Performance Max & YouTube. Bid optimization and keyword expansion run autonomously every hour.",
    scopes: ["adwords", "analytics.readonly"],
    accent: "from-[#FBBC04]/30",
  },
  {
    id: "bidmachine",
    name: "BidMachine",
    desc: "Programmatic in-app and CTV inventory. RTB optimization with cross-network deduplication.",
    scopes: ["bidmachine.read", "bidmachine.write"],
    accent: "from-neon/30",
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads",
    desc: "Spark Ads, Shop ads & UGC creative cycles managed by the Reach Agent.",
    scopes: ["tiktok_ads.read", "tiktok_ads.write"],
    accent: "from-fuchsia-500/30",
  },
  {
    id: "google-analytics",
    name: "Google Analytics 4",
    desc: "Attribution and conversion data piped into every agent for closed-loop optimization.",
    scopes: ["analytics.readonly"],
    accent: "from-[#E37400]/30",
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    desc: "B2B account-based campaigns with intent scoring for the Leads Agent.",
    scopes: ["rw_ads", "r_ads_reporting"],
    accent: "from-[#0A66C2]/30",
  },
];

function IntegrationsPage() {
  return (
    <div className="px-10 py-12 max-w-6xl">
      <div className="mb-12">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-3">Connections</div>
        <h1 className="font-heading text-4xl font-medium tracking-tight">Integrations</h1>
        <p className="text-sm text-brand-muted mt-3 max-w-xl">
          Plug in the ad networks and analytics sources your agents will operate. OAuth flows open in a secure popup; revoke anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((i) => (
          <div
            key={i.id}
            className={
              "relative overflow-hidden p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border " +
              "before:absolute before:inset-0 before:bg-gradient-to-br before:" + i.accent + " before:to-transparent before:opacity-30 before:pointer-events-none"
            }
          >
            <div className="relative flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-brand-bg ring-1 ring-brand-border flex items-center justify-center">
                  <Plug className="size-4 text-neon" />
                </div>
                <div>
                  <div className="font-medium text-sm">{i.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-brand-muted">Not connected</div>
                </div>
              </div>
              <button
                onClick={() => toast.info(`OAuth flow for ${i.name} will open. Configure provider keys in Settings.`)}
                className="btn-neon text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
              >
                Connect <ExternalLink className="size-3" />
              </button>
            </div>
            <p className="relative text-xs text-brand-muted leading-relaxed mb-4">{i.desc}</p>
            <div className="relative flex flex-wrap gap-1.5">
              {i.scopes.map((s) => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-brand-bg ring-1 ring-brand-border text-brand-muted">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border flex items-start gap-3">
        <Check className="size-4 text-neon mt-0.5" />
        <div className="text-xs text-brand-muted leading-relaxed">
          Tokens are stored encrypted in your Aurevia workspace and never exposed to the agents directly — every API call is scoped, rate-limited and audit-logged.
        </div>
      </div>
    </div>
  );
}
