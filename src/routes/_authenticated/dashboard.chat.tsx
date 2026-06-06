import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useI18n, type LangCode } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { sendAgentMessage } from "@/lib/chat.functions";
import {
  Send, Sparkles, Activity, GitBranch, Plug, Zap, MessageSquarePlus,
  Paperclip, Camera, Mic, MicOff, X, ChevronDown, User, Building2, ShieldCheck, LogOut,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { LgpdModal } from "@/components/LgpdModal";

export const Route = createFileRoute("/_authenticated/dashboard/chat")({
  head: () => ({ meta: [{ title: "Chat — Aurevia" }] }),
  component: UnifiedChat,
});

const PRESETS: Record<LangCode, { label: string; prompt: string }[]> = {
  en: [
    { label: "Launch Meta Ads", prompt: "Launch a Meta Ads campaign for my product, €25/day, target European founders aged 28–45 interested in B2B SaaS. Use the CAMPAIGN block format." },
    { label: "Score my leads", prompt: "Score my last 50 leads by buying intent and tell me which to call first." },
    { label: "Audit brand voice", prompt: "Audit my current brand voice in 3 bullets and suggest tone fixes." },
    { label: "3h performance pulse", prompt: "Give me a 3-hour performance pulse across every connected channel." },
    { label: "TikTok reach plan", prompt: "Plan a 2-week TikTok Ads reach push for Spain + Italy. Use the CAMPAIGN block format." },
    { label: "Google Ads search", prompt: "Set up a Google Ads search campaign for my SaaS demo, €40/day, DACH. Use the CAMPAIGN block format." },
  ],
  pt: [
    { label: "Lançar Meta Ads", prompt: "Lança uma campanha Meta Ads para o meu produto, €25/dia, público de founders europeus 28–45 interessados em SaaS B2B. Usa o formato CAMPAIGN." },
    { label: "Pontuar leads", prompt: "Pontua os meus últimos 50 leads por intenção de compra e diz quais ligar primeiro." },
    { label: "Auditar marca", prompt: "Audita o meu tom de marca em 3 pontos e sugere ajustes." },
    { label: "Pulso de 3h", prompt: "Dá-me o pulso de performance das últimas 3h em cada canal conectado." },
    { label: "TikTok alcance", prompt: "Planeia 2 semanas de TikTok Ads para alcance em Espanha + Itália. Formato CAMPAIGN." },
    { label: "Google Search", prompt: "Cria uma campanha Google Ads de search para demo SaaS, €40/dia, DACH. Formato CAMPAIGN." },
  ],
  es: [
    { label: "Lanzar Meta Ads", prompt: "Lanza una campaña Meta Ads, €25/día, founders europeos 28–45 interesados en SaaS B2B. Usa el formato CAMPAIGN." },
    { label: "Puntuar leads", prompt: "Puntúa mis últimos 50 leads por intención y dime a cuáles llamar primero." },
    { label: "Auditar marca", prompt: "Audita mi tono de marca en 3 puntos." },
    { label: "Pulso 3h", prompt: "Dame el pulso de 3h en cada canal conectado." },
    { label: "TikTok", prompt: "Plan TikTok Ads 2 semanas en España + Italia. Formato CAMPAIGN." },
    { label: "Google", prompt: "Campaña Google Ads search, €40/día, DACH. Formato CAMPAIGN." },
  ],
  fr: [
    { label: "Lancer Meta Ads", prompt: "Lance une campagne Meta Ads, 25€/jour, fondateurs européens 28–45 SaaS B2B. Format CAMPAIGN." },
    { label: "Scorer leads", prompt: "Score mes 50 derniers leads par intention." },
    { label: "Audit marque", prompt: "Audite ma voix de marque en 3 points." },
    { label: "Pulse 3h", prompt: "Pulse de performance 3h sur chaque canal." },
    { label: "TikTok", prompt: "Plan TikTok Ads 2 semaines Espagne + Italie. Format CAMPAIGN." },
    { label: "Google", prompt: "Campagne Google Ads search 40€/jour DACH. Format CAMPAIGN." },
  ],
  de: [
    { label: "Meta Ads starten", prompt: "Starte eine Meta Ads Kampagne, €25/Tag, europäische Founder 28–45, B2B SaaS. CAMPAIGN-Format." },
    { label: "Leads bewerten", prompt: "Bewerte meine letzten 50 Leads nach Kaufabsicht." },
    { label: "Marken-Audit", prompt: "Audit meiner Markenstimme in 3 Punkten." },
    { label: "3h Puls", prompt: "Gib mir den 3h Puls pro Kanal." },
    { label: "TikTok", prompt: "2-Wochen TikTok Ads Plan ES + IT. CAMPAIGN-Format." },
    { label: "Google", prompt: "Google Ads Search Kampagne €40/Tag DACH. CAMPAIGN-Format." },
  ],
  it: [
    { label: "Lancia Meta Ads", prompt: "Lancia una campagna Meta Ads, €25/giorno, founder europei 28–45 B2B SaaS. Formato CAMPAIGN." },
    { label: "Score lead", prompt: "Valuta i miei ultimi 50 lead per intent." },
    { label: "Audit brand", prompt: "Audit della mia voce di brand in 3 punti." },
    { label: "Pulse 3h", prompt: "Pulse di 3h per canale." },
    { label: "TikTok", prompt: "Piano TikTok Ads 2 settimane ES + IT. Formato CAMPAIGN." },
    { label: "Google", prompt: "Campagna Google Ads search €40/giorno DACH. Formato CAMPAIGN." },
  ],
};

type Msg = { role: "user" | "assistant"; content: string };
type Variant = "v1" | "v1.1" | "plus";
type Attachment = { dataUrl: string; width: number; height: number; aspect: string };

const VARIANTS: { id: Variant; label: string; desc: string; mult: number; paidOnly: boolean }[] = [
  { id: "v1", label: "Aurevia v1.0", desc: "Fast, balanced. 1× credit cost.", mult: 1, paidOnly: false },
  { id: "v1.1", label: "Aurevia Thinking v1.1", desc: "Deeper reasoning. 2× credit cost.", mult: 2, paidOnly: false },
  { id: "plus", label: "Aurevia Plus", desc: "Thinking quality at half the cost. Paid plans only.", mult: 1, paidOnly: true },
];

function aspectLabel(w: number, h: number): string {
  const r = w / h;
  const candidates: [string, number][] = [
    ["1:1", 1], ["4:5", 0.8], ["9:16", 9 / 16], ["16:9", 16 / 9],
    ["1.91:1", 1.91], ["4:3", 4 / 3], ["3:4", 0.75],
  ];
  let best = candidates[0];
  let bestDiff = Math.abs(r - best[1]);
  for (const c of candidates) {
    const d = Math.abs(r - c[1]);
    if (d < bestDiff) { best = c; bestDiff = d; }
  }
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
  const [showProfile, setShowProfile] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [profile, setProfile] = useState<{ email: string; name: string; company: string }>({ email: "", name: "", company: "" });

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
      const { data: agent } = await supabase.from("agents").select("cost_per_message").eq("slug", "aurevia").maybeSingle();
      if (agent?.cost_per_message) setBaseCost(agent.cost_per_message);

      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email ?? "";
      const { data: prof } = await supabase.from("profiles").select("display_name").maybeSingle();
      const storedCompany = (typeof window !== "undefined" && localStorage.getItem("aurevia.company")) || "";
      setProfile({ email, name: prof?.display_name ?? email.split("@")[0], company: storedCompany });

      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("agent_slug", "aurevia")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (conv?.id) {
        setConversationId(conv.id);
        const { data: msgs } = await supabase
          .from("messages")
          .select("role,content")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });
        if (msgs) setMessages(msgs as Msg[]);
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Image must be under 6 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const img = new Image();
      img.onload = () => {
        setAttachment({ dataUrl, width: img.width, height: img.height, aspect: aspectLabel(img.width, img.height) });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function startVoice() {
    const w = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      toast.error("Voice input not supported in this browser.");
      return;
    }
    type SR = {
      lang: string; interimResults: boolean; continuous: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void; onerror: () => void; start: () => void; stop: () => void;
    };
    const rec = new (Ctor as new () => SR)();
    rec.lang = lang === "pt" ? "pt-PT" : lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : lang === "de" ? "de-DE" : lang === "it" ? "it-IT" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let s = "";
      for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      setInput(s);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setRecording(true);
  }
  function stopVoice() {
    const rec = recognitionRef.current as { stop?: () => void } | null;
    rec?.stop?.();
    setRecording(false);
  }

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
      const res = await send({
        data: {
          conversationId: conversationId ?? undefined,
          agentSlug: "aurevia",
          message: text || "Please analyse this creative for ad use.",
          language: lang,
          variant,
          imageDataUrl: att?.dataUrl,
          imageMeta: att ? { width: att.width, height: att.height, aspect: att.aspect } : undefined,
        },
      });
      if (res.error) {
        toast.error(res.error);
        setMessages((m) => m.slice(0, -1));
      } else {
        if (res.conversationId) setConversationId(res.conversationId);
        setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  function newConversation() {
    setConversationId(null);
    setMessages([]);
    setAttachment(null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function saveCompany(name: string) {
    setProfile((p) => ({ ...p, company: name }));
    try { localStorage.setItem("aurevia.company", name); } catch { /* ignore */ }
  }

  const presets = PRESETS[lang] ?? PRESETS.en;
  const currentVariant = VARIANTS.find((v) => v.id === variant)!;

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-4rem)] md:h-screen">
      <header className="h-14 md:h-16 border-b border-brand-border px-3 md:px-8 flex items-center gap-2 md:gap-3 shrink-0">
        <div className="size-9 rounded-xl flex items-center justify-center icon-3d shrink-0">
          <Sparkles className="size-4 text-[oklch(0.16_0.01_160)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">Aurevia</div>
          <div className="text-[10px] uppercase tracking-widest text-brand-muted">
            {t("dash.cost")} {effectiveCost} {t("dash.credits.unit")}
          </div>
        </div>

        {/* Model selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelMenu((v) => !v)}
            className="btn-dark text-xs px-2.5 py-1.5 inline-flex items-center gap-1.5 max-w-[180px]"
            title="Choose model"
          >
            <Zap className="size-3 text-neon" />
            <span className="truncate">{currentVariant.label}</span>
            <ChevronDown className="size-3 opacity-60" />
          </button>
          {showModelMenu && (
            <>
              <button className="fixed inset-0 z-40" onClick={() => setShowModelMenu(false)} aria-hidden />
              <div className="absolute right-0 mt-1.5 w-72 z-50 rounded-xl bg-brand-surface ring-1 ring-brand-border shadow-2xl shadow-black/60 p-1.5">
                {VARIANTS.map((v) => {
                  const active = v.id === variant;
                  return (
                    <button
                      key={v.id}
                      onClick={() => { setVariant(v.id); setShowModelMenu(false); }}
                      className={"w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-2 " + (active ? "bg-brand-bg ring-1 ring-neon/40" : "hover:bg-brand-bg/60")}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          {v.label}
                          {v.paidOnly && <span className="text-[9px] uppercase tracking-widest text-neon px-1.5 py-0.5 rounded bg-neon/10 ring-1 ring-neon/30">Plus</span>}
                        </div>
                        <div className="text-[11px] text-brand-muted leading-snug mt-0.5">{v.desc}</div>
                      </div>
                      {active && <Check className="size-4 text-neon shrink-0" />}
                    </button>
                  );
                })}
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-brand-muted border-t border-brand-border mt-1">
                  Effective cost · {effectiveCost} credits / message
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={newConversation} className="btn-dark p-2 shrink-0" title={t("chat.new")} aria-label={t("chat.new")}>
          <MessageSquarePlus className="size-4" />
        </button>

        {/* Profile menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="size-9 rounded-xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/40 flex items-center justify-center"
            aria-label="Profile"
          >
            <User className="size-4 text-brand-muted" />
          </button>
          {showProfile && (
            <>
              <button className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} aria-hidden />
              <div className="absolute right-0 mt-1.5 w-72 z-50 rounded-xl bg-brand-surface ring-1 ring-brand-border shadow-2xl shadow-black/60 p-3 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-lg icon-3d flex items-center justify-center">
                    <User className="size-4 text-[oklch(0.16_0.01_160)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{profile.name || "—"}</div>
                    <div className="text-[11px] text-brand-muted truncate">{profile.email}</div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-brand-muted flex items-center gap-1.5 mb-1.5">
                    <Building2 className="size-3" /> Company
                  </label>
                  <input
                    value={profile.company}
                    onChange={(e) => saveCompany(e.target.value)}
                    placeholder="Your company"
                    className="w-full bg-brand-bg ring-1 ring-brand-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-neon"
                  />
                </div>
                <button
                  onClick={() => { setShowProfile(false); setShowLegal(true); }}
                  className="w-full btn-dark text-xs py-2 inline-flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="size-3.5 text-neon" /> Terms & Data (GDPR/LGPD)
                </button>
                <button
                  onClick={signOut}
                  className="w-full btn-dark text-xs py-2 inline-flex items-center justify-center gap-1.5"
                >
                  <LogOut className="size-3.5" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neon/80 px-2.5 py-1 rounded-md ring-1 ring-neon/30 bg-neon/5">
          <Activity className="size-3 animate-pulse" /> {t("chat.live")}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="space-y-8">
              <div className="text-center py-6 md:py-10">
                <div className="size-16 mx-auto rounded-2xl flex items-center justify-center mb-5 icon-3d shadow-[0_0_50px_-12px_var(--neon)]">
                  <Sparkles className="size-7 text-[oklch(0.16_0.01_160)]" />
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight mb-2">{t("chat.unified.title")}</h2>
                <p className="text-sm text-brand-muted max-w-md mx-auto">{t("chat.unified.desc")}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-brand-muted px-3 py-1.5 rounded-full ring-1 ring-brand-border bg-brand-surface/60">
                  <ShieldCheck className="size-3 text-neon" />
                  Aspect-ratio + ad-policy gate active — refuses bad creatives before you spend credits.
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-muted mb-3">
                  <Sparkles className="size-3 text-neon" /> {t("chat.presets")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => submit(p.prompt)}
                      className="text-left text-xs p-3.5 rounded-xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/50 hover:text-neon transition-all"
                    >
                      <div className="text-[10px] uppercase tracking-widest text-neon mb-1">{p.label}</div>
                      <div className="text-brand-muted line-clamp-2">{p.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/dashboard/funnel" className="flex items-center gap-2 p-3 rounded-xl ring-1 ring-brand-border bg-brand-surface hover:ring-neon/40">
                  <GitBranch className="size-4 text-neon" />
                  <div className="text-xs">{t("chat.cta.funnel")}</div>
                </Link>
                <Link to="/dashboard/integrations" className="flex items-center gap-2 p-3 rounded-xl ring-1 ring-brand-border bg-brand-surface hover:ring-neon/40">
                  <Plug className="size-4 text-neon" />
                  <div className="text-xs">{t("chat.cta.integrations")}</div>
                </Link>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-brand-surface ring-1 ring-brand-border rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                <Zap className="size-3 text-neon animate-pulse" />
                <span className="text-xs text-brand-muted">{currentVariant.label} thinking…</span>
                <span className="size-1.5 rounded-full bg-neon animate-pulse" />
                <span className="size-1.5 rounded-full bg-neon animate-pulse [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-neon animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(input.trim()); }} className="border-t border-brand-border px-3 md:px-8 py-3 md:py-4 shrink-0 bg-brand-bg/80 backdrop-blur">
        <div className="max-w-3xl mx-auto">
          {attachment && (
            <div className="mb-2 flex items-center gap-2.5 p-2 rounded-xl bg-brand-surface ring-1 ring-brand-border">
              <img src={attachment.dataUrl} alt="attachment" className="size-12 rounded-lg object-cover ring-1 ring-brand-border" />
              <div className="text-xs flex-1 min-w-0">
                <div className="font-medium truncate">Image attached</div>
                <div className="text-brand-muted text-[11px]">{attachment.width}×{attachment.height} · aspect {attachment.aspect}</div>
              </div>
              <button type="button" onClick={() => setAttachment(null)} className="text-brand-muted hover:text-neon p-1" aria-label="remove">
                <X className="size-4" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-1.5 md:gap-2">
            <div className="flex items-center gap-1 shrink-0">
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
              <button type="button" onClick={() => fileInput.current?.click()} className="size-10 rounded-xl btn-dark flex items-center justify-center" title="Attach image" aria-label="Attach">
                <Paperclip className="size-4" />
              </button>
              <button type="button" onClick={() => cameraInput.current?.click()} className="size-10 rounded-xl btn-dark flex items-center justify-center" title="Camera" aria-label="Camera">
                <Camera className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => (recording ? stopVoice() : startVoice())}
                className={"size-10 rounded-xl flex items-center justify-center " + (recording ? "btn-neon-solid" : "btn-dark")}
                title="Voice input"
                aria-label="Voice"
              >
                {recording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input.trim());
                }
              }}
              rows={1}
              placeholder={attachment ? "Add context for the creative (optional)…" : t("dash.messagePlaceholder")}
              className="flex-1 bg-brand-surface ring-1 ring-brand-border rounded-xl px-3 md:px-4 py-3 text-sm resize-none focus:outline-none focus:ring-neon transition-shadow min-h-[44px] max-h-40"
            />
            <button
              type="submit"
              disabled={sending || (!input.trim() && !attachment)}
              className="size-11 md:size-12 shrink-0 btn-neon-solid flex items-center justify-center disabled:opacity-40 rounded-xl"
              aria-label={t("dash.send")}
            >
              <Send className="size-4" />
            </button>
          </div>
          <div className="mt-2 text-[10px] text-brand-muted text-center">
            {currentVariant.label} · {effectiveCost} credits / message{attachment ? " · creative validated before launch" : ""}
          </div>
        </div>
      </form>

      {showLegal && <LgpdModal forceOpen onClose={() => setShowLegal(false)} />}
    </div>
  );
}

function Bubble({ role, content }: Msg) {
  const isUser = role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed bg-neon text-[oklch(0.14_0.01_160)] font-medium">
          {content}
        </div>
      </div>
    );
  }
  const rejected = /❌\s*REJECTED/i.test(content);
  return (
    <div className="flex justify-start">
      <div className={
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-brand-surface text-brand-text ring-1 prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-headings:text-neon prose-strong:text-neon prose-a:text-neon " +
        (rejected ? "ring-red-400/50 shadow-[0_0_30px_-12px_oklch(0.62_0.24_27)]" : "ring-brand-border")
      }>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
