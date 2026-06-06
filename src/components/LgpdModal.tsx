import { useEffect, useState } from "react";
import { ShieldCheck, FileText, X } from "lucide-react";

const LS_KEY = "aurevia.lgpdAccepted.v1";

export function lgpdAccepted(): boolean {
  if (typeof window === "undefined") return true;
  try { return localStorage.getItem(LS_KEY) === "true"; } catch { return true; }
}

export function LgpdModal({ forceOpen = false, onClose }: { forceOpen?: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) { setOpen(true); return; }
    if (!lgpdAccepted()) setOpen(true);
  }, [forceOpen]);

  if (!open) return null;

  const accept = () => {
    try { localStorage.setItem(LS_KEY, "true"); } catch { /* ignore */ }
    setOpen(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-3 md:p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-brand-surface ring-1 ring-brand-border shadow-2xl overflow-hidden">
        <header className="h-14 px-5 flex items-center justify-between border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg icon-3d flex items-center justify-center">
              <ShieldCheck className="size-4 text-[oklch(0.16_0.01_160)]" />
            </div>
            <div>
              <div className="text-sm font-medium">Terms of Use & Data (GDPR / LGPD)</div>
              <div className="text-[10px] uppercase tracking-widest text-brand-muted">Required to continue</div>
            </div>
          </div>
          {forceOpen && (
            <button onClick={() => { setOpen(false); onClose?.(); }} className="text-brand-muted hover:text-neon">
              <X className="size-4" />
            </button>
          )}
        </header>

        <div className="p-5 md:p-6 max-h-[60vh] overflow-y-auto prose prose-invert prose-sm max-w-none text-brand-text">
          <p className="text-xs text-brand-muted">Last updated: 2026 · EU/Brazil compliance</p>
          <h3 className="font-heading">1. Data we collect</h3>
          <p>Account data (email, display name, language), ad platform tokens you connect (encrypted at rest, scoped, revocable anytime), prompts and assistant replies stored to provide the service, and usage telemetry (credits, requests, latency). All data is hosted within the EU and never sold or used to train third-party foundation models.</p>
          <h3 className="font-heading">2. Your rights (GDPR / LGPD)</h3>
          <p>Right to access, rectify, export and erase your data; right to revoke consent; right to lodge a complaint with your supervisory authority (CNIL, AEPD, ANPD, etc.). Requests at <a className="text-neon" href="mailto:privacy@aurevia.eu">privacy@aurevia.eu</a> — responded within 30 days.</p>
          <h3 className="font-heading">3. Acceptable use & fraud</h3>
          <p>You agree NOT to use Aurevia to bypass or defraud the policies of any connected ad platform (Meta, Google, TikTok, BidMachine, GA4), NOT to inflate metrics artificially, NOT to run prohibited categories (illegal goods, hate, adult content targeting minors, financial fraud) and NOT to share account credentials. Aurevia may suspend accounts that violate these terms and report to the affected platforms.</p>
          <h3 className="font-heading">4. Credits & billing</h3>
          <p>Free tier: 100 welcome credits on first registration. Recurring free allowance: 50 credits/month. Paid plans add additional monthly credits that do not expire while the plan is active. Credits are non-refundable except where required by law (EU 14-day right of withdrawal applies to first paid purchase).</p>
          <h3 className="font-heading">5. Data retention</h3>
          <p>Conversations and campaign metadata are retained while your account is active and for up to 24 months after deletion (for legal and accounting obligations). Encrypted ad-platform tokens are deleted within 24h of disconnection.</p>
          <h3 className="font-heading">6. Liability</h3>
          <p>Aurevia provides AI-assisted automation. You remain the controller of every campaign launched and accept responsibility for budgets, targeting choices and creative compliance with local advertising law.</p>
          <p className="text-xs text-brand-muted">A full PDF copy of these Terms is available in <strong>Settings → Legal</strong> at any time.</p>
        </div>

        <footer className="p-5 border-t border-brand-border flex flex-col-reverse md:flex-row items-stretch md:items-center gap-3 md:justify-between">
          <a
            href="data:text/plain;charset=utf-8,Aurevia%20Terms%20of%20Use%20and%20Data%20Protection%20Policy%20(GDPR%2FLGPD).%20Full%20text%20available%20in%20Settings%20%E2%86%92%20Legal."
            download="aurevia-terms.txt"
            className="btn-dark text-xs py-2 px-3 inline-flex items-center justify-center gap-1.5"
          >
            <FileText className="size-3.5" /> Download PDF copy
          </a>
          <button onClick={accept} className="btn-neon-solid text-sm py-2 px-4">
            I agree & continue
          </button>
        </footer>
      </div>
    </div>
  );
}
