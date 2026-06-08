import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useI18n, type LangCode } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { sendAgentMessage } from "@/lib/chat.functions";
import { BrandMark } from "@/components/BrandMark";
import { Tutorial } from "@/components/Tutorial";
import { greetingKey } from "@/lib/avatar";
import {
  Send, Sparkles, GitBranch, Plug, Zap, Paperclip, Camera, Mic, MicOff, X, ChevronDown, Check,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/chat")({
  head: () => ({ meta: [{ title: "Chat — Aurevia" }] }),
  component: UnifiedChat,
});

const PRESETS: Record<LangCode, { label: string; prompt: string }[]> = {
  en: [
    { label: "Launch Meta Ads", prompt: "Launch a Meta Ads campaign, €25/day, European founders 28–45 interested in B2B SaaS. Use the CAMPAIGN block." },
    { label: "Score my leads", prompt: "Score my last 50 leads by buying intent and tell me which to call first." },
    { label: "3h performance pulse", prompt: "Give me a 3-hour performance pulse across every connected channel." },
    { label: "Google Ads search", prompt: "Set up a Google Ads search campaign, €40/day, DACH. CAMPAIGN block." },
  ],
  pt: [
    { label: "Lançar Meta Ads", prompt: "Lança uma campanha Meta Ads, €25/dia, founders europeus 28–45 SaaS B2B. Formato CAMPAIGN." },
    { label: "Pontuar leads", prompt: "Pontua os meus últimos 50 leads por intenção de compra." },
    { label: "Pulso de 3h", prompt: "Dá-me o pulso de 3h por canal conectado." },
    { label: "Google Search", prompt: "Cria uma campanha Google Ads de search, €40/dia, DACH. Formato CAMPAIGN." },
  ],
  es: [
    { label: "Lanzar Meta Ads", prompt: "Lanza una campaña Meta Ads, €25/día, founders europeos 28–45 SaaS B2B. Formato CAMPAIGN." },
    { label: "Puntuar leads", prompt: "Puntúa mis últimos 50 leads por intención." },
    { label: "Pulso 3h", prompt: "Dame el pulso de 3h en cada canal." },
    { label: "Google", prompt: "Campaña Google Ads search €40/día DACH. CAMPAIGN." },
  ],
  fr: [
    { label: "Lancer Meta Ads", prompt: "Lance une campagne Meta Ads 25€/jour fondateurs européens 28–45 SaaS B2B. CAMPAIGN." },
    { label: "Scorer leads", prompt: "Score mes 50 derniers leads par intention." },
    { label: "Pulse 3h", prompt: "Pulse 3h sur chaque canal connecté." },
    { label: "Google", prompt: "Campagne Google Ads search 40€/jour DACH. CAMPAIGN." },
  ],
  de: [
    { label: "Meta Ads starten", prompt: "Starte Meta Ads Kampagne, €25/Tag, EU Founder 28–45 B2B SaaS. CAMPAIGN." },
    { label: "Leads bewerten", prompt: "Bewerte meine letzten 50 Leads nach Kaufabsicht." },
    { label: "3h Puls", prompt: "Gib mir den 3h Puls pro Kanal." },
    { label: "Google", prompt: "Google Ads Search €40/Tag DACH. CAMPAIGN." },
  ],
  it: [
    { label: "Lancia Meta Ads", prompt: "Lancia una campagna Meta Ads, €25/giorno, founder europei 28–45 B2B SaaS. CAMPAIGN." },
    { label: "Score lead", prompt: "Valuta i miei ultimi 50 lead per intent." },
    { label: "Pulse 3h", prompt: "Pulse di 3h per canale." },
    { label: "Google", prompt: "Campagna Google Ads search €40/giorno DACH. CAMPAIGN." },
  ],
};

type Msg = { role: "user" | "assistant"; content: string };
type Variant = "v1" | "v1.1" | "plus";
type Attachment = { dataUrl: string; width: number; height: number; aspect: string };

