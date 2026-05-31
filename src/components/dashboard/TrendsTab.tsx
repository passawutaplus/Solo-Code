import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDailyTrends, type DailyTrendItem } from "@/lib/dailyTrends.functions";
import { safeHref } from "@/lib/security";
import { Newspaper, ExternalLink, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function TrendsTab() {
  const fetchTrends = useServerFn(getDailyTrends);
  const { data, isLoading } = useQuery({
    queryKey: ["daily-trends"],
    queryFn: () => fetchTrends(),
    staleTime: 1000 * 60 * 60 * 6,
  });

  const items: DailyTrendItem[] = data?.items ?? [];
  const [activeCat, setActiveCat] = React.useState<string>("ทั้งหมด");

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.category));
    return ["ทั้งหมด", ...Array.from(set)];
  }, [items]);

  const filtered = activeCat === "ทั้งหมด" ? items : items.filter((i) => i.category === activeCat);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  const dateLabel = data?.date
    ? new Date(data.date).toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Masthead */}
      <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7 shadow-soft">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-3 shadow-elevated shrink-0">
              <Newspaper className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">So1o Daily</p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 leading-tight">
                ข่าวสาร & เทรนด์วันนี้
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 capitalize">
                {dateLabel}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
            <Sparkles className="h-3 w-3" /> อัปเดตโดย AI
          </Badge>
        </div>
      </header>

      {/* Category filter */}
      {categories.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                activeCat === c
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
        </div>
      )}

      {/* Featured */}
      {!isLoading && featured && (
        <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card hover:shadow-elevated transition-all">
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-0">
            <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 sm:p-10 flex items-center justify-center min-h-[220px]">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.4),transparent_60%)]" />
              <span className="relative text-[120px] leading-none drop-shadow-sm">{featured.emoji}</span>
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider w-fit">
                <Sparkles className="h-3 w-3" /> {featured.category}
              </div>
              <h2 className="mt-3 text-xl sm:text-2xl font-bold leading-snug tracking-tight">
                {featured.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4">
                {featured.body}
              </p>
              {featured.source_url && safeHref(featured.source_url) && (
                <a
                  href={safeHref(featured.source_url)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-fit"
                >
                  <Button size="sm" className="gap-1.5">
                    อ่านบทความเต็มที่ {featured.source ?? "แหล่งอ้างอิง"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </article>
      )}

      {/* Grid */}
      {!isLoading && rest.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              เทรนด์อื่นๆ วันนี้
            </h3>
            <span className="text-[11px] text-muted-foreground">{rest.length} บทความ</span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rest.map((t, i) => {
              const href = safeHref(t.source_url);
              const Wrapper: React.ElementType = href ? "a" : "div";
              const wrapperProps = href
                ? { href, target: "_blank", rel: "noopener noreferrer" }
                : {};
              return (
                <Wrapper
                  key={`${i}-${t.title}`}
                  {...wrapperProps}
                  className="group block overflow-hidden rounded-xl border border-border bg-card hover:shadow-elevated hover:-translate-y-1 hover:border-primary/40 transition-all"
                >
                  <div className="relative h-28 bg-gradient-to-br from-primary/15 via-primary-soft/40 to-card flex items-center justify-center overflow-hidden">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                      {t.emoji}
                    </span>
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-card/90 backdrop-blur text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-border">
                      {t.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {t.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {t.body}
                    </p>
                    {t.source && (
                      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground font-medium truncate">
                          {t.source}
                        </span>
                        {href && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        )}
                      </div>
                    )}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </section>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          ยังไม่มีข่าวสารในหมวดนี้
        </div>
      )}

      {data?.date && (
        <p className="text-center text-[11px] text-muted-foreground/70 pt-2 flex items-center justify-center gap-1.5">
          <Loader2 className="h-3 w-3" /> เนื้อหาอัปเดตอัตโนมัติทุก 6 ชั่วโมง · powered by So1o AI
        </p>
      )}
    </div>
  );
}
