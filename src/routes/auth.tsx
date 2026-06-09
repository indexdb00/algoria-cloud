import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { BrandMark } from "@/components/BrandMark";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Algoria" }, { name: "description", content: "Sign in or create your Algoria account." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | "apple" | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard/chat" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard/chat" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function oauth(provider: "google" | "apple") {
    setOauthBusy(provider);
    try {
      const res = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin + "/dashboard/chat",
      });
      if (res.error) throw res.error instanceof Error ? res.error : new Error(String(res.error));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OAuth failed");
      setOauthBusy(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard/chat" : undefined,
            data: { display_name: name || email.split("@")[0], language: lang },
          },
        });
        if (error) throw error;
        toast.success(t("auth.welcome"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="border-b border-brand-border">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="font-heading text-xl font-semibold tracking-tight">Algoria</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-3xl font-medium tracking-tight mb-2">
            {mode === "signin" ? t("auth.signin.title") : t("auth.signup.title")}
          </h1>
          <p className="text-sm text-brand-muted mb-7">{t("auth.welcome")}</p>

          <div className="space-y-2.5 mb-5">
            <button
              type="button" onClick={() => oauth("google")} disabled={!!oauthBusy}
              className="w-full bg-white text-black py-2.5 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2.5"
            >
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 7 29.5 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 43c5.3 0 10.1-2 13.7-5.3l-6.3-5.2c-2.1 1.4-4.8 2.3-7.4 2.3-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.4 38.6 16.2 43 24 43z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.7l6.3 5.2c-.4.4 6.9-5 6.9-15 0-1.3-.1-2.4-.4-3.5z"/></svg>
              {oauthBusy === "google" ? "…" : (t("auth.google") || "Continue with Google")}
            </button>
            <button
              type="button" onClick={() => oauth("apple")} disabled={!!oauthBusy}
              className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2.5 ring-1 ring-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              {oauthBusy === "apple" ? "…" : (t("auth.apple") || "Continue with Apple")}
            </button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-brand-border" />
            <span className="text-[10px] uppercase tracking-widest text-brand-muted">{t("auth.or") || "or"}</span>
            <div className="flex-1 h-px bg-brand-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field label={t("auth.name")} type="text" value={name} onChange={setName} autoComplete="name" />
            )}
            <Field label={t("auth.email")} type="email" value={email} onChange={setEmail} required autoComplete="email" />
            <Field label={t("auth.password")} type="password" value={password} onChange={setPassword} required minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            <button
              type="submit" disabled={loading}
              className="w-full btn-neon-solid py-2.5 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? "…" : mode === "signin" ? t("auth.signin.cta") : t("auth.signup.cta")}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-xs text-brand-muted hover:text-brand-text transition-colors w-full text-center"
          >
            {mode === "signin" ? t("auth.toSignup") : t("auth.toSignin")}
          </button>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type, required, minLength, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; type: string;
  required?: boolean; minLength?: number; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-brand-muted uppercase tracking-widest mb-2 block">{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} minLength={minLength} autoComplete={autoComplete}
        className="w-full bg-brand-surface ring-1 ring-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-neon transition-shadow"
      />
    </label>
  );
}
