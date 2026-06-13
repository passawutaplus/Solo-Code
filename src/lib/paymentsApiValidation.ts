import { z } from "zod";

export const paymentsEnvSchema = z.enum(["sandbox", "live"]);

export const checkoutApiInput = z.object({
  priceId: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/),
  environment: paymentsEnvSchema.optional(),
  successUrl: z.string().url().max(500),
  cancelUrl: z.string().url().max(500),
  quantity: z.number().int().min(1).max(50).optional(),
});

export const connectOnboardApiInput = z.object({
  environment: paymentsEnvSchema.optional(),
  returnUrl: z.string().url().max(500),
  refreshUrl: z.string().url().max(500),
});

export const cashoutProcessApiInput = z.object({
  cashoutId: z.string().uuid(),
  environment: paymentsEnvSchema.optional(),
});

export function parseCheckoutApiBody(body: unknown) {
  return checkoutApiInput.parse(body);
}

export function parseConnectOnboardApiBody(body: unknown) {
  return connectOnboardApiInput.parse(body);
}

export function parseCashoutProcessApiBody(body: unknown) {
  return cashoutProcessApiInput.parse(body);
}

const STATIC_ALLOWED_ORIGINS = [
  "https://solofreelancer.com",
  "https://www.solofreelancer.com",
  "https://so1o-freelancer-managment.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
] as const;

const LOVABLE_PREVIEW_ORIGIN_RE =
  /^https:\/\/([a-z0-9-]+\.)*lovable\.app$/i;

/** Origins permitted for Stripe checkout / portal / Connect redirect URLs. */
export function getAllowedPaymentRedirectOrigins(): string[] {
  const origins = new Set<string>(STATIC_ALLOWED_ORIGINS);

  for (const key of ["SITE_URL", "VITE_SITE_URL"] as const) {
    const raw = process.env[key]?.trim();
    if (!raw) continue;
    try {
      origins.add(new URL(raw).origin);
    } catch {
      /* ignore invalid env */
    }
  }

  const extra = process.env.PAYMENT_REDIRECT_ORIGINS_EXTRA?.trim();
  if (extra) {
    for (const part of extra.split(/[\s,]+/)) {
      const p = part.trim();
      if (!p) continue;
      try {
        origins.add(p.includes("://") ? new URL(p).origin : new URL(`https://${p}`).origin);
      } catch {
        /* ignore */
      }
    }
  }

  return [...origins];
}

function isAllowedPaymentRedirectOrigin(origin: string): boolean {
  if (getAllowedPaymentRedirectOrigins().includes(origin)) return true;
  return LOVABLE_PREVIEW_ORIGIN_RE.test(origin);
}

/**
 * Validate Stripe redirect URLs — blocks open redirects to attacker domains.
 * Returns normalized URL string or throws.
 */
export function assertAllowedPaymentRedirectUrl(raw: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new Error("Invalid redirect URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Redirect URL must use http or https");
  }

  if (parsed.protocol === "http:" && !parsed.hostname.match(/^(localhost|127\.0\.0\.1)$/)) {
    throw new Error("Insecure redirect URL");
  }

  if (!isAllowedPaymentRedirectOrigin(parsed.origin)) {
    throw new Error("Redirect URL origin not allowed");
  }

  return parsed.toString();
}

/** Same allowlist as payment redirects — used for payment REST API CORS. */
export function getPaymentApiCorsOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  try {
    const origin = new URL(requestOrigin).origin;
    return isAllowedPaymentRedirectOrigin(origin) ? origin : null;
  } catch {
    return null;
  }
}

export function paymentApiCorsHeaders(request: Request): Record<string, string> {
  const origin = getPaymentApiCorsOrigin(request.headers.get("Origin"));
  const base: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    Vary: "Origin",
  };
  if (origin) {
    base["Access-Control-Allow-Origin"] = origin;
  }
  return base;
}
