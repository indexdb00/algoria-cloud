import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Check, Sparkles, Crown, Rocket } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$5",
    period: "/mo",
    credits: "100 credits",
    icon: Sparkles,
    features: ["1 active agent", "Daily 5 credits bonus", "Email support"],
    accent: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/mo",
    credits: "500 credits",
    icon: Rocket,
    features: ["All AI agents", "Plus model (Claude)", "Priority support", "All integrations"],
    accent: true,
  },
  {
    name: "Business",
    price: "$50",
    period: "/mo",
    credits: "1,500 credits",
    icon: Crown,
    features: ["Everything in Pro", "Team workspace", "Dedicated success", "SSO ready"],
    accent: false,
  },
];

export function PlanCarousel() {
  return (
    <div className="w-full max-w-3xl mx-auto px-8">
      <Carousel opts={{ loop: true, align: "center" }} className="w-full">
        <CarouselContent>
          {plans.map((p) => {
            const Icon = p.icon;
            return (
              <CarouselItem key={p.name} className="md:basis-1/2 lg:basis-1/3">
                <div
                  className={
                    "h-full rounded-2xl p-5 flex flex-col text-left transition " +
                    (p.accent ? "neon-card neon-glow" : "bg-brand-surface ring-1 ring-brand-border hover:neon-border")
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={"size-9 rounded-xl flex items-center justify-center " + (p.accent ? "bg-neon/20 ring-1 ring-neon/50" : "bg-brand-bg ring-1 ring-brand-border")}>
                      <Icon className={"size-4 " + (p.accent ? "text-neon" : "text-brand-muted")} />
                    </div>
                    {p.accent && <span className="text-[10px] uppercase tracking-widest neon-text">Popular</span>}
                  </div>
                  <div className="font-heading text-lg font-medium">{p.name}</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-heading text-2xl font-medium">{p.price}</span>
                    <span className="text-xs text-brand-muted">{p.period}</span>
                  </div>
                  <div className="text-[11px] text-neon mt-1">{p.credits}</div>
                  <ul className="mt-4 space-y-1.5 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="text-xs text-brand-muted flex items-start gap-2">
                        <Check className="size-3 text-neon mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
