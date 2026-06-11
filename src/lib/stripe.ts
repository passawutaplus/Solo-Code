// Client-safe Stripe helpers
export type StripeEnv = "sandbox" | "live";

/**
 * Determine which Stripe environment to use from the client.
 * Lovable injects VITE_PAYMENTS_CLIENT_TOKEN — `pk_test_*` in preview/dev,
 * `pk_live_*` in published production.
 */
export function getStripeEnvironment(): StripeEnv {
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
} as const;

export type PriceId = (typeof PRICE_IDS)[keyof typeof PRICE_IDS];

/** Credits granted per top-up SKU. Keep in sync with Stripe products. */
export const CREDITS_PER_PRICE: Record<string, number> = {
  credits_100: 100,
  credits_500: 500,
  credits_2000: 2000,
};

export function isOneTimePrice(priceId: string): boolean {
  return priceId.startsWith("credits_");
}
