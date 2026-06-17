import * as React from "react";
import { Home, Sparkles } from "lucide-react";
import { DAILY_TRENDS } from "@/data/dailyTrends";
import { pickDailyIndex } from "@/lib/dailySeedPick";
import { TrendIcon } from "@/lib/trendIcons";

type Props = {
  name?: string;
};

export function HomeBriefingHero({ name }: Props) {
  const today = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const insight = React.useMemo(() => {
    const idx = pickDailyIndex(DAILY_TRENDS.length, "home-insight");
    return DAILY_TRENDS[idx]!;
  }, []);

  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7 shadow-soft">
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="relative space-y-5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-3 shadow-elevated shrink-0">
            <Home className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">
              Daily Briefing
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 leading-tight">
              สวัสดี{name ? `, ${name}` : ""}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 capitalize">{today}</p>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <TrendIcon iconKey={insight.iconKey} category={insight.category} size="sm" />
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" aria-hidden />
              Insight วันนี้ · {insight.category}
            </div>
            <p className="mt-1 text-sm font-semibold leading-snug">{insight.title}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {insight.body}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
