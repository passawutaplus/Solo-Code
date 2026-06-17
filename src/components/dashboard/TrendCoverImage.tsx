import * as React from "react";
import { safeHref } from "@/lib/security";
import type { DailyTrendItem } from "@/lib/dailyTrends.types";
import { TrendIcon } from "@/lib/trendIcons";

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

  const iconSize = variant === "featured" ? "xl" : variant === "thumb" ? "xs" : "lg";

  return (
    <TrendIcon
      category={item.category}
      iconKey={item.iconKey}
      size={iconSize}
      variant="soft"
      className={className}
    />
  );
}
