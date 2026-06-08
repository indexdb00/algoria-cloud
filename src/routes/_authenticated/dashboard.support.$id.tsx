import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { replySupportTicket } from "@/lib/support.functions";
import { ArrowLeft, Send, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/support/$id")({
  component: SupportThread,
});

type Msg = { id: string; role: "user" | "admin"; content: string; created_at: string };
type Ticket = { protocol: string; subject: string; status: string };

function SupportThread() {
  const { id } = Route.useParams();
  const reply = useServerFn(replySupportTicket);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function load() {
    const [{ data: t }, { data: m }] = await Promise.all([
      supabase.from("support_tickets").select("protocol,subject,status").eq("id", id).maybeSingle(),
      supabase.from("support_messages").select("id,role,content,created_at").eq("ticket_id", id).order("created_at", { ascending: true }),
    ]);
    if (t) setTicket(t as Ticket);
    if (m) setMsgs(m as Msg[]);
  }
  useEffect(() => { void load(); }, [id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    if (!input.trim() || busy) return;
    const text = input.trim();
    setInput("");
    setBusy(true);
    try {
      const r = await reply({ data: { ticketId: id, message: text } });
      if (r.error) toast.error(r.error); else await load();
    } finally { setBusy(false); }
  }

  return (
    <div className="px-5 md:px-10 py-8 max-w-3xl">
      <Link to="/dashboard/support" className="text-xs text-brand-muted hover:text-brand-text inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="size-3" /> Back
      </Link>
      {ticket && (
        <div className="mb-5">
          <div className="font-mono text-[11px] text-neon">{ticket.protocol}</div>
          <h1 className="font-heading text-2xl font-medium tracking-tight">{ticket.subject}</h1>
          <div className="text-[10px] uppercase tracking-widest text-brand-muted mt-1">Status: {ticket.status}</div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {msgs.map((m) => (
          <div key={m.id} className={"flex gap-2.5 " + (m.role === "user" ? "justify-end" : "")}>
            {m.role === "admin" && (
              <div className="size-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="size-3.5 text-white" />
              </div>
            )}
            <div className={"max-w-[80%] rounded-2xl px-4 py-2.5 text-sm " + (m.role === "user" ? "bg-brand-bg ring-1 ring-brand-border" : "bg-brand-surface ring-1 ring-amber-500/30")}>
              {m.content}
              <div className="text-[10px] text-brand-muted mt-1">{new Date(m.created_at).toLocaleString()}</div>
            </div>
            {m.role === "user" && (
              <div className="size-7 rounded-full bg-brand-surface ring-1 ring-brand-border flex items-center justify-center shrink-0">
                <User className="size-3.5 text-brand-muted" />
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex items-end gap-2 sticky bottom-4 bg-brand-bg/80 backdrop-blur p-2 rounded-2xl ring-1 ring-brand-border">
        <textarea
          value={input} onChange={(e) => setInput(e.target.value)} rows={2}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
          placeholder="Type your reply…" className="input-base flex-1 resize-none"
        />
        <button onClick={send} disabled={busy || !input.trim()} className="btn-neon-solid size-10 rounded-xl flex items-center justify-center shrink-0">
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
