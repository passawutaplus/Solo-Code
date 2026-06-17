import * as React from "react";
import { ExternalLink } from "lucide-react";
import { safeHref } from "@/lib/security";
import type { DailyTrendItem } from "@/lib/dailyTrends.types";
import { TrendCoverImage } from "@/components/dashboard/TrendCoverImage";
import { TrendSourceFavicon } from "./TrendSourceFavicon";

export function TrendGridCard({ item, index }: { item: DailyTrendItem; index: number }) {
  const href = safeHref(item.source_url);
  const Wrapper: React.ElementType = href ? "a" : "div";
  const wrapperProps = href ? { href, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Wrapper
      key={`${index}-${item.title}`}
      {...wrapperProps}
      className="group block overflow-hidden rounded-xl border border-border bg-card hover:shadow-elevated hover:-translate-y-1 hover:border-primary/40 transition-all"
    >
      <div className="relative h-28 bg-gradient-to-br from-primary/15 via-primary-soft/40 to-card flex items-center justify-center overflow-hidden">
        {item.image_url && safeHref(item.image_url) ? (
          <TrendCoverImage
            item={item}
            variant="card"
            className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <TrendCoverImage
            item={item}
            variant="card"
            className="group-hover:scale-110 transition-transform duration-300"
          />
        )}
        <span className="absolute top-2.5 left-2.5 rounded-full bg-card/90 backdrop-blur text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-border">
          {item.category}
        </span>
      </div>
      <div className="p-4">
        <h4 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h4>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {item.body}
        </p>
        {item.source && (
          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground font-medium truncate inline-flex items-center gap-1.5">
              {item.source_url && <TrendSourceFavicon url={item.source_url} size={16} />}
              {item.source}
            </span>
            {href && (
              <ExternalLink
                className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                aria-hidden
              />
            )}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
