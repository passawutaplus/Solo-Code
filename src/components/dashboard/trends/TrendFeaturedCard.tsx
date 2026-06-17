import { Sparkles, ArrowRight } from "lucide-react";
import { safeHref } from "@/lib/security";
import type { DailyTrendItem } from "@/lib/dailyTrends.types";
import { Button } from "@/components/ui/button";
import { TrendCoverImage } from "@/components/dashboard/TrendCoverImage";
import { TrendSourceFavicon } from "./TrendSourceFavicon";

export function TrendFeaturedCard({ item }: { item: DailyTrendItem }) {
  const sourceHref = item.source_url ? safeHref(item.source_url) : null;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card hover:shadow-elevated transition-all">
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-0">
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center min-h-[220px] overflow-hidden">
          {item.image_url && safeHref(item.image_url) ? (
            <>
              <TrendCoverImage
                item={item}
                variant="featured"
                className="absolute inset-0 w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.4),transparent_60%)]" />
              <TrendCoverImage item={item} variant="featured" className="relative" />
            </>
          )}
        </div>
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider w-fit">
            <Sparkles className="h-3 w-3" aria-hidden />
            {item.category}
          </div>
          <h2 className="mt-3 text-xl sm:text-2xl font-bold leading-snug tracking-tight">
            {item.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4">
            {item.body}
          </p>
          {sourceHref && (
            <a href={sourceHref} target="_blank" rel="noopener noreferrer" className="mt-5 w-fit">
              <Button size="sm" className="gap-1.5">
                <TrendSourceFavicon url={item.source_url!} />
                อ่านบทความเต็มที่ {item.source ?? "แหล่งอ้างอิง"}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
