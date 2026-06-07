import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Tutorial } from "@/components/Tutorial";
import {
  GitBranch, Sparkles, Target, Users, Euro, TrendingUp, Megaphone,
  Search, Music2, Globe, BarChart3, Layers, MessageSquare, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/funnel")({
  head: () => ({ meta: [{ title: "Funnels — Aurevia" }] }),
  component: Funnels,
});

type ParsedCampaign = {
  id: string;
  name: string;
  platform: string;
  objective: string;
  audience: string;
  budget: string;
  creative: string;
  kpi: string;
  nextActions: string[];
  createdAt: string;
};

const PLATFORM_META: Record<string, { color: string; icon: typeof Megaphone; bg: string }> = {
  "Meta Ads":          { color: "#1877F2", icon: Megaphone, bg: "from-[#1877F2] to-[#0a3d8c]" },
  "Google Ads":        { color: "#FBBC04", icon: Search,    bg: "from-[#FBBC04] to-[#a17a00]" },
  "TikTok Ads":        { color: "#FF0050", icon: Music2,    bg: "from-[#FF0050] to-[#7a0026]" },
  "BidMachine":        { color: "#7C3AED", icon: Layers,    bg: "from-[#7C3AED] to-[#3b1d80]" },
  "Business Suite":    { color: "#0866FF", icon: Megaphone, bg: "from-[#0866FF] to-[#053080]" },
  "GA4":               { color: "#E37400", icon: BarChart3, bg: "from-[#E37400] to-[#7a3e00]" },
};

function detectPlatform(text: string): string {
  const m = text.match(/PLATFORM:\s*([^\n]+)/i);
  if (m) {
    const v = m[1].trim();
    for (const key of Object.keys(PLATFORM_META)) {
      if (v.toLowerCase().includes(key.toLowerCase())) return key;
    }
  }
  for (const key of Object.keys(PLATFORM_META)) {
    if (text.toLowerCase().includes(key.toLowerCase())) return key;
  }
  return "Meta Ads";
}

function field(text: string, name: string): string {
  const re = new RegExp(`${name}:\\s*([^\\n]+)`, "i");
  return text.match(re)?.[1]?.trim() ?? "";
}

function parseCampaigns(content: string, createdAt: string, idBase: string): ParsedCampaign[] {
  const out: ParsedCampaign[] = [];
  // split by CAMPAIGN: occurrences
  const parts = content.split(/(?=CAMPAIGN:)/g);
  parts.forEach((chunk, i) => {
    if (!/CAMPAIGN:/i.test(chunk)) return;
    const name = field(chunk, "CAMPAIGN") || "Untitled campaign";
    const platform = detectPlatform(chunk);
    const objective = field(chunk, "OBJECTIVE") || "—";
    const audience = field(chunk, "AUDIENCE") || "—";
    const budget = field(chunk, "BUDGET") || "—";
    const creative = field(chunk, "CREATIVE") || "—";
    const kpi = field(chunk, "KPI") || "—";
    const naMatch = chunk.match(/NEXT ACTIONS:\s*([\s\S]+?)(?:\n\n|$)/i);
    const nextActions = naMatch
      ? naMatch[1].split("\n").map((l) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean).slice(0, 5)
      : [];
    out.push({ id: `${idBase}-${i}`, name, platform, objective, audience, budget, creative, kpi, nextActions, createdAt });
  });
  return out;
}

