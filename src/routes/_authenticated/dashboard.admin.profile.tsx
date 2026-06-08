import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/admin/profile")({
  component: AdminProfile,
});

function AdminProfile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setNewEmail(data.user?.email ?? "");
    });
    supabase.from("profiles").select("display_name").maybeSingle().then(({ data }) => {
      if (data?.display_name) setName(data.display_name);
    });
  }, []);

  async function saveName() {
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", u.user.id);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Name updated");
  }
  async function saveEmail() {
    if (newEmail === email) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Verification sent to new email");
  }
  async function savePassword() {
    if (newPassword.length < 6) { toast.error("Password too short"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Password updated"); setNewPassword(""); }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="font-heading text-xl font-medium tracking-tight">Admin profile</h2>

      <Section icon={<UserIcon className="size-4 text-neon" />} title="Display name">
        <input value={name} onChange={(e) => setName(e.target.value)} className="input-base w-full" />
        <button onClick={saveName} disabled={busy} className="btn-neon-solid text-sm px-4 py-2 rounded-lg inline-flex items-center gap-2">
          <Save className="size-3.5" /> Save name
        </button>
      </Section>

      <Section icon={<Mail className="size-4 text-neon" />} title="Email">
        <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" className="input-base w-full" />
        <p className="text-[11px] text-brand-muted">Current: <strong>{email}</strong></p>
        <button onClick={saveEmail} disabled={busy} className="btn-neon-solid text-sm px-4 py-2 rounded-lg inline-flex items-center gap-2">
          <Save className="size-3.5" /> Update email
        </button>
      </Section>

      <Section icon={<Lock className="size-4 text-neon" />} title="Password">
        <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="New password (min 6 chars)" className="input-base w-full" />
        <button onClick={savePassword} disabled={busy} className="btn-neon-solid text-sm px-4 py-2 rounded-lg inline-flex items-center gap-2">
          <Save className="size-3.5" /> Change password
        </button>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl bg-brand-surface ring-1 ring-brand-border space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">{icon}{title}</div>
      {children}
    </div>
  );
}
