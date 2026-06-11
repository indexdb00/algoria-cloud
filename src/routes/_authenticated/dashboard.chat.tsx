import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useI18n, type LangCode } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { sendAgentMessage } from "@/lib/chat.functions";

import { Tutorial } from "@/components/Tutorial";
import { greetingKey } from "@/lib/avatar";
import {
  Send, Zap, Paperclip, Camera, Mic, MicOff, X, ChevronDown, Check, Sparkles, Bot, Star,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/chat")({
  head: () => ({ meta: [{ title: "Chat — Algoria" }] }),
  component: UnifiedChat,
});

const HINTS: Record<LangCode, string[]> = {
  en: [
    "Ask the agent to find the right algorithm for your exact audience.",
    "Upload a creative — the agent validates it for ad policy in seconds.",
    "Open the Funnel to watch each campaign move from prompt to conversion.",
    "Type 'plan a 3-week reach push, $1,800' and the agent drafts a CAMPAIGN block.",
    "Use Consumo to see credits, campaigns and reach in animated charts.",
    "Connect Meta, Google or TikTok in Integrations — agents read live data.",
    "Voice input works in 6 languages — tap the mic.",
    "Plus model thinks deeper for complex audience targeting.",
    "Every conversation is stored in the sidebar — pick one up anytime.",
  ],
  pt: [
    "Pede ao agente para encontrar o algoritmo certo para o teu público.",
    "Anexa um criativo — o agente valida a política do anúncio em segundos.",
    "Abre o Funil para ver cada campanha do prompt à conversão.",
    "Escreve 'plano de alcance, 3 semanas, $1,800' e recebes um bloco CAMPAIGN.",
    "Vê em Consumo créditos, campanhas e alcance em gráficos animados.",
    "Liga Meta, Google ou TikTok em Integrações — os agentes leem dados ao vivo.",
    "Entrada por voz em 6 idiomas — toca no microfone.",
    "O modelo Plus pensa mais fundo para segmentações complexas.",
    "Cada conversa fica guardada na barra lateral — retomas quando quiseres.",
  ],
  es: [
    "Pide al agente que encuentre el algoritmo correcto para tu audiencia.",
    "Sube un creativo — el agente valida la política del anuncio en segundos.",
    "Abre el Funnel para ver cada campaña del prompt a la conversión.",
    "Escribe 'plan de alcance 3 semanas, $1,800' y recibes un bloque CAMPAIGN.",
    "Mira en Consumo créditos, campañas y alcance en gráficos animados.",
    "Conecta Meta, Google o TikTok en Integraciones.",
    "Entrada por voz en 6 idiomas — toca el micrófono.",
    "El modelo Plus piensa más profundo para audiencias complejas.",
    "Cada conversación queda guardada en la barra lateral.",
  ],
  fr: [
    "Demande à l'agent de trouver l'algorithme exact pour ton audience.",
    "Charge un visuel — l'agent valide la conformité en quelques secondes.",
    "Ouvre le Funnel pour suivre chaque campagne du prompt à la conversion.",
    "Tape 'plan de portée 3 semaines, 1800$' et reçois un bloc CAMPAIGN.",
    "Vois Consumo : crédits, campagnes et portée en graphiques animés.",
    "Connecte Meta, Google ou TikTok dans Intégrations.",
    "Saisie vocale en 6 langues — appuie sur le micro.",
    "Le modèle Plus raisonne plus profondément.",
    "Chaque conversation est sauvegardée dans la barre latérale.",
  ],
  de: [
    "Bitte den Agenten, den richtigen Algorithmus für deine Zielgruppe zu finden.",
    "Lade ein Creative hoch — der Agent prüft die Ad-Policy in Sekunden.",
    "Öffne den Funnel und sieh jede Kampagne vom Prompt bis zur Conversion.",
    "Schreib 'Reichweitenplan 3 Wochen, $1.800' und du bekommst einen CAMPAIGN-Block.",
    "Im Consumo: Credits, Kampagnen und Reichweite in animierten Charts.",
    "Verbinde Meta, Google oder TikTok in den Integrationen.",
    "Spracheingabe in 6 Sprachen — Mikro antippen.",
    "Plus denkt tiefer für komplexe Zielgruppen.",
    "Jede Konversation wird in der Seitenleiste gespeichert.",
  ],
  it: [
    "Chiedi all'agente di trovare l'algoritmo giusto per il tuo pubblico.",
    "Carica un creativo — l'agente verifica la policy in pochi secondi.",
    "Apri il Funnel per vedere ogni campagna dal prompt alla conversione.",
    "Scrivi 'piano reach 3 settimane, $1.800' e ricevi un blocco CAMPAIGN.",
    "Vedi in Consumo crediti, campagne e reach in grafici animati.",
    "Collega Meta, Google o TikTok in Integrazioni.",
    "Voce in 6 lingue — tocca il microfono.",
    "Plus ragiona più a fondo per audience complesse.",
    "Ogni conversazione resta salvata nella barra laterale.",
  ],
};

type Msg = { role: "user" | "assistant"; content: string };
type Variant = "v1" | "v1.1" | "plus";
type Attachment = { dataUrl: string; width: number; height: number; aspect: string };

const VARIANTS: { id: Variant; label: string; desc: string; mult: number; paidOnly: boolean }[] = [
  { id: "v1", label: "Algoria v1.0", desc: "Fast, balanced. 1× credit cost.", mult: 1, paidOnly: false },
  { id: "v1.1", label: "Algoria Thinking v1.1", desc: "Deeper reasoning. 2× credit cost.", mult: 2, paidOnly: false },
  { id: "plus", label: "Algoria Plus", desc: "Premium algorithmic targeting · 3 credits · Plus plan required.", mult: 1.5, paidOnly: true },
];

function aspectLabel(w: number, h: number): string {
  const r = w / h;
  const candidates: [string, number][] = [
    ["1:1", 1], ["4:5", 0.8], ["9:16", 9 / 16], ["16:9", 16 / 9],
    ["1.91:1", 1.91], ["4:3", 4 / 3], ["3:4", 0.75],
  ];
  let best = candidates[0]; let bestDiff = Math.abs(r - best[1]);
  for (const c of candidates) { const d = Math.abs(r - c[1]); if (d < bestDiff) { best = c; bestDiff = d; } }
  return best[0];
}

