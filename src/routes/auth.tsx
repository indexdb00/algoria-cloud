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
          <Link to="/" className="flex items-center gap-2.5 group">
            <BrandMark size={26} />
            <span className="font-heading text-xl font-semibold tracking-tight bg-gradient-to-r from-brand-text to-brand-muted bg-clip-text text-transparent group-hover:to-brand-text transition-all duration-300">
              Algoria
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md fade-up">
          {/* Card container com efeito glass */}
          <div className="glass-card p-8">
            <h1 className="font-heading text-3xl font-medium tracking-tight mb-2 gradient-text">
              {mode === "signin" ? t("auth.signin.title") : t("auth.signup.title")}
            </h1>
            <p className="text-sm text-brand-muted mb-7">{t("auth.welcome")}</p>

            {/* OAuth Buttons */}
            <div className="space-y-2.5 mb-5">
              <button
                type="button" 
                onClick={() => oauth("google")} 
                disabled={!!oauthBusy}
                className="btn-dark w-full py-2.5 rounded-md text-sm font-medium disabled:opacity-50 transition flex items-center justify-center gap-2.5"
              >
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 7 29.5 5 24 5 16.3 5 9.6 9.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 43c5.3 0 10.1-2 13.7-5.3l-6.3-5.2c-2.1 1.4-4.8 2.3-7.4 2.3-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.4 38.6 16.2 43 24 43z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.7l6.3 5.2c-.4.4 6.9-5 6.9-15 0-1.3-.1-2.4-.4-3.5z"/>
                </svg>
                {oauthBusy === "google" ? "..." : (t("auth.google") || "Continue with Google")}
              </button>
              
              <button
                type="button" 
                onClick={() => oauth("apple")} 
                disabled={!!oauthBusy}
                className="btn-dark w-full py-2.5 rounded-md text-sm font-medium hover:bg-brand-surface2 disabled:opacity-50 transition flex items-center justify-center gap-2.5"
              >
                <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                {oauthBusy === "apple" ? "..." : (t("auth.apple") || "Continue with Apple")}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-brand-border" />
              <span className="text-[10px] uppercase tracking-widest text-brand-muted font-medium">
                {t("auth.or") || "or"}
              </span>
              <div className="flex-1 h-px bg-brand-border" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "signup" && (
                <Field 
                  label={t("auth.name")} 
                  type="text" 
                  value={name} 
                  onChange={setName} 
                  autoComplete="name" 
                />
              )}
              
              <Field 
                label={t("auth.email")} 
                type="email" 
                value={email} 
                onChange={setEmail} 
                required 
                autoComplete="email" 
              />
              
              <Field 
                label={t("auth.password")} 
                type="password" 
                value={password} 
                onChange={setPassword} 
                required 
                minLength={6} 
                autoComplete={mode === "signup" ? "new-password" : "current-password"} 
              />
              
              <button
                type="submit" 
                disabled={loading}
                className="btn-neon-solid w-full py-2.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : mode === "signin" 
                  ? t("auth.signin.cta") 
                  : t("auth.signup.cta")}
              </button>
            </form>

            {/* Toggle Mode */}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-6 text-xs text-brand-muted hover:text-neon transition-colors w-full text-center font-medium"
            >
              {mode === "signin" ? t("auth.toSignup") : t("auth.toSignin")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type, required, minLength, autoComplete }: {
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  type: string;
  required?: boolean; 
  minLength?: number; 
  autoComplete?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <label className="block group">
      <span className={`text-xs uppercase tracking-widest mb-2 block transition-colors duration-200 ${
        isFocused ? 'text-neon' : 'text-brand-muted'
      }`}>
        {label}
      </span>
      <input
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required} 
        minLength={minLength} 
        autoComplete={autoComplete}
        className="input-base w-full transition-all duration-200"
      />
    </label>
  );
}