const VARIANTS: { id: Variant; label: string; desc: string; mult: number; paidOnly: boolean }[] = [
  { id: "v1", label: "Aurevia v1.0", desc: "Fast, balanced. 1× credit cost.", mult: 1, paidOnly: false },
  { id: "v1.1", label: "Aurevia Thinking v1.1", desc: "Deeper reasoning. 2× credit cost.", mult: 2, paidOnly: false },
  { id: "plus", label: "Aurevia Plus", desc: "Thinking quality at half the cost.", mult: 1, paidOnly: true },
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
      const { data: agent } = await supabase.from("agents").select("cost_per_message").eq("slug", "aurevia").maybeSingle();
      if (agent?.cost_per_message) setBaseCost(agent.cost_per_message);

      const { data: prof } = await supabase.from("profiles").select("display_name").maybeSingle();
      if (prof?.display_name) setName(prof.display_name);
      else {
        const { data: u } = await supabase.auth.getUser();
        setName((u.user?.email ?? "").split("@")[0]);
      }

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
          const pending = sessionStorage.getItem("aurevia.pendingPrompt");
          if (pending) {
            sessionStorage.removeItem("aurevia.pendingPrompt");
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
        agentSlug: "aurevia",
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

  const presets = PRESETS[lang] ?? PRESETS.en;
  const currentVariant = VARIANTS.find((v) => v.id === variant)!;
  const greet = t(`greet.${greetingKey()}`);
  // ephemeral: only render messages added in this session
  const visible = messages.slice(ephemeralStart);

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] md:h-screen">
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

      {/* Slim header — brand + subtitle only */}
      <header className="h-14 md:h-16 border-b border-brand-border px-4 md:px-8 flex items-center gap-3 shrink-0">
        <BrandMark size={28} />
        <div className="flex-1 min-w-0">
          <div className="font-heading text-base md:text-lg font-medium leading-none tracking-tight">Aurevia</div>
          <div className="text-[10px] uppercase tracking-widest text-brand-muted mt-1">AI marketing co-pilot</div>
        </div>
      </header>

      {/* Scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          {visible.length === 0 && !sending && (
            <div className="space-y-10 fade-up">
              <div className="text-center py-10 md:py-16">
                <div className="text-[10px] uppercase tracking-widest text-neon mb-3">{currentVariant.label}</div>
                <h2 className="font-heading text-4xl md:text-5xl font-medium tracking-tight">
                  {greet}{name ? ", " : ""}<span className="text-neon">{name}</span>.
                </h2>
                <p className="text-sm text-brand-muted mt-4 max-w-md mx-auto">{t("chat.unified.desc")}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-muted mb-3">
                  <Sparkles className="size-3 text-neon" /> {t("chat.presets")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presets.map((p) => (
                    <button key={p.label} onClick={() => submit(p.prompt)}
                      className="text-left text-xs p-3.5 rounded-xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/60 transition-all">
                      <div className="text-[10px] uppercase tracking-widest text-neon mb-1">{p.label}</div>
                      <div className="text-brand-muted line-clamp-2">{p.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link to="/dashboard/funnel" className="flex items-center gap-2 p-3 rounded-xl ring-1 ring-brand-border bg-brand-surface hover:ring-neon/40">
                  <GitBranch className="size-4 text-neon" /><div className="text-xs">{t("chat.cta.funnel")}</div>
                </Link>
                <Link to="/dashboard/integrations" className="flex items-center gap-2 p-3 rounded-xl ring-1 ring-brand-border bg-brand-surface hover:ring-neon/40">
                  <Plug className="size-4 text-neon" /><div className="text-xs">{t("chat.cta.integrations")}</div>
                </Link>
              </div>
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
                        return (
                          <button key={v.id} type="button" onClick={() => { setVariant(v.id); setShowModelMenu(false); }}
                            className={"w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2 " + (active ? "bg-brand-bg ring-1 ring-neon/40" : "hover:bg-brand-bg/60")}>
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
