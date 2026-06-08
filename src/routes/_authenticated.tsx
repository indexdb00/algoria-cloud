import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LgpdModal } from "@/components/LgpdModal";
import { SplashLoader } from "@/components/SplashLoader";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/auth" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/auth" });
      } else {
        setReady(true);
        // Grant 5 daily credits (idempotent — server enforces 24h gate)
        supabase.rpc("grant_daily_credits").then(() => {}).catch(() => {});
        try {
          if (!sessionStorage.getItem("aurevia.splash.seen")) {
            setShowSplash(true);
            sessionStorage.setItem("aurevia.splash.seen", "1");
          }
        } catch { /* ignore */ }
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-brand-bg">
        <span className="text-xs uppercase tracking-widest text-brand-muted">Loading…</span>
      </div>
    );
  }

  return (
    <>
      {showSplash && <SplashLoader onDone={() => setShowSplash(false)} />}
      <Outlet />
      <LgpdModal />
    </>
  );
}