function UnifiedChat() {
  const { t, lang } = useI18n();
  const send = useServerFn(sendAgentMessage);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [baseCost, setBaseCost] = useState(2);
  const [variant, setVariant] = useState<Variant>("v1");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [recording, setRecording] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [name, setName] = useState("");
  const [hasPlus, setHasPlus] = useState<boolean>(false);
  const [ephemeralStart, setEphemeralStart] = useState<number>(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<unknown>(null);

  const effectiveCost = useMemo(() => {
    const spec = VARIANTS.find((v) => v.id === variant)!;
    return Math.max(1, Math.round(baseCost * spec.mult));
  }, [baseCost, variant]);

  useEffect(() => {
    (async () => {
      const { data: agent } = await supabase.from("agents").select("cost_per_message").eq("slug", "algoria").maybeSingle();
      if (agent?.cost_per_message) setBaseCost(agent.cost_per_message);

      const { data: prof } = await supabase.from("profiles").select("display_name").maybeSingle();
      if (prof?.display_name) setName(prof.display_name);
      else {
        const { data: u } = await supabase.auth.getUser();
        setName((u.user?.email ?? "").split("@")[0]);
      }
      try {
        const p = typeof window !== "undefined" ? localStorage.getItem("algoria.plan") : null;
        setHasPlus(p === "plus" || p === "business" || p === "enterprise");
      } catch { /* ignore */ }

      const match = typeof window !== "undefined" ? window.location.hash.match(/c=([0-9a-f-]+)/i) : null;
      if (match) {
        const id = match[1];
        setConversationId(id);
        const { data: msgs } = await supabase
          .from("messages").select("role,content").eq("conversation_id", id).order("created_at", { ascending: true });
        if (msgs) { setMessages(msgs as Msg[]); setEphemeralStart(0); }
      } else {
        setMessages([]); setConversationId(null); setEphemeralStart(0);
        try {
          const pending = sessionStorage.getItem("algoria.pendingPrompt");
          if (pending) {
            sessionStorage.removeItem("algoria.pendingPrompt");
            setTimeout(() => { void submit(pending); }, 200);
          }
        } catch { /* ignore */ }
      }
    })();

    function onHash() {
      const m = window.location.hash.match(/c=([0-9a-f-]+)/i);
      if (!m) { setMessages([]); setConversationId(null); setEphemeralStart(0); return; }
      const id = m[1];
      setConversationId(id);
      supabase.from("messages").select("role,content").eq("conversation_id", id).order("created_at", { ascending: true })
        .then(({ data }) => { if (data) { setMessages(data as Msg[]); setEphemeralStart(0); } });
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image."); return; }
    if (file.size > 6 * 1024 * 1024) { toast.error("Image must be under 6 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const img = new Image();
      img.onload = () => setAttachment({ dataUrl, width: img.width, height: img.height, aspect: aspectLabel(img.width, img.height) });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function startVoice() {
    const w = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) { toast.error("Voice input not supported."); return; }
    type SR = { lang: string; interimResults: boolean; continuous: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void; onerror: () => void; start: () => void; stop: () => void; };
    const rec = new (Ctor as new () => SR)();
    rec.lang = lang === "pt" ? "pt-PT" : lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : lang === "it" ? "it-IT" : "en-US";
    rec.interimResults = true; rec.continuous = false;
    rec.onresult = (e) => {
      let s = ""; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      setInput(s);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    rec.start(); recognitionRef.current = rec; setRecording(true);
  }
  function stopVoice() { (recognitionRef.current as { stop?: () => void } | null)?.stop?.(); setRecording(false); }

  async function submit(text: string) {
    if ((!text.trim() && !attachment) || sending) return;
    const userPersistText = attachment
      ? `${text}\n\n_[image · ${attachment.width}×${attachment.height} · ${attachment.aspect}]_`
      : text;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userPersistText }]);
    setSending(true);
    const att = attachment;
    setAttachment(null);
    try {
      const res = await send({ data: {
        conversationId: conversationId ?? undefined,
        agentSlug: "algoria",
        message: text || "Please analyse this creative for ad use.",
        language: lang, variant,
        imageDataUrl: att?.dataUrl,
        imageMeta: att ? { width: att.width, height: att.height, aspect: att.aspect } : undefined,
      }});
      if (res.error) { toast.error(res.error); setMessages((m) => m.slice(0, -1)); }
      else {
        if (res.conversationId) {
          setConversationId(res.conversationId);
          if (!conversationId) window.location.hash = `c=${res.conversationId}`;
        }
        setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
      setMessages((m) => m.slice(0, -1));
    } finally { setSending(false); }
  }

  const hints = HINTS[lang] ?? HINTS.en;
  const currentVariant = VARIANTS.find((v) => v.id === variant)!;
  const greet = t(`greet.${greetingKey()}`);
  const visible = messages.slice(ephemeralStart);

  return (
    <div className="flex flex-col h-screen chat-wave-bg relative">
      <div className="hero-orb opacity-30" />
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-10" />
      
      <Tutorial
        id="chat-v2"
        title={t("tut.chat.title")}
        steps={[
          { title: t("tut.chat.s1.title"), body: t("tut.chat.s1.body") },
          { title: t("tut.chat.s2.title"), body: t("tut.chat.s2.body") },
          { title: t("tut.chat.s3.title"), body: t("tut.chat.s3.body") },
          { title: t("tut.chat.s4.title"), body: t("tut.chat.s4.body") },
        ]}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {visible.length === 0 && !sending && (
            <div className="space-y-8 fade-up">
              <div className="neon-card p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/30 mb-6">
                    <Bot className="size-4 text-neon" />
                    <span className="text-xs font-medium text-neon">AI Assistant</span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                    <span className="gradient-text">{greet}</span>
                    {name && (
                      <span className="text-brand-text ml-2">
                        <span className="text-neon">{name}</span>
                      </span>
                    )}
                  </h1>
                  
                  <p className="text-brand-muted text-sm max-w-md mx-auto">
                    Ready to optimize your campaigns with AI-powered insights
                  </p>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="size-4 text-neon" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                    Quick Start Guide
                  </h3>
                </div>
                <RotatingHints hints={hints} />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { icon: Zap, label: "Real-time Analytics" },
                  { icon: Star, label: "Smart Targeting" },
                  { icon: Bot, label: "AI Optimized" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface/50 border border-brand-border text-xs text-brand-muted">
                    <feature.icon className="size-3 text-neon" />
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visible.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          
          {sending && (
            <div className="flex justify-start fade-up">
              <div className="glass-card px-4 py-3 text-sm flex items-center gap-2">
                <div className="size-2 bg-neon rounded-full animate-pulse" />
                <div className="size-2 bg-neon-soft rounded-full animate-pulse delay-75" />
                <div className="size-2 bg-neon-alt rounded-full animate-pulse delay-150" />
                <span className="text-xs text-brand-muted ml-2">{currentVariant.label} thinking…</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-brand-border px-3 md:px-8 py-3 md:py-4 shrink-0 bg-brand-bg/95 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto">
          {attachment && (
            <div className="mb-2 flex items-center gap-2.5 p-2 rounded-xl glass-card">
              <img src={attachment.dataUrl} alt="" className="size-12 rounded-lg object-cover ring-1 ring-neon/30" />
              <div className="text-xs flex-1 min-w-0">
                <div className="font-medium text-neon truncate">Image attached</div>
                <div className="text-brand-muted text-[11px]">{attachment.width}×{attachment.height} · {attachment.aspect}</div>
              </div>
              <button type="button" onClick={() => setAttachment(null)} className="text-brand-muted hover:text-neon p-1 transition-colors">
                <X className="size-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input.trim()); } }}
                rows={1}
                placeholder={attachment ? "Add context (optional)…" : t("dash.messagePlaceholder")}
                className="w-full input-base rounded-2xl min-h-[48px] max-h-40 resize-none"
              />
            </div>
            <button 
              type="button"
              onClick={() => submit(input.trim())}
              disabled={sending || (!input.trim() && !attachment)}
              className="size-12 shrink-0 btn-neon-solid flex items-center justify-center disabled:opacity-40 rounded-2xl transition-transform hover:scale-105 active:scale-95" 
              aria-label={t("dash.send")}
            >
              <Send className="size-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              
              <button type="button" onClick={() => fileInput.current?.click()} className="size-8 rounded-lg btn-dark flex items-center justify-center transition-all hover:scale-105" title="Attach">
                <Paperclip className="size-3.5" />
              </button>
              
              <button type="button" onClick={() => cameraInput.current?.click()} className="size-8 rounded-lg btn-dark flex items-center justify-center transition-all hover:scale-105" title="Camera">
                <Camera className="size-3.5" />
              </button>
              
              <button 
                type="button" 
                onClick={() => (recording ? stopVoice() : startVoice())}
                className={`size-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${recording ? "btn-neon-solid" : "btn-dark"}`} 
                title="Voice"
              >
                {recording ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
              </button>

              <div className="relative ml-1">
                <button 
                  type="button" 
                  onClick={() => setShowModelMenu((v) => !v)}
                  className="btn-dark text-xs px-3 h-8 inline-flex items-center gap-1.5 rounded-lg transition-all hover:scale-105" 
                  title="Model"
                >
                  <Zap className="size-3 text-neon" />
                  <span className="truncate max-w-[120px]">{currentVariant.label}</span>
                  <ChevronDown className="size-3 opacity-60" />
                </button>
                
                {showModelMenu && (
                  <>
                    <button type="button" className="fixed inset-0 z-40" onClick={() => setShowModelMenu(false)} aria-hidden />
                    <div className="absolute bottom-full mb-2 left-0 w-72 z-50 rounded-xl neon-card shadow-2xl p-1.5">
                      {VARIANTS.map((v) => {
                        const active = v.id === variant;
                        const locked = v.paidOnly && !hasPlus;
                        return (
                          <button 
                            key={v.id} 
                            type="button" 
                            disabled={locked} 
                            onClick={() => { if (locked) { toast.error("Plus plan required to use Algoria Plus."); return; } setVariant(v.id); setShowModelMenu(false); }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2 transition-all ${
                              active ? "bg-neon/10 ring-1 ring-neon" : "hover:bg-brand-surface/50"
                            } ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium flex items-center gap-1.5">
                                {v.label}
                                {v.paidOnly && (
                                  <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded ${locked ? "bg-brand-border text-brand-muted" : "bg-neon/20 text-neon"}`}>
                                    {locked ? "🔒 Plus" : "Plus"}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-brand-muted leading-snug mt-0.5">{v.desc}</div>
                            </div>
                            {active && <Check className="size-4 text-neon shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-surface/50 border border-brand-border">
              <Zap className="size-3 text-neon" />
              <span className="text-[10px] font-medium text-brand-muted">
                {effectiveCost} credit{effectiveCost !== 1 ? "s" : ""} / message
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, content }: Msg) {
  const isUser = role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end fade-up">
        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed bg-gradient-to-r from-neon to-neon-soft text-white shadow-lg">
          {content}
        </div>
      </div>
    );
  }
  const rejected = /❌\s*REJECTED/i.test(content);
  return (
    <div className="flex justify-start fade-up">
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed neon-card prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-headings:text-neon prose-strong:text-neon prose-a:text-neon ${
        rejected ? "ring-2 ring-red-400/50" : ""
      }`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

function RotatingHints({ hints }: { hints: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % hints.length), 4200);
    return () => clearInterval(id);
  }, [hints.length]);
  
  return (
    <div className="relative min-h-[80px] flex items-center justify-center">
      {hints.map((h, idx) => (
        <div
          key={idx}
          className="absolute inset-0 flex items-center justify-center transition-all duration-700"
          style={{ 
            opacity: idx === i ? 1 : 0, 
            transform: idx === i ? "translateY(0)" : "translateY(10px)",
            pointerEvents: idx === i ? "auto" : "none" 
          }}
        >
          <p className="text-center text-sm md:text-base text-brand-muted px-4 leading-relaxed">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-neon mr-2 animate-pulse" />
            {h}
          </p>
        </div>
      ))}
    </div>
  );
                    }    "Escreve 'plano de alcance, 3 semanas, $1,800' e recebes um bloco CAMPAIGN.",
    "Vê em Consumo créditos, campanhas e alcance em gráficos animados.",
    "Liga Meta, Google ou TikTok em Integrações — os agentes leem dados ao vivo.",
    "Entrada por voz em 6 idiomas — toca no microfone.",
    "O modelo Plus pensa mais fundo para segmentações complexas.",
    "Cada conversa fica guardada na barra lateral — retomas quando quiseres.",
  ],
  es: [
    "Pide al agente que encuentre el algoritmo correcto para tu audiencia.",
    "Sube un creativo — el agente valida la política del anuncio en segundos.",
    "Abre el Funnel para ver cada campaña del prompt a la conversión.",
    "Escribe 'plan de alcance 3 semanas, $1,800' y recibes un bloque CAMPAIGN.",
    "Mira en Consumo créditos, campañas y alcance en gráficos animados.",
    "Conecta Meta, Google o TikTok en Integraciones.",
    "Entrada por voz en 6 idiomas — toca el micrófono.",
    "El modelo Plus piensa más profundo para audiencias complejas.",
    "Cada conversación queda guardada en la barra lateral.",
  ],
  fr: [
    "Demande à l'agent de trouver l'algorithme exact pour ton audience.",
    "Charge un visuel — l'agent valide la conformité en quelques secondes.",
    "Ouvre le Funnel pour suivre chaque campagne du prompt à la conversion.",
    "Tape 'plan de portée 3 semaines, 1800$' et reçois un bloc CAMPAIGN.",
    "Vois Consumo : crédits, campagnes et portée en graphiques animés.",
    "Connecte Meta, Google ou TikTok dans Intégrations.",
    "Saisie vocale en 6 langues — appuie sur le micro.",
    "Le modèle Plus raisonne plus profondément.",
    "Chaque conversation est sauvegardée dans la barre latérale.",
  ],
  de: [
    "Bitte den Agenten, den richtigen Algorithmus für deine Zielgruppe zu finden.",
    "Lade ein Creative hoch — der Agent prüft die Ad-Policy in Sekunden.",
    "Öffne den Funnel und sieh jede Kampagne vom Prompt bis zur Conversion.",
    "Schreib 'Reichweitenplan 3 Wochen, $1.800' und du bekommst einen CAMPAIGN-Block.",
    "Im Consumo: Credits, Kampagnen und Reichweite in animierten Charts.",
    "Verbinde Meta, Google oder TikTok in den Integrationen.",
    "Spracheingabe in 6 Sprachen — Mikro antippen.",
    "Plus denkt tiefer für komplexe Zielgruppen.",
    "Jede Konversation wird in der Seitenleiste gespeichert.",
  ],
  it: [
    "Chiedi all'agente di trovare l'algoritmo giusto per il tuo pubblico.",
    "Carica un creativo — l'agente verifica la policy in pochi secondi.",
    "Apri il Funnel per vedere ogni campagna dal prompt alla conversione.",
    "Scrivi 'piano reach 3 settimane, $1.800' e ricevi un blocco CAMPAIGN.",
    "Vedi in Consumo crediti, campagne e reach in grafici animati.",
    "Collega Meta, Google o TikTok in Integrazioni.",
    "Voce in 6 lingue — tocca il microfono.",
    "Plus ragiona più a fondo per audience complesse.",
    "Ogni conversazione resta salvata nella barra laterale.",
  ],
};

type Msg = { role: "user" | "assistant"; content: string };
type Variant = "v1" | "v1.1" | "plus";
type Attachment = { dataUrl: string; width: number; height: number; aspect: string };

const VARIANTS: { id: Variant; label: string; desc: string; mult: number; paidOnly: boolean }[] = [
  { id: "v1", label: "Algoria v1.0", desc: "Fast, balanced. 1× credit cost.", mult: 1, paidOnly: false },
  { id: "v1.1", label: "Algoria Thinking v1.1", desc: "Deeper reasoning. 2× credit cost.", mult: 2, paidOnly: false },
  { id: "plus", label: "Algoria Plus", desc: "Premium algorithmic targeting · 3 credits · Plus plan required.", mult: 1.5, paidOnly: true },
];

function aspectLabel(w: number, h: number): string {
  const r = w / h;
  const candidates: [string, number][] = [
    ["1:1", 1], ["4:5", 0.8], ["9:16", 9 / 16], ["16:9", 16 / 9],
    ["1.91:1", 1.91], ["4:3", 4 / 3], ["3:4", 0.75],
  ];
  let best = candidates[0]; let bestDiff = Math.abs(r - best[1]);
  for (const c of candidates) { const d = Math.abs(r - c[1]); if (d < bestDiff) { best = c; bestDiff = d; } }
  return best[0];
}

function UnifiedChat() {
  const { t, lang } = useI18n();
  const send = useServerFn(sendAgentMessage);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [baseCost, setBaseCost] = useState(2);
  const [variant, setVariant] = useState<Variant>("v1");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [recording, setRecording] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [name, setName] = useState("");
  const [hasPlus, setHasPlus] = useState<boolean>(false);
  const [ephemeralStart, setEphemeralStart] = useState<number>(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<unknown>(null);

  const effectiveCost = useMemo(() => {
    const spec = VARIANTS.find((v) => v.id === variant)!;
    return Math.max(1, Math.round(baseCost * spec.mult));
  }, [baseCost, variant]);

  useEffect(() => {
    (async () => {
      const { data: agent } = await supabase.from("agents").select("cost_per_message").eq("slug", "algoria").maybeSingle();
      if (agent?.cost_per_message) setBaseCost(agent.cost_per_message);

      const { data: prof } = await supabase.from("profiles").select("display_name").maybeSingle();
      if (prof?.display_name) setName(prof.display_name);
      else {
      const { data: u } = await supabase.auth.getUser();
        setName((u.user?.email ?? "").split("@")[0]);
      }
      try {
        const p = typeof window !== "undefined" ? localStorage.getItem("algoria.plan") : null;
        setHasPlus(p === "plus" || p === "business" || p === "enterprise");
      } catch { /* ignore */ }

      const match = typeof window !== "undefined" ? window.location.hash.match(/c=([0-9a-f-]+)/i) : null;
      if (match) {
        const id = match[1];
        setConversationId(id);
        const { data: msgs } = await supabase
          .from("messages").select("role,content").eq("conversation_id", id).order("created_at", { ascending: true });
        if (msgs) { setMessages(msgs as Msg[]); setEphemeralStart(0); }
      } else {
        setMessages([]); setConversationId(null); setEphemeralStart(0);
        try {
          const pending = sessionStorage.getItem("algoria.pendingPrompt");
          if (pending) {
            sessionStorage.removeItem("algoria.pendingPrompt");
            setTimeout(() => { void submit(pending); }, 200);
          }
        } catch { /* ignore */ }
      }
    })();

    function onHash() {
      const m = window.location.hash.match(/c=([0-9a-f-]+)/i);
      if (!m) { setMessages([]); setConversationId(null); setEphemeralStart(0); return; }
      const id = m[1];
      setConversationId(id);
      supabase.from("messages").select("role,content").eq("conversation_id", id).order("created_at", { ascending: true })
        .then(({ data }) => { if (data) { setMessages(data as Msg[]); setEphemeralStart(0); } });
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image."); return; }
    if (file.size > 6 * 1024 * 1024) { toast.error("Image must be under 6 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const img = new Image();
      img.onload = () => setAttachment({ dataUrl, width: img.width, height: img.height, aspect: aspectLabel(img.width, img.height) });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function startVoice() {
    const w = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) { toast.error("Voice input not supported."); return; }
    type SR = { lang: string; interimResults: boolean; continuous: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void; onerror: () => void; start: () => void; stop: () => void; };
    const rec = new (Ctor as new () => SR)();
    rec.lang = lang === "pt" ? "pt-PT" : lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : lang === "it" ? "it-IT" : "en-US";
    rec.interimResults = true; rec.continuous = false;
    rec.onresult = (e) => {
      let s = ""; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      setInput(s);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    rec.start(); recognitionRef.current = rec; setRecording(true);
  }
  function stopVoice() { (recognitionRef.current as { stop?: () => void } | null)?.stop?.(); setRecording(false); }

  async function submit(text: string) {
    if ((!text.trim() && !attachment) || sending) return;
    const userPersistText = attachment
      ? `${text}\n\n_[image · ${attachment.width}×${attachment.height} · ${attachment.aspect}]_`
      : text;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userPersistText }]);
    setSending(true);
    const att = attachment;
    setAttachment(null);
    try {
      const res = await send({ data: {
        conversationId: conversationId ?? undefined,
        agentSlug: "algoria",
        message: text || "Please analyse this creative for ad use.",
        language: lang, variant,
        imageDataUrl: att?.dataUrl,
        imageMeta: att ? { width: att.width, height: att.height, aspect: att.aspect } : undefined,
      }});
      if (res.error) { toast.error(res.error); setMessages((m) => m.slice(0, -1)); }
      else {
        if (res.conversationId) {
          setConversationId(res.conversationId);
          if (!conversationId) window.location.hash = `c=${res.conversationId}`;
        }
        setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
      setMessages((m) => m.slice(0, -1));
    } finally { setSending(false); }
  }

  const hints = HINTS[lang] ?? HINTS.en;
  const currentVariant = VARIANTS.find((v) => v.id === variant)!;
  const greet = t(`greet.${greetingKey()}`);
  const visible = messages.slice(ephemeralStart);

  return (
    <div className="flex flex-col h-screen chat-wave-bg relative">
      {/* Elementos decorativos de fundo */}
      <div className="hero-orb opacity-30" />
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-10" />
      
      <Tutorial
        id="chat-v2"
        title={t("tut.chat.title")}
        steps={[
          { title: t("tut.chat.s1.title"), body: t("tut.chat.s1.body") },
          { title: t("tut.chat.s2.title"), body: t("tut.chat.s2.body") },
          { title: t("tut.chat.s3.title"), body: t("tut.chat.s3.body") },
          { title: t("tut.chat.s4.title"), body: t("tut.chat.s4.body") },
        ]}
      />

      {/* Scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {visible.length === 0 && !sending && (
            <div className="space-y-8 fade-up">
              {/* Saudação melhorada com card neon */}
              <div className="neon-card p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/30 mb-6">
                    <Bot className="size-4 text-neon" />
                    <span className="text-xs font-medium text-neon">AI Assistant</span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                    <span className="gradient-text">{greet}</span>
                    {name && (
                      <span className="text-brand-text ml-2">
                        <span className="text-neon">{name}</span>
                      </span>
                    )}
                    <span className="inline-block animate-wave ml-1">👋</span>
                  </h1>
                  
                  <p className="text-brand-muted text-sm max-w-md mx-auto">
                    Ready to optimize your campaigns with AI-powered insights
                  </p>
                </div>
              </div>

              {/* Hints rotativos melhorados */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="size-4 text-neon" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                    Quick Start Guide
                  </h3>
                </div>
                <RotatingHints hints={hints} />
              </div>

              {/* Badges de features */}
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { icon: Zap, label: "Real-time Analytics" },
                  { icon: Star, label: "Smart Targeting" },
                  { icon: Bot, label: "AI Optimized" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface/50 border border-brand-border text-xs text-brand-muted">
                    <feature.icon className="size-3 text-neon" />
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visible.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          
          {sending && (
            <div className="flex justify-start fade-up">
              <div className="glass-card px-4 py-3 text-sm flex items-center gap-2">
                <div className="size-2 bg-neon rounded-full animate-pulse" />
                <div className="size-2 bg-neon-soft rounded-full animate-pulse delay-75" />
                <div className="size-2 bg-neon-alt rounded-full animate-pulse delay-150" />
                <span className="text-xs text-brand-muted ml-2">{currentVariant.label} thinking…</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer melhorado */}
      <div className="border-t border-brand-border px-3 md:px-8 py-3 md:py-4 shrink-0 bg-brand-bg/95 backdrop-blur-lg">
        <div className="max-w-3xl mx-auto">
          {attachment && (
            <div className="mb-2 flex items-center gap-2.5 p-2 rounded-xl glass-card">
              <img src={attachment.dataUrl} alt="" className="size-12 rounded-lg object-cover ring-1 ring-neon/30" />
              <div className="text-xs flex-1 min-w-0">
                <div className="font-medium text-neon truncate">Image attached</div>
                <div className="text-brand-muted text-[11px]">{attachment.width}×{attachment.height} · {attachment.aspect}</div>
              </div>
              <button type="button" onClick={() => setAttachment(null)} className="text-brand-muted hover:text-neon p-1 transition-colors">
                <X className="size-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input.trim()); } }}
                rows={1}
                placeholder={attachment ? "Add context (optional)…" : t("dash.messagePlaceholder")}
                className="w-full input-base rounded-2xl min-h-[48px] max-h-40 resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={sending || (!input.trim() && !attachment)}
              className="size-12 shrink-0 btn-neon-solid flex items-center justify-center disabled:opacity-40 rounded-2xl transition-transform hover:scale-105 active:scale-95" 
              aria-label={t("dash.send")}
            >
              <Send className="size-4" />
            </button>
          </div>

          {/* Controls under input */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              
              <button type="button" onClick={() => fileInput.current?.click()} className="size-8 rounded-lg btn-dark flex items-center justify-center transition-all hover:scale-105" title="Attach">
                <Paperclip className="size-3.5" />
              </button>
              
              <button type="button" onClick={() => cameraInput.current?.click()} className="size-8 rounded-lg btn-dark flex items-center justify-center transition-all hover:scale-105" title="Camera">
                <Camera className="size-3.5" />
              </button>
              
              <button 
                type="button" 
                onClick={() => (recording ? stopVoice() : startVoice())}
                className={`size-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${recording ? "btn-neon-solid" : "btn-dark"}`} 
                title="Voice"
              >
                {recording ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
              </button>

              <div className="relative ml-1">
                <button 
                  type="button" 
                  onClick={() => setShowModelMenu((v) => !v)}
                  className="btn-dark text-xs px-3 h-8 inline-flex items-center gap-1.5 rounded-lg transition-all hover:scale-105" 
                  title="Model"
                >
                  <Zap className="size-3 text-neon" />
                  <span className="truncate max-w-[120px]">{currentVariant.label}</span>
                  <ChevronDown className="size-3 opacity-60" />
                </button>
                
                {showModelMenu && (
                  <>
                    <button type="button" className="fixed inset-0 z-40" onClick={() => setShowModelMenu(false)} aria-hidden />
                    <div className="absolute bottom-full mb-2 left-0 w-72 z-50 rounded-xl neon-card shadow-2xl p-1.5 animate-fade-up">
                      {VARIANTS.map((v) => {
                        const active = v.id === variant;
                        const locked = v.paidOnly && !hasPlus;
                        return (
                          <button 
                            key={v.id} 
                            type="button" 
                            disabled={locked} 
                            onClick={() => { if (locked) { toast.error("Plus plan required to use Algoria Plus."); return; } setVariant(v.id); setShowModelMenu(false); }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2 transition-all ${
                              active ? "bg-neon/10 ring-1 ring-neon" : "hover:bg-brand-surface/50"
                            } ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium flex items-center gap-1.5">
                                {v.label}
                                {v.paidOnly && (
                                  <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded ${locked ? "bg-brand-border text-brand-muted" : "bg-neon/20 text-neon"}`}>
                                    {locked ? "🔒 Plus" : "Plus"}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-brand-muted leading-snug mt-0.5">{v.desc}</div>
                            </div>
                            {active && <Check className="size-4 text-neon shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-surface/50 border border-brand-border">
              <Zap className="size-3 text-neon" />
              <span className="text-[10px] font-medium text-brand-muted">
                {effectiveCost} credit{effectiveCost !== 1 ? "s" : ""} / message
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, content }: Msg) {
  const isUser = role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end fade-up">
        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed bg-gradient-to-r from-neon to-neon-soft text-white shadow-lg">
          {content}
        </div>
      </div>
    );
  }
  const rejected = /❌\s*REJECTED/i.test(content);
  return (
    <div className="flex justify-start fade-up">
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed neon-card prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-headings:text-neon prose-strong:text-neon prose-a:text-neon ${
        rejected ? "ring-2 ring-red-400/50" : ""
      }`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

function RotatingHints({ hints }: { hints: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % hints.length), 4200);
    return () => clearInterval(id);
  }, [hints.length]);
  
  return (
    <div className="relative min-h-[80px] flex items-center justify-center">
      {hints.map((h, idx) => (
        <div
          key={idx}
          className="absolute inset-0 flex items-center justify-center transition-all duration-700"
          style={{ 
            opacity: idx === i ? 1 : 0, 
            transform: idx === i ? "translateY(0)" : "translateY(10px)",
            pointerEvents: idx === i ? "auto" : "none" 
          }}
        >
          <p className="text-center text-sm md:text-base text-brand-muted px-4 leading-relaxed">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-neon mr-2 animate-pulse" />
            {h}
          </p>
        </div>
      ))}
    </div>
  );
}

// Adicione esta keyframe animation no seu CSS global
// @keyframes wave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(20deg); } 75% { transform: rotate(-10deg); } }
// .animate-wave { animation: wave 0.6s ease-in-out infinite; display: inline-block; }    "Le modèle Plus raisonne plus profondément.",
    "Chaque conversation est sauvegardée dans la barre latérale.",
  ],
  de: [
    "Bitte den Agenten, den richtigen Algorithmus für deine Zielgruppe zu finden.",
    "Lade ein Creative hoch — der Agent prüft die Ad-Policy in Sekunden.",
    "Öffne den Funnel und sieh jede Kampagne vom Prompt bis zur Conversion.",
    "Schreib 'Reichweitenplan 3 Wochen, $1.800' und du bekommst einen CAMPAIGN-Block.",
    "Im Consumo: Credits, Kampagnen und Reichweite in animierten Charts.",
    "Verbinde Meta, Google oder TikTok in den Integrationen.",
    "Spracheingabe in 6 Sprachen — Mikro antippen.",
    "Plus denkt tiefer für komplexe Zielgruppen.",
    "Jede Konversation wird in der Seitenleiste gespeichert.",
  ],
  it: [
    "Chiedi all'agente di trovare l'algoritmo giusto per il tuo pubblico.",
    "Carica un creativo — l'agente verifica la policy in pochi secondi.",
    "Apri il Funnel per vedere ogni campagna dal prompt alla conversione.",
    "Scrivi 'piano reach 3 settimane, $1.800' e ricevi un blocco CAMPAIGN.",
    "Vedi in Consumo crediti, campagne e reach in grafici animati.",
    "Collega Meta, Google o TikTok in Integrazioni.",
    "Voce in 6 lingue — tocca il microfono.",
    "Plus ragiona più a fondo per audience complesse.",
    "Ogni conversazione resta salvata nella barra laterale.",
  ],
};

type Msg = { role: "user" | "assistant"; content: string };
type Variant = "v1" | "v1.1" | "plus";
type Attachment = { dataUrl: string; width: number; height: number; aspect: string };

const VARIANTS: { id: Variant; label: string; desc: string; mult: number; paidOnly: boolean }[] = [
  { id: "v1", label: "Algoria v1.0", desc: "Fast, balanced. 1× credit cost.", mult: 1, paidOnly: false },
  { id: "v1.1", label: "Algoria Thinking v1.1", desc: "Deeper reasoning. 2× credit cost.", mult: 2, paidOnly: false },
  { id: "plus", label: "Algoria Plus", desc: "Premium algorithmic targeting · 3 credits · Plus plan required.", mult: 1.5, paidOnly: true },
];

function aspectLabel(w: number, h: number): string {
  const r = w / h;
  const candidates: [string, number][] = [
    ["1:1", 1], ["4:5", 0.8], ["9:16", 9 / 16], ["16:9", 16 / 9],
    ["1.91:1", 1.91], ["4:3", 4 / 3], ["3:4", 0.75],
  ];
  let best = candidates[0]; let bestDiff = Math.abs(r - best[1]);
  for (const c of candidates) { const d = Math.abs(r - c[1]); if (d < bestDiff) { best = c; bestDiff = d; } }
  return best[0];
}

function UnifiedChat() {
  const { t, lang } = useI18n();
  const send = useServerFn(sendAgentMessage);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [baseCost, setBaseCost] = useState(2);
  const [variant, setVariant] = useState<Variant>("v1");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [recording, setRecording] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [name, setName] = useState("");
  const [hasPlus, setHasPlus] = useState<boolean>(false);
  // ephemeral display — only show messages since this composer was opened
  const [ephemeralStart, setEphemeralStart] = useState<number>(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<unknown>(null);

  const effectiveCost = useMemo(() => {
    const spec = VARIANTS.find((v) => v.id === variant)!;
    return Math.max(1, Math.round(baseCost * spec.mult));
  }, [baseCost, variant]);

  // load conversation from URL hash (#c=<uuid>) if present
  useEffect(() => {
    (async () => {
      const { data: agent } = await supabase.from("agents").select("cost_per_message").eq("slug", "algoria").maybeSingle();
      if (agent?.cost_per_message) setBaseCost(agent.cost_per_message);

      const { data: prof } = await supabase.from("profiles").select("display_name").maybeSingle();
      if (prof?.display_name) setName(prof.display_name);
      else {
      const { data: u } = await supabase.auth.getUser();
        setName((u.user?.email ?? "").split("@")[0]);
      }
      try {
        const p = typeof window !== "undefined" ? localStorage.getItem("algoria.plan") : null;
        setHasPlus(p === "plus" || p === "business" || p === "enterprise");
      } catch { /* ignore */ }

      const match = typeof window !== "undefined" ? window.location.hash.match(/c=([0-9a-f-]+)/i) : null;
      if (match) {
        const id = match[1];
        setConversationId(id);
        const { data: msgs } = await supabase
          .from("messages").select("role,content").eq("conversation_id", id).order("created_at", { ascending: true });
        if (msgs) { setMessages(msgs as Msg[]); setEphemeralStart(0); }
      } else {
        setMessages([]); setConversationId(null); setEphemeralStart(0);
        // Auto-send pending prompt from landing page
        try {
          const pending = sessionStorage.getItem("algoria.pendingPrompt");
          if (pending) {
            sessionStorage.removeItem("algoria.pendingPrompt");
            setTimeout(() => { void submit(pending); }, 200);
          }
        } catch { /* ignore */ }
      }
    })();

    function onHash() {
      const m = window.location.hash.match(/c=([0-9a-f-]+)/i);
      if (!m) { setMessages([]); setConversationId(null); setEphemeralStart(0); return; }
      const id = m[1];
      setConversationId(id);
      supabase.from("messages").select("role,content").eq("conversation_id", id).order("created_at", { ascending: true })
        .then(({ data }) => { if (data) { setMessages(data as Msg[]); setEphemeralStart(0); } });
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image."); return; }
    if (file.size > 6 * 1024 * 1024) { toast.error("Image must be under 6 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const img = new Image();
      img.onload = () => setAttachment({ dataUrl, width: img.width, height: img.height, aspect: aspectLabel(img.width, img.height) });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function startVoice() {
    const w = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) { toast.error("Voice input not supported."); return; }
    type SR = { lang: string; interimResults: boolean; continuous: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void; onerror: () => void; start: () => void; stop: () => void; };
    const rec = new (Ctor as new () => SR)();
    rec.lang = lang === "pt" ? "pt-PT" : lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : lang === "it" ? "it-IT" : "en-US";
    rec.interimResults = true; rec.continuous = false;
    rec.onresult = (e) => {
      let s = ""; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      setInput(s);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    rec.start(); recognitionRef.current = rec; setRecording(true);
  }
  function stopVoice() { (recognitionRef.current as { stop?: () => void } | null)?.stop?.(); setRecording(false); }

  async function submit(text: string) {
    if ((!text.trim() && !attachment) || sending) return;
    const userPersistText = attachment
      ? `${text}\n\n_[image · ${attachment.width}×${attachment.height} · ${attachment.aspect}]_`
      : text;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userPersistText }]);
    setSending(true);
    const att = attachment;
    setAttachment(null);
    try {
      const res = await send({ data: {
        conversationId: conversationId ?? undefined,
        agentSlug: "algoria",
        message: text || "Please analyse this creative for ad use.",
        language: lang, variant,
        imageDataUrl: att?.dataUrl,
        imageMeta: att ? { width: att.width, height: att.height, aspect: att.aspect } : undefined,
      }});
      if (res.error) { toast.error(res.error); setMessages((m) => m.slice(0, -1)); }
      else {
        if (res.conversationId) {
          setConversationId(res.conversationId);
          if (!conversationId) window.location.hash = `c=${res.conversationId}`;
        }
        setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
      setMessages((m) => m.slice(0, -1));
    } finally { setSending(false); }
  }

  const hints = HINTS[lang] ?? HINTS.en;
  const currentVariant = VARIANTS.find((v) => v.id === variant)!;
  const greet = t(`greet.${greetingKey()}`);
  const visible = messages.slice(ephemeralStart);

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] md:h-screen chat-wave-bg">
      <Tutorial
        id="chat-v2"
        title={t("tut.chat.title")}
        steps={[
          { title: t("tut.chat.s1.title"), body: t("tut.chat.s1.body") },
          { title: t("tut.chat.s2.title"), body: t("tut.chat.s2.body") },
          { title: t("tut.chat.s3.title"), body: t("tut.chat.s3.body") },
          { title: t("tut.chat.s4.title"), body: t("tut.chat.s4.body") },
        ]}
      />

      {/* Scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {visible.length === 0 && !sending && (
            <div className="space-y-6 fade-up">
              <div className="text-center py-8">
                <h2 className="text-xl md:text-2xl font-medium tracking-tight text-brand-muted">
                  {greet}{name ? ", " : ""}<span className="text-neon">{name}</span>.
                </h2>
              </div>

              <RotatingHints hints={hints} />
            </div>
          )}


          {visible.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {sending && (
            <div className="flex justify-start fade-up">
              <div className="bg-brand-surface ring-1 ring-brand-border rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                <Zap className="size-3 text-neon animate-pulse" />
                <span className="text-xs text-brand-muted">{currentVariant.label} thinking…</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <form onSubmit={(e) => { e.preventDefault(); submit(input.trim()); }} className="border-t border-brand-border px-3 md:px-8 py-3 md:py-4 shrink-0 bg-brand-bg/80 backdrop-blur">
        <div className="max-w-3xl mx-auto">
          {attachment && (
            <div className="mb-2 flex items-center gap-2.5 p-2 rounded-xl bg-brand-surface ring-1 ring-brand-border">
              <img src={attachment.dataUrl} alt="" className="size-12 rounded-lg object-cover" />
              <div className="text-xs flex-1 min-w-0">
                <div className="font-medium truncate">Image attached</div>
                <div className="text-brand-muted text-[11px]">{attachment.width}×{attachment.height} · {attachment.aspect}</div>
              </div>
              <button type="button" onClick={() => setAttachment(null)} className="text-brand-muted hover:text-neon p-1"><X className="size-4" /></button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input.trim()); } }}
              rows={1}
              placeholder={attachment ? "Add context (optional)…" : t("dash.messagePlaceholder")}
              className="flex-1 bg-brand-surface ring-1 ring-brand-border rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-neon transition-colors min-h-[48px] max-h-40"
            />
            <button type="submit" disabled={sending || (!input.trim() && !attachment)}
              className="size-12 shrink-0 btn-neon-solid flex items-center justify-center disabled:opacity-40 rounded-2xl" aria-label={t("dash.send")}>
              <Send className="size-4" />
            </button>
          </div>

          {/* Controls under input */}
          <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              <button type="button" onClick={() => fileInput.current?.click()} className="size-9 rounded-lg btn-dark flex items-center justify-center" title="Attach"><Paperclip className="size-4" /></button>
              <button type="button" onClick={() => cameraInput.current?.click()} className="size-9 rounded-lg btn-dark flex items-center justify-center" title="Camera"><Camera className="size-4" /></button>
              <button type="button" onClick={() => (recording ? stopVoice() : startVoice())}
                className={"size-9 rounded-lg flex items-center justify-center " + (recording ? "btn-neon-solid" : "btn-dark")} title="Voice">
                {recording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>

              <div className="relative ml-1">
                <button type="button" onClick={() => setShowModelMenu((v) => !v)}
                  className="btn-dark text-xs px-2.5 h-9 inline-flex items-center gap-1.5" title="Model">
                  <Zap className="size-3 text-neon" />
                  <span className="truncate max-w-[120px]">{currentVariant.label}</span>
                  <ChevronDown className="size-3 opacity-60" />
                </button>
                {showModelMenu && (
                  <>
                    <button type="button" className="fixed inset-0 z-40" onClick={() => setShowModelMenu(false)} aria-hidden />
                    <div className="absolute bottom-full mb-1.5 left-0 w-72 z-50 rounded-xl bg-brand-surface ring-1 ring-brand-border shadow-2xl shadow-black/40 p-1.5">
                      {VARIANTS.map((v) => {
                        const active = v.id === variant;
                        const locked = v.paidOnly && !hasPlus;
                        return (
                          <button key={v.id} type="button" disabled={locked} onClick={() => { if (locked) { toast.error(t("plus.locked") || "Plus plan required to use Algoria Plus."); return; } setVariant(v.id); setShowModelMenu(false); }}
                            className={"w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2 " + (active ? "bg-brand-bg ring-1 ring-neon/40" : "hover:bg-brand-bg/60") + (locked ? " opacity-60 cursor-not-allowed" : "")}>
                            <div className="flex-1">
                              <div className="text-sm font-medium flex items-center gap-1.5">
                                {v.label}
                                {v.paidOnly && <span className="text-[9px] uppercase tracking-widest text-neon px-1.5 py-0.5 rounded bg-neon/10 ring-1 ring-neon/30">{locked ? "🔒 Plus" : "Plus"}</span>}
                              </div>
                              <div className="text-[11px] text-brand-muted leading-snug mt-0.5">{v.desc}</div>
                            </div>
                            {active && <Check className="size-4 text-neon shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-[10px] text-brand-muted">
              {effectiveCost} {t("dash.credits.unit")} / {t("chat.perMessage")}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Bubble({ role, content }: Msg) {
  const isUser = role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end fade-up">
        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed bg-neon" style={{ color: "var(--primary-foreground)" }}>
          {content}
        </div>
      </div>
    );
  }
  const rejected = /❌\s*REJECTED/i.test(content);
  return (
    <div className="flex justify-start fade-up">
      <div className={
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-brand-surface text-brand-text ring-1 prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-headings:text-neon prose-strong:text-neon prose-a:text-neon " +
        (rejected ? "ring-red-400/50" : "ring-brand-border")
      }>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

function RotatingHints({ hints }: { hints: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % hints.length), 4200);
    return () => clearInterval(id);
  }, [hints.length]);
  return (
    <div className="relative min-h-[64px] flex items-center justify-center">
      {hints.map((h, idx) => (
        <p
          key={idx}
          className="absolute inset-0 flex items-center justify-center text-center text-sm md:text-base text-brand-muted px-4 transition-opacity duration-1000"
          style={{ opacity: idx === i ? 1 : 0, pointerEvents: idx === i ? "auto" : "none" }}
        >
          <span className="text-neon mr-2">◆</span>{h}
        </p>
      ))}
    </div>
  );
}
