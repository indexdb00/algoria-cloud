import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function CookieBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = localStorage.getItem("algoria.cookieConsent");
    if (!v) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (value: "accept" | "reject") => {
    try { localStorage.setItem("algoria.cookieConsent", value); } catch { /* ignore */ }
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:bottom-6 z-[60] md:max-w-md animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="rounded-2xl bg-brand-surface/95 backdrop-blur ring-1 ring-brand-border shadow-2xl shadow-black/60 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl icon-3d flex items-center justify-center shrink-0">
            <Cookie className="size-4 text-[oklch(0.16_0.01_160)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium mb-1">{t("cookies.title")}</div>
            <p className="text-xs text-brand-muted leading-relaxed">{t("cookies.desc")}</p>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => decide("accept")} className="btn-neon-solid text-xs py-1.5 px-3">{t("cookies.accept")}</button>
              <button onClick={() => decide("reject")} className="btn-dark text-xs py-1.5 px-3">{t("cookies.reject")}</button>
              <a href="#privacy" className="text-xs text-brand-muted hover:text-neon ml-auto">{t("cookies.learn")}</a>
            </div>
          </div>
          <button onClick={() => decide("reject")} className="text-brand-muted hover:text-neon" aria-label="dismiss">
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
