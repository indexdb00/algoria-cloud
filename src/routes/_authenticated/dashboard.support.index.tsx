import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createSupportTicket } from "@/lib/support.functions";
import { HelpCircle, Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/support/")({
  component: SupportIndex,
});

type Ticket = { id: string; protocol: string; subject: string; status: string; last_message_at: string };

function SupportIndex() {
  const create = useServerFn(createSupportTicket);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from("support_tickets")
      .select("id,protocol,subject,status,last_message_at")
      .order("last_message_at", { ascending: false });
    setTickets(data ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function submit() {
    if (!subject.trim() || !message.trim()) return;
    setBusy(true);
    try {
      const res = await create({ data: { subject: subject.trim(), message: message.trim() } });
      if (res.error || !res.ticket) { toast.error(res.error || "Failed"); return; }
      toast.success(`Protocol ${res.ticket.protocol} created`);
      navigate({ to: "/dashboard/support/$id", params: { id: res.ticket.id } });
    } finally { setBusy(false); }
  }

  const STATUS_COLOR: Record<string, string> = {
    open: "text-sky-300 bg-sky-500/10 ring-sky-500/30",
    pending: "text-amber-300 bg-amber-500/10 ring-amber-500/30",
    resolved: "text-emerald-300 bg-emerald-500/10 ring-emerald-500/30",
    closed: "text-brand-muted bg-white/5 ring-brand-border",
  };

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-4xl">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neon mb-2 inline-flex items-center gap-1.5">
            <HelpCircle className="size-3" /> Support
          </div>
          <h1 className="font-heading text-3xl font-medium tracking-tight">Help center</h1>
          <p className="text-sm text-brand-muted mt-2">Chat directly with the Algoria team. Each request gets a protocol number.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-neon-solid text-sm px-4 py-2 inline-flex items-center gap-2 rounded-lg">
          <Plus className="size-4" /> New ticket
        </button>
      </div>

      {showNew && (
        <div className="mb-8 p-5 rounded-2xl bg-brand-surface ring-1 ring-brand-border space-y-3">
          <input
            value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. Issue with WhatsApp integration)"
            className="input-base w-full"
          />
          <textarea
            value={message} onChange={(e) => setMessage(e.target.value)}
            rows={4} placeholder="Describe your issue or question…"
            className="input-base w-full resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNew(false)} className="btn-dark text-sm px-3 py-2 rounded-lg">Cancel</button>
            <button disabled={busy} onClick={submit} className="btn-neon-solid text-sm px-4 py-2 rounded-lg disabled:opacity-50">
              {busy ? "Creating…" : "Create ticket"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tickets.length === 0 ? (
          <div className="text-center py-16 text-sm text-brand-muted">No tickets yet. Open one to get help.</div>
        ) : tickets.map((t) => (
          <Link key={t.id} to="/dashboard/support/$id" params={{ id: t.id }}
            className="block p-4 rounded-xl bg-brand-surface ring-1 ring-brand-border hover:ring-neon/40 transition">
            <div className="flex items-center gap-3 mb-1.5">
              <MessageSquare className="size-3.5 text-neon" />
              <span className="font-mono text-[11px] text-brand-muted">{t.protocol}</span>
              <span className={"ml-auto text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ring-1 " + (STATUS_COLOR[t.status] || STATUS_COLOR.open)}>
                {t.status}
              </span>
            </div>
            <div className="font-medium text-sm truncate">{t.subject}</div>
            <div className="text-[11px] text-brand-muted mt-1">{new Date(t.last_message_at).toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