function Funnels() {
  const { t } = useI18n();
  const [campaigns, setCampaigns] = useState<ParsedCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .eq("agent_slug", "aurevia")
        .order("updated_at", { ascending: false })
        .limit(5);
      if (!convs || convs.length === 0) { setLoading(false); return; }
      const ids = convs.map((c) => c.id);
      const { data: msgs } = await supabase
        .from("messages")
        .select("id,content,created_at")
        .in("conversation_id", ids)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(50);
      const parsed: ParsedCampaign[] = [];
      (msgs ?? []).forEach((m) => {
        parsed.push(...parseCampaigns(m.content, m.created_at, m.id));
      });
      setCampaigns(parsed);
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, ParsedCampaign[]> = {};
    campaigns.forEach((c) => {
      (g[c.platform] ||= []).push(c);
    });
    return g;
  }, [campaigns]);

  return (
    <div className="flex flex-col min-h-screen">
      <Tutorial
        id="funnel-v2"
        title="The Funnels view"
        steps={[
          { title: "Your chat as a flowchart", body: "Every campaign you describe to Aurevia in chat appears here grouped by platform — Meta, Google, TikTok, BidMachine, GA4." },
          { title: "What each card shows", body: "Audience, budget, creative format and KPI target — plus the next actions Aurevia recommends to ship it." },
          { title: "How to create more flows", body: "Go back to chat and ask Aurevia to launch a campaign with the CAMPAIGN block. It will appear here automatically." },
        ]}
      />
      <header className="border-b border-brand-border px-5 md:px-10 py-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neon mb-1.5">{t("funnel.tag")}</div>
          <h1 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">{t("funnel.title")}</h1>
          <p className="text-xs md:text-sm text-brand-muted mt-1.5 max-w-2xl">{t("funnel.subtitle")}</p>
        </div>
        <Link to="/dashboard/chat" className="btn-neon-solid text-xs md:text-sm px-4 py-2 inline-flex items-center gap-2 rounded-xl shrink-0">
          <Sparkles className="size-4" /> {t("funnel.cta")}
        </Link>
      </header>

      <div className="flex-1 px-5 md:px-10 py-8">
        {loading ? (
          <div className="text-center py-20 text-brand-muted text-sm">{t("funnel.loading")}</div>
        ) : campaigns.length === 0 ? (
          <div className="border border-dashed border-brand-border rounded-2xl py-16 px-6 text-center max-w-2xl mx-auto">
            <div className="size-14 mx-auto rounded-2xl icon-3d flex items-center justify-center mb-5">
              <GitBranch className="size-6 text-[oklch(0.16_0.01_160)]" />
            </div>
            <h2 className="font-heading text-xl font-medium mb-2">{t("funnel.empty.title")}</h2>
            <p className="text-sm text-brand-muted max-w-md mx-auto mb-6">{t("funnel.empty.desc")}</p>
            <Link to="/dashboard/chat" className="btn-neon text-sm px-4 py-2 inline-flex items-center gap-2 rounded-xl">
              <MessageSquare className="size-4" /> {t("funnel.empty.cta")}
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([platform, items]) => {
              const meta = PLATFORM_META[platform];
              const Icon = meta?.icon ?? Globe;
              return (
                <section key={platform}>
                  {/* Platform node */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`size-12 rounded-2xl bg-gradient-to-br ${meta?.bg ?? "from-neon to-emerald-700"} flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/10`}>
                      <Icon className="size-5 text-white drop-shadow" />
                    </div>
                    <div>
                      <div className="font-heading text-lg font-medium tracking-tight">{platform}</div>
                      <div className="text-[10px] uppercase tracking-widest text-brand-muted">{items.length} {t("funnel.flows")}</div>
                    </div>
                    <div className="hidden md:flex flex-1 items-center gap-1 ml-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-neon/40 to-transparent" />
                      <ArrowRight className="size-3 text-neon/60" />
                    </div>
                  </div>

                  {/* Campaign flow cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {items.map((c) => (
                      <article key={c.id} className="relative p-5 rounded-2xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/40 transition-all overflow-hidden">
                        <div className={`absolute -top-12 -right-12 size-32 rounded-full blur-3xl opacity-25 bg-gradient-to-br ${meta?.bg ?? "from-neon to-emerald-700"}`} />
                        <div className="relative flex items-start justify-between gap-2 mb-4">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-neon mb-1">{c.objective}</div>
                            <h3 className="font-medium text-sm leading-snug">{c.name}</h3>
                          </div>
                          <div className="text-[10px] text-brand-muted shrink-0">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="relative grid grid-cols-2 gap-2.5 mb-3">
                          <Stat icon={Users} label={t("funnel.audience")} value={c.audience} />
                          <Stat icon={Euro} label={t("funnel.budget")} value={c.budget} />
                          <Stat icon={Sparkles} label={t("funnel.creative")} value={c.creative} />
                          <Stat icon={TrendingUp} label={t("funnel.kpi")} value={c.kpi} />
                        </div>

                        {c.nextActions.length > 0 && (
                          <div className="relative pt-3 border-t border-brand-border">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-brand-muted mb-2">
                              <Target className="size-3 text-neon" /> {t("funnel.next")}
                            </div>
                            <ul className="space-y-1">
                              {c.nextActions.map((a, i) => (
                                <li key={i} className="flex items-start gap-2 text-[11px] text-brand-text">
                                  <span className="size-1 mt-1.5 rounded-full bg-neon shadow-[0_0_4px_var(--neon)] shrink-0" />
                                  <span>{a}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-brand-bg/60 ring-1 ring-brand-border">
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-brand-muted mb-1">
        <Icon className="size-2.5 text-neon" /> {label}
      </div>
      <div className="text-[11px] text-brand-text line-clamp-2 leading-snug">{value}</div>
    </div>
  );
}
