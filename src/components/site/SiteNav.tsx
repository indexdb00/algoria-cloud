import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SiteNav() {
  const { t } = useI18n();
  return (
    <nav className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/75 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-heading text-xl font-semibold tracking-tight flex items-center gap-2">
            <span className="size-2 rounded-full bg-neon shadow-[0_0_12px_var(--neon)]" />
            Aurevia
          </Link>
          <div className="hidden md:flex gap-8">
            <a href="#agents" className="text-sm text-brand-muted hover:text-neon transition-colors">{t("nav.solutions")}</a>
            <a href="#agents" className="text-sm text-brand-muted hover:text-neon transition-colors">{t("nav.intelligence")}</a>
            <a href="#case" className="text-sm text-brand-muted hover:text-neon transition-colors">{t("nav.cases")}</a>
            <a href="#pricing" className="text-sm text-brand-muted hover:text-neon transition-colors">{t("nav.pricing")}</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <Link to="/auth" className="hidden sm:inline text-sm text-brand-muted hover:text-neon transition-colors">
            {t("nav.signin")}
          </Link>
          <Link to="/auth" className="btn-neon-solid text-sm py-1.5 px-3 flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            {t("nav.cta")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
