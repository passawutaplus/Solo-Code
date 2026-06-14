/** theSVG CDN — https://thesvg.org (MIT tooling; brand marks belong to owners). */
export const THESVG_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";

export type TheSvgVariant = "default" | "light" | "dark" | "mono" | "color" | "wordmark";

export function thesvgIconUrl(slug: string, variant: TheSvgVariant = "default"): string {
  const safe = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  return `${THESVG_CDN_BASE}/${safe}/${variant}.svg`;
}
