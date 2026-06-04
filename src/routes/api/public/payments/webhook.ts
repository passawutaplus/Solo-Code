import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook, createStripeClient } from "@/lib/stripe.server";
import { CREDITS_PER_PRICE } from "@/lib/stripe";
import { syncAnthemFromSo1oUserFull } from "@/lib/ecosystemSync.server";

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

function resolvePriceId(item: any): string {
  return (
    item?.price?.lookup_key ||
    item?.price?.metadata?.lovable_external_id ||
    item?.price?.id ||
    "unknown"
  );
}

function tsToIso(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

async function getUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await getSupabase().auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

async function enqueueEmail(opts: {
  userId: string;
  templateName: string;
  templateData?: Record<string, any>;
  idempotencyKey: string;
}) {
  try {
    const email = await getUserEmail(opts.userId);
    if (!email) return;
    const sb = getSupabase();
    // Check suppression
    const { data: sup } = await sb
      .from("suppressed_emails")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (sup) return;

    // Get or create unsubscribe token
    let token: string;
    const { data: existing } = await sb
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (existing?.token) {
      token = existing.token;
    } else {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      token = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      await sb.from("email_unsubscribe_tokens").upsert(
        { token, email: email.toLowerCase() },
        { onConflict: "email", ignoreDuplicates: true },
      );
    }

    const messageId = crypto.randomUUID();
    const { TEMPLATES } = await import("@/lib/email-templates/registry");
    const tpl = TEMPLATES[opts.templateName];
    if (!tpl) {
      console.error("[webhook-email] template missing:", opts.templateName);
      return;
    }
    const React = await import("react");
    const { render } = await import("@react-email/components");
    const element = React.createElement(tpl.component, opts.templateData ?? {});
    const html = await render(element);
    const text = await render(element, { plainText: true });
    const subject =
      typeof tpl.subject === "function" ? tpl.subject(opts.templateData ?? {}) : tpl.subject;

    await sb.from("email_send_log").insert({
      message_id: messageId,
      template_name: opts.templateName,
      recipient_email: email,
      status: "pending",
    });

    await sb.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to: email,
        from: "So1o Freelancer <noreply@solofreelancer.com>",
        sender_domain: "notify.solofreelancer.com",
        subject,
        html,
        text,
        purpose: "transactional",
        label: opts.templateName,
        idempotency_key: opts.idempotencyKey,
        unsubscribe_token: token,
        queued_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[webhook-email] enqueue failed:", err);
  }
}

async function logPaymentNotification(opts: {
  userId: string | null;
  eventType: string;
  env: StripeEnv;
  amountCents?: number | null;
  currency?: string | null;
  priceId?: string | null;
  message: string;
  metadata?: Record<string, any>;
}) {
  await getSupabase().from("payment_notifications").insert({
    user_id: opts.userId,
    event_type: opts.eventType,
    environment: opts.env,
    amount_cents: opts.amountCents ?? null,
    currency: opts.currency ?? null,
    price_id: opts.priceId ?? null,
    message: opts.message,
    metadata: opts.metadata ?? {},
  });
}

async function syncTier(userId: string) {
  const sb = getSupabase();
  await sb.rpc("sync_user_tier", { _user_id: userId });
  await syncAnthemFromSo1oUserFull(sb, userId);
}

async function handleSubscriptionUpsert(
  subscription: any,
  env: StripeEnv,
  isCreation: boolean,
) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("[stripe-webhook] No userId on subscription", subscription.id);
    return;
  }

  const item = subscription.items?.data?.[0];
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  const priceId = resolvePriceId(item);

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: item?.price?.product ?? "unknown",
      price_id: priceId,
      status: subscription.status,
      current_period_start: tsToIso(periodStart),
      current_period_end: tsToIso(periodEnd),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  await syncTier(userId);

  if (isCreation && (subscription.status === "active" || subscription.status === "trialing")) {
    await enqueueEmail({
      userId,
      templateName: "welcome-pro",
      templateData: { priceId, environment: env },
      idempotencyKey: `welcome-${subscription.id}`,
    });
    await logPaymentNotification({
      userId,
      eventType: "subscription.created",
      env,
      priceId,
      message: `สมัครแพ็กเกจ ${priceId} สำเร็จ`,
    });
  } else if (subscription.status === "past_due") {
    await enqueueEmail({
      userId,
      templateName: "subscription-past-due",
      templateData: { priceId },
      idempotencyKey: `past-due-${subscription.id}-${periodEnd ?? "x"}`,
    });
    await logPaymentNotification({
      userId,
      eventType: "subscription.past_due",
      env,
      priceId,
      message: `บัตรเครดิตถูกปฏิเสธสำหรับ ${priceId}`,
    });
  } else if (subscription.cancel_at_period_end) {
    await logPaymentNotification({
      userId,
      eventType: "subscription.scheduled_cancel",
      env,
      priceId,
      message: `กำหนดยกเลิก ${priceId} เมื่อสิ้นรอบบิล`,
    });
  }
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  await getSupabase()
    .from("subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);

  if (userId) {
    await syncTier(userId);
    await enqueueEmail({
      userId,
      templateName: "subscription-canceled",
      templateData: { endsAt: tsToIso(subscription.current_period_end) },
      idempotencyKey: `canceled-${subscription.id}`,
    });
    await logPaymentNotification({
      userId,
      eventType: "subscription.deleted",
      env,
      message: `ยกเลิก subscription เรียบร้อย`,
    });
  }
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  // Only top-up credits (one-time payments) need handling here.
  // Subscriptions get persisted via customer.subscription.created.
  if (session.mode !== "payment") return;
  const userId = session.metadata?.userId || session.client_reference_id;
  const priceId = session.metadata?.priceId;
  if (!userId || !priceId) {
    console.warn("[stripe-webhook] checkout.session.completed missing metadata", session.id);
    return;
  }

  const credits = CREDITS_PER_PRICE[priceId];
  if (!credits) {
    console.warn("[stripe-webhook] Unknown credit price:", priceId);
    return;
  }

  // Atomic add via upsert with .rpc would be ideal; do read-modify-write for now.
  const sb = getSupabase();
  const { data: existing } = await sb
    .from("user_credits")
    .select("balance, lifetime_purchased")
    .eq("user_id", userId)
    .eq("environment", env)
    .maybeSingle();

  const newBalance = (existing?.balance ?? 0) + credits;
  const newLifetime = (existing?.lifetime_purchased ?? 0) + credits;

  await sb.from("user_credits").upsert(
    {
      user_id: userId,
      environment: env,
      balance: newBalance,
      lifetime_purchased: newLifetime,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,environment" },
  );

  await enqueueEmail({
    userId,
    templateName: "credits-topup",
    templateData: { credits, balance: newBalance, priceId },
    idempotencyKey: `credits-${session.id}`,
  });

  await logPaymentNotification({
    userId,
    eventType: "credits.purchased",
    env,
    amountCents: session.amount_total ?? null,
    currency: session.currency ?? null,
    priceId,
    message: `เติมเครดิต +${credits} (ยอดรวม ${newBalance})`,
  });
}

async function handleInvoicePaymentSucceeded(invoice: any, env: StripeEnv) {
  // Skip first invoice — welcome email covers that already.
  if (invoice.billing_reason === "subscription_create") return;
  // Lookup user via subscription metadata
  const subId = invoice.subscription;
  if (!subId) return;
  try {
    const stripe = createStripeClient(env);
    const sub = await stripe.subscriptions.retrieve(subId);
    const userId = sub.metadata?.userId;
    if (!userId) return;
    await enqueueEmail({
      userId,
      templateName: "payment-receipt",
      templateData: {
        amount: ((invoice.amount_paid ?? 0) / 100).toFixed(2),
        currency: (invoice.currency ?? "thb").toUpperCase(),
        nextBillingDate: tsToIso(invoice.period_end),
        invoiceUrl: invoice.hosted_invoice_url ?? null,
      },
      idempotencyKey: `receipt-${invoice.id}`,
    });
    await logPaymentNotification({
      userId,
      eventType: "invoice.paid",
      env,
      amountCents: invoice.amount_paid ?? null,
      currency: invoice.currency ?? null,
      message: `ชำระเงินรอบบิลสำเร็จ`,
    });
  } catch (err) {
    console.error("[stripe-webhook] invoice.paid lookup failed:", err);
  }
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionUpsert(event.data.object, env, true);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpsert(event.data.object, env, false);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env);
      break;
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object, env);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object, env);
      break;
    case "invoice.payment_failed":
      console.log("[stripe-webhook] invoice.payment_failed — handled via subscription.updated");
      break;
    default:
      console.log("[stripe-webhook] unhandled:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("[stripe-webhook] invalid env:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("[stripe-webhook] error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
