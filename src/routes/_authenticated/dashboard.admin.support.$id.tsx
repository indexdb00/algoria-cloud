import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { replySupportTicket, setTicketStatus } from "@/lib/support.functions";
import { ArrowLeft, Send, ShieldCheck, User, Building2, Globe } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/admin/support/$id")({
  component: AdminTicket,
});

type Msg = { id: string; role: "user" | "admin"; content: string; created_at: string };
type Ticket = { protocol: string; subject: string; status: string; user_id: string };
type Profile = { display_name: string | null; company: string | null; country: string | null; city: string | null; state: string | null };
type Camp = { id: string; title: string | null; updated_at: string };

function AdminTicket() {
  const { id } = Route.useParams();
  const reply = useServerFn(replySupportTicket);
  const setStatus = useServerFn(setTicketStatus);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [campaigns, setCampaigns] = useState<Camp[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function load() {
    const { data: t } = await supabase.from("support_tickets")
      .select("protocol,subject,status,user_id").eq("id", id).maybeSingle();
    if (t) {
      setTicket(t as Ticket);
      const [{ data: p }, { data: m }, { data: c }] = await Promise.all([
        supabase.from("profiles").select("display_name,company,country,city,state").eq("id", t.user_id).maybeSingle(),
        supabase.from("support_messages").select("id,role,content,created_at").eq("ticket_id", id).order("created_at", { ascending: true }),
        supabase.from("conversations").select("id,title,updated_at").eq("user_id", t.user_id).order("updated_at", { ascending: false }).limit(15),
      ]);
      setProfile(p as Profile);
      setMsgs((m ?? []) as Msg[]);
      setCampaigns((c ?? []) as Camp[]);
    }
  }
  useEffect(() => { void load(); }, [id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    if (!input.trim() || busy) return;
    const text = input.trim();
    setInput(""); setBusy(true);
    try {
      const r = await reply({ data: { ticketId: id, message: text, asAdmin: true } });
      if (r.error) toast.error(r.error); else await load();
    } finally { setBusy(false); }
  }

  async function changeStatus(s: "open" | "pending" | "resolved" | "closed") {
    const r = await setStatus({ data: { ticketId: id, status: s } });
    if (r.error) toast.error(r.error); else { toast.success("Status updated"); await load(); }
  }

  return (
    <div className="grid md:grid-cols-[1fr,280px] gap-5">
      <div>
        <Link to="/dashboard/admin/support" className="text-xs text-brand-muted hover:text-brand-text inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="size-3" /> Back
        </Link>
        {ticket && (
          <div className="mb-4">
            <div className="font-mono text-[11px] text-amber-400">{ticket.protocol}</div>
            <h1 className="font-heading text-xl font-medium tracking-tight">{ticket.subject}</h1>
            <div className="flex gap-1.5 mt-2">
              {(["open","pending","resolved","closed"] as const).map((s) => (
                <button key={s} onClick={() => changeStatus(s)}
                  className={"text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ring-1 transition " +
                    (ticket.status === s ? "bg-amber-500/20 ring-amber-500/50 text-amber-300" : "ring-brand-border text-brand-muted hover:text-brand-text")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3 mb-4">
          {msgs.map((m) => (
            <div key={m.id} className={"flex gap-2.5 " + (m.role === "admin" ? "justify-end" : "")}>
              {m.role === "user" && <div className="size-7 rounded-full bg-brand-surface ring-1 ring-brand-border flex items-center justify-center shrink-0"><User className="size-3.5 text-brand-muted" /></div>}
              <div className={"max-w-[80%] rounded-2xl px-4 py-2.5 text-sm " + (m.role === "admin" ? "bg-amber-500/10 ring-1 ring-amber-500/30" : "bg-brand-surface ring-1 ring-brand-border")}>
                {m.content}
                <div className="text-[10px] text-brand-muted mt-1">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              {m.role === "admin" && <div className="size-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0"><ShieldCheck className="size-3.5 text-white" /></div>}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex items-end gap-2">
          <textarea
            value={input} onChange={(e) => setInput(e.target.value)} rows={2}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Reply as admin…" className="input-base flex-1 resize-none"
          />
          <button onClick={send} disabled={busy || !input.trim()} className="size-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center shrink-0">
            <Send className="size-4" />
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="p-4 rounded-2xl bg-brand-surface ring-1 ring-brand-border">
          <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-2">User</div>
          <div className="text-sm font-medium">{profile?.display_name || "—"}</div>
          {profile?.company && <div className="text-xs text-brand-muted flex items-center gap-1.5 mt-1"><Building2 className="size-3" /> {profile.company}</div>}
          {(profile?.city || profile?.country) && (
            <div className="text-xs text-brand-muted flex items-center gap-1.5 mt-1">
              <Globe className="size-3" /> {[profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
        <div className="p-4 rounded-2xl bg-brand-surface ring-1 ring-brand-border">
          <div className="text-[10px] uppercase tracking-widest text-brand-muted mb-2">Recent campaigns / chats</div>
          {campaigns.length === 0 ? (
            <div className="text-xs text-brand-muted">No activity.</div>
          ) : (
            <ul className="space-y-1.5">
              {campaigns.map((c) => (
                <li key={c.id} className="text-xs">
                  <div className="truncate">{c.title || "Untitled"}</div>
                  <div className="text-[10px] text-brand-muted">{new Date(c.updated_at).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
