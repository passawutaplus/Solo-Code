// Client-safe Stripe helpers
export type StripeEnv = "sandbox" | "live";

/**
 * Determine which Stripe environment to use from the client.
 * VITE_STRIPE_ENV overrides publishable key inference (useful in local dev).
 * Otherwise `pk_live_*` → live, everything else → sandbox.
 */
export function getStripeEnvironment(): StripeEnv {
  const forced = import.meta.env.VITE_STRIPE_ENV as string | undefined;
  if (forced === "sandbox" || forced === "live") return forced;

  const token = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;
  if (token && token.startsWith("pk_live_")) return "live";
  return "sandbox";
}

export const PRICE_IDS = {
  pro_monthly: "pro_monthly",
  pro_yearly: "pro_yearly",
  pro_plus_monthly: "pro_plus_monthly",
  pro_plus_yearly: "pro_plus_yearly",
  inhouse_monthly: "inhouse_monthly",
  inhouse_yearly: "inhouse_yearly",
  credits_100: "credits_100",
  credits_500: "credits_500",
  credits_2000: "credits_2000",
  px_500: "px_500",
  px_2000: "px_2000",
  px_10000: "px_10000",
} as const;

export type PriceId = (typeof PRICE_IDS)[keyof typeof PRICE_IDS];

/** Credits granted per top-up SKU. Keep in sync with Stripe products. */
export const CREDITS_PER_PRICE: Record<string, number> = {
  credits_100: 100,
  credits_500: 500,
  credits_2000: 2000,
};

/** Pixel (PX) granted per top-up SKU. 1 px = 1 THB. */
export const PX_PER_PRICE: Record<string, number> = {
  px_500: 500,
  px_2000: 2000,
  px_10000: 10000,
};

export function isCreditsPrice(priceId: string): boolean {
  return priceId.startsWith("credits_");
}

export function isPxPrice(priceId: string): boolean {
  return priceId.startsWith("px_");
}

export function isOneTimePrice(priceId: string): boolean {
  return isCreditsPrice(priceId) || isPxPrice(priceId);
}

export type CheckoutKind = "subscription" | "credits" | "px";

export function checkoutKind(priceId: string): CheckoutKind {
  if (isPxPrice(priceId)) return "px";
  if (isCreditsPrice(priceId)) return "credits";
  return "subscription";
}
