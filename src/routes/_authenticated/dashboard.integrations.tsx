import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Aurevia" }] }),
  component: IntegrationsPage,
});

const INTEGRATIONS = [
  {
    id: "meta-ads",
    name: "Meta Ads",
    color: "#1877F2",
    initials: "M",
    desc: { en: "Facebook + Instagram campaigns, audiences and retargeting, piloted by the Ads Agent.", pt: "Campanhas Facebook + Instagram, audiências e retargeting, pilotadas pelo Agente de Ads.", es: "Campañas Facebook + Instagram, audiencias y retargeting, pilotadas por el Agente Ads.", fr: "Campagnes Facebook + Instagram, audiences et retargeting, pilotées par l'Agent Ads.", de: "Facebook + Instagram Kampagnen, Audiences und Retargeting, gesteuert vom Ads-Agenten.", it: "Campagne Facebook + Instagram, audience e retargeting, pilotate dall'Agente Ads." },
    scopes: ["ads_management", "business_management"],
  },
  {
    id: "business-suite",
    name: "Meta Business Suite",
    color: "#0866FF",
    initials: "B",
    desc: { en: "Page inbox, scheduled posts and unified Meta asset library.", pt: "Caixa da página, posts agendados e biblioteca de ativos Meta unificada.", es: "Bandeja de página, posts programados y biblioteca de activos Meta.", fr: "Boîte de réception page, posts planifiés et bibliothèque d'actifs Meta.", de: "Page-Inbox, geplante Posts und einheitliche Meta-Asset-Bibliothek.", it: "Inbox pagina, post programmati e libreria asset Meta unificata." },
    scopes: ["pages_messaging", "pages_manage_posts"],
  },
  {
    id: "google-ads",
    name: "Google Ads",
    color: "#FBBC04",
    initials: "G",
    desc: { en: "Search, Performance Max & YouTube. Bid optimization and keyword expansion every hour.", pt: "Search, Performance Max e YouTube. Otimização de lances e keywords a cada hora.", es: "Search, Performance Max y YouTube. Optimización de pujas y keywords cada hora.", fr: "Search, Performance Max & YouTube. Optimisation des enchères toutes les heures.", de: "Search, Performance Max & YouTube. Gebotsoptimierung und Keyword-Expansion stündlich.", it: "Search, Performance Max e YouTube. Ottimizzazione offerte e keyword ogni ora." },
    scopes: ["adwords"],
  },
  {
    id: "google-analytics",
    name: "Google Analytics 4",
    color: "#E37400",
    initials: "A",
    desc: { en: "Attribution and conversion data piped into every agent for closed-loop optimization.", pt: "Atribuição e conversões alimentadas em cada agente para otimização fechada.", es: "Atribución y conversiones para optimización en circuito cerrado.", fr: "Données d'attribution et de conversion injectées dans chaque agent.", de: "Attribution und Conversion-Daten für jeden Agenten zur Closed-Loop-Optimierung.", it: "Dati di attribuzione e conversione iniettati in ogni agente." },
    scopes: ["analytics.readonly"],
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads",
    color: "#FF0050",
    initials: "T",
    desc: { en: "Spark Ads, Shop ads and UGC creative cycles managed by the Reach Agent.", pt: "Spark Ads, anúncios Shop e ciclos UGC geridos pelo Agente de Alcance.", es: "Spark Ads, anuncios Shop y ciclos UGC gestionados por el Agente Alcance.", fr: "Spark Ads, annonces Shop et cycles UGC gérés par l'Agent Portée.", de: "Spark Ads, Shop-Anzeigen und UGC-Zyklen, verwaltet vom Reach-Agenten.", it: "Spark Ads, annunci Shop e cicli UGC gestiti dall'Agente Reach." },
    scopes: ["tiktok_ads.read", "tiktok_ads.write"],
  },
  {
    id: "bidmachine",
    name: "BidMachine",
    color: "#7C3AED",
    initials: "B",
    desc: { en: "Programmatic in-app and CTV inventory. RTB optimization with cross-network deduplication.", pt: "Inventário programático in-app e CTV. Otimização RTB com deduplicação cross-network.", es: "Inventario programático in-app y CTV. Optimización RTB con deduplicación.", fr: "Inventaire programmatique in-app et CTV. Optimisation RTB.", de: "Programmatisches In-App- und CTV-Inventar. RTB-Optimierung mit Cross-Network-Deduplizierung.", it: "Inventario programmatico in-app e CTV. Ottimizzazione RTB cross-network." },
    scopes: ["bidmachine.read", "bidmachine.write"],
  },
] as const;

function IntegrationsPage() {
  const { t, lang } = useI18n();
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  function toggle(id: string, name: string) {
    if (connected[id]) {
      setConnected((c) => ({ ...c, [id]: false }));
      toast.success(`${name} disconnected`);
    } else {
      setConnected((c) => ({ ...c, [id]: true }));
      toast.success(`${name} ${t("int.connected").toLowerCase()}`);
    }
  }

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-6xl">
      <div className="mb-10">
        <div className="text-[10px] uppercase tracking-widest text-neon mb-3">Connections</div>
        <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">{t("int.title")}</h1>
        <p className="text-sm text-brand-muted mt-3 max-w-2xl">{t("int.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((i) => {
          const isConnected = !!connected[i.id];
          return (
            <div
              key={i.id}
              className={
                "relative overflow-hidden p-6 rounded-2xl bg-brand-surface ring-1 transition-all " +
                (isConnected ? "ring-neon/60 shadow-[0_0_30px_-12px_var(--neon)]" : "ring-brand-border hover:ring-neon/40")
              }
            >
              <div
                className="absolute -top-20 -right-20 size-48 rounded-full blur-3xl pointer-events-none opacity-30"
                style={{ background: i.color }}
              />
              <div className="relative flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="size-11 rounded-xl ring-1 ring-brand-border flex items-center justify-center font-semibold text-sm text-white shrink-0"
                    style={{ background: i.color }}
                  >
                    {i.initials}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{i.name}</div>
                    <div className="text-[10px] uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                      <span className={"size-1.5 rounded-full " + (isConnected ? "bg-neon shadow-[0_0_6px_var(--neon)]" : "bg-brand-muted")} />
                      <span className={isConnected ? "text-neon" : "text-brand-muted"}>
                        {isConnected ? t("int.connected") : t("int.notConnected")}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggle(i.id, i.name)}
                  className={(isConnected ? "btn-dark" : "btn-neon") + " text-xs px-3 py-1.5 inline-flex items-center gap-1.5 shrink-0"}
                >
                  {isConnected ? "Disconnect" : t("int.connect")}
                  {!isConnected && <ExternalLink className="size-3" />}
                  {isConnected && <Check className="size-3" />}
                </button>
              </div>
              <p className="relative text-xs text-brand-muted leading-relaxed mb-4">
                {i.desc[lang] ?? i.desc.en}
              </p>
              <div className="relative flex flex-wrap gap-1.5">
                {i.scopes.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-brand-bg ring-1 ring-brand-border text-brand-muted">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 rounded-2xl bg-brand-surface ring-1 ring-brand-border flex items-start gap-3">
        <Check className="size-4 text-neon mt-0.5 shrink-0" />
        <div className="text-xs text-brand-muted leading-relaxed">
          Tokens are stored encrypted in your Aurevia workspace. Every API call is scoped, rate-limited and audit-logged.
        </div>
      </div>
    </div>
  );
}
