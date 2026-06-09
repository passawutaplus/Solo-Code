import * as React from "react";
import { safeHref } from "@/lib/security";
import type { DailyTrendItem } from "@/lib/dailyTrends.types";

interface TrendCoverImageProps {
  item: DailyTrendItem;
  variant?: "featured" | "card" | "thumb";
  className?: string;
}

export function TrendCoverImage({ item, variant = "card", className = "" }: TrendCoverImageProps) {
  const src = item.image_url ? safeHref(item.image_url) : null;
  const [broken, setBroken] = React.useState(false);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        className={`object-cover ${className}`}
        onError={() => setBroken(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  const emojiSize =
    variant === "featured" ? "text-[120px]" : variant === "thumb" ? "text-lg" : "text-5xl";

  return (
    <span
      className={`flex items-center justify-center leading-none drop-shadow-sm ${emojiSize} ${className}`}
    >
      {item.emoji ?? "📰"}
    </span>
  );
}
