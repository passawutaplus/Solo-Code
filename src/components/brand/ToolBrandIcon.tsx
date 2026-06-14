import * as React from "react";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFaviconUrl } from "@/lib/favicon";
import { thesvgIconUrl } from "@/lib/thesvgIcon";
import {
  getCreativeToolById,
  resolveCreativeTool,
  type CreativeToolMeta,
} from "@/data/creativeTools";

type Props = {
  /** Catalog id, display name, or alias — resolved via creativeTools catalog */
  tool: string | CreativeToolMeta;
  size?: number;
  className?: string;
  title?: string;
};

/**
 * Brand icon for creative tools — theSVG CDN first, Google favicon fallback, Lucide last.
 * Shared with an1hem profile "เครื่องมือและเทคโนโลยี" (vendored to Anthem-Code).
 */
export function ToolBrandIcon({ tool, size = 20, className, title }: Props) {
  const meta = typeof tool === "string"
    ? (getCreativeToolById(tool) ?? resolveCreativeTool(tool))
    : tool;

  const label = title ?? meta?.name ?? (typeof tool === "string" ? tool : tool.name);
  const thesvgSrc = meta?.thesvgSlug ? thesvgIconUrl(meta.thesvgSlug) : null;
  const faviconSrc = meta?.domain ? getFaviconUrl(meta.domain, 64) : null;
  const primarySrc = thesvgSrc ?? faviconSrc;
  const fallbackSrc = thesvgSrc && faviconSrc ? faviconSrc : null;

  const [src, setSrc] = React.useState(primarySrc);
  const [broken, setBroken] = React.useState(false);

  React.useEffect(() => {
    setSrc(primarySrc);
    setBroken(false);
  }, [primarySrc, meta?.id]);

  if (!meta || broken || !src) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
          className,
        )}
        style={{ width: size, height: size }}
        title={label}
        aria-hidden={!title}
      >
        <Wrench style={{ width: size * 0.55, height: size * 0.55 }} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      title={label}
      className={cn("shrink-0 rounded-md object-contain", className)}
      onError={() => {
        if (fallbackSrc && src !== fallbackSrc) {
          setSrc(fallbackSrc);
          return;
        }
        setBroken(true);
      }}
    />
  );
}
