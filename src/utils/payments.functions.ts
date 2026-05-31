import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";
import { isOneTimePrice } from "@/lib/stripe";

type CheckoutResult = { url: string } | { error: string };
type PortalResult = { url: string } | { error: string };

const envSchema = z.enum(["sandbox", "live"]);

const checkoutInput = z.object({
  priceId: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/),
  environment: envSchema,
  successUrl: z.string().url().max(500),
  cancelUrl: z.string().url().max(500),
  quantity: z.number().int().min(1).max(50).optional(),
});

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  userId: string,
  email: string | undefined,
): Promise<string> {
  const found = await stripe.customers.search({
    query: `metadata['userId']:'${userId}'`,
    limit: 1,
  });
  if (found.data[0]) return found.data[0].id;

  const created = await stripe.customers.create({
    ...(email ? { email } : {}),
    metadata: { userId },
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => checkoutInput.parse(data))
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const { userId, supabase } = context;
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email ?? undefined;

      const stripe = createStripeClient(data.environment);

      const prices = await stripe.prices.list({
        lookup_keys: [data.priceId],
        active: true,
        limit: 1,
      });
      const stripePrice = prices.data[0];
      if (!stripePrice) {
        return { error: `Price not found: ${data.priceId}` };
      }

      const customerId = await resolveOrCreateCustomer(stripe, userId, email);

      const oneTime = isOneTimePrice(data.priceId);
      const quantity = data.quantity ?? 1;

      const session = await stripe.checkout.sessions.create({
        mode: oneTime ? "payment" : "subscription",
        customer: customerId,
        line_items: [{ price: stripePrice.id, quantity }],
        allow_promotion_codes: true,
        automatic_tax: { enabled: true },
        customer_update: { address: "auto", name: "auto" },
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        client_reference_id: userId,
        metadata: {
          userId,
          priceId: data.priceId,
          quantity: String(quantity),
          ...(oneTime ? { kind: "credits" } : { kind: "subscription" }),
        },
        ...(oneTime
          ? {
              payment_intent_data: {
                metadata: { userId, priceId: data.priceId, kind: "credits" },
              },
            }
          : {
              subscription_data: {
                metadata: { userId, priceId: data.priceId },
              },
            }),
      });

      if (!session.url) return { error: "Checkout session has no URL" };
      return { url: session.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        environment: envSchema,
        returnUrl: z.string().url().max(500),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<PortalResult> => {
    try {
      const { supabase, userId } = context;
      const { data: sub, error } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .eq("environment", data.environment)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !sub?.stripe_customer_id) {
        return { error: "ไม่พบข้อมูลการสมัครสมาชิก — กรุณาสมัคร Pro ก่อน" };
      }

      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: data.returnUrl,
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
