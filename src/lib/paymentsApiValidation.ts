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
