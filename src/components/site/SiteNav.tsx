import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SiteNav() {
  const { t } = useI18n();
  return (
    <nav className="sticky top-0 z-50 border-b border-black/5 bg-brand-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-heading text-xl font-semibold tracking-tight">
            Aurevia
          </Link>
          <div className="hidden md:flex gap-8">
            <a href="#agents" className="text-sm text-brand-muted hover:text-brand-text transition-colors">{t("nav.solutions")}</a>
            <a href="#agents" className="text-sm text-brand-muted hover:text-brand-text transition-colors">{t("nav.intelligence")}</a>
            <a href="#case" className="text-sm text-brand-muted hover:text-brand-text transition-colors">{t("nav.cases")}</a>
            <a href="#pricing" className="text-sm text-brand-muted hover:text-brand-text transition-colors">{t("nav.pricing")}</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            to="/auth"
            className="hidden sm:inline text-sm text-brand-muted hover:text-brand-text transition-colors"
          >
            {t("nav.signin")}
          </Link>
          <Link
            to="/auth"
            className="text-sm bg-brand-accent text-white py-2 pr-3 pl-2 ring-1 ring-brand-accent rounded-md flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4 shrink-0" />
            {t("nav.cta")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
