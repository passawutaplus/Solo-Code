import { createClient } from "@supabase/supabase-js";
import {
  createStripeClient,
  getStripeErrorMessage,
  getStripeSetupError,
  type StripeEnv,
} from "@/lib/stripe.server";
import { getCatalogStripePriceId } from "@/lib/stripeCatalog.server";
import { checkoutKind, isOneTimePrice } from "@/lib/stripe";
import {
  allowedDowngradeTargets,
  allowedUpgradeTargets,
  downgradeTargetPriceId,
  isHigherTier,
  isLowerTier,
  isPaidTier,
  isStripeManagedSubscription,
  tierFromPriceId,
  upgradeTargetPriceId,
  type DowngradeTargetTier,
  type PaidTier,
  type PendingTierChange,
  type SubscriptionDowngradeState,
  type UpgradeTargetTier,
} from "@/lib/subscriptionTiers";
import type Stripe from "stripe";

function getServiceSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function getSharedSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: "shared" } },
  );
}

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

export async function assertAdmin(userId: string): Promise<void> {
  const sb = getServiceSupabase();
  const { data, error } = await sb.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) {
    throw new Error("Forbidden: admin role required");
  }
}

async function resolveStripePrice(
  stripe: ReturnType<typeof createStripeClient>,
  environment: StripeEnv,
  lookupKey: string,
): Promise<Stripe.Price | null> {
  const listed = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });
  if (listed.data[0]) return listed.data[0];

  const catalogPriceId = getCatalogStripePriceId(environment, lookupKey);
  if (!catalogPriceId) return null;

  try {
    const price = await stripe.prices.retrieve(catalogPriceId);
    return price.active ? price : null;
  } catch {
    return null;
  }
}

function clampCheckoutQuantity(quantity?: number): number {
  if (quantity == null || !Number.isFinite(quantity)) return 1;
  return Math.min(Math.max(Math.floor(quantity), 1), 50);
}

async function getConnectAccountIdForEnv(
  sb: ReturnType<typeof getServiceSupabase>,
  userId: string,
  env: StripeEnv,
): Promise<string | null> {
  const { data: profile } = await sb
    .from("profiles")
    .select("stripe_connect_account_id, stripe_connect_accounts")
    .eq("user_id", userId)
    .maybeSingle();
  if (!profile) return null;
  const accounts = profile.stripe_connect_accounts as Record<string, string> | null | undefined;
  if (accounts?.[env]) return accounts[env];
  if (env === "sandbox" && profile.stripe_connect_account_id) {
    return profile.stripe_connect_account_id;
  }
  return null;
}

export async function createCheckoutSessionForUser(opts: {
  userId: string;
  email?: string;
  priceId: string;
  environment: StripeEnv;
  successUrl: string;
  cancelUrl: string;
  quantity?: number;
}): Promise<{ url: string } | { error: string }> {
  try {
    const setupErr = getStripeSetupError(opts.environment);
    if (setupErr) return { error: setupErr };

    const stripe = createStripeClient(opts.environment);
    const stripePrice = await resolveStripePrice(stripe, opts.environment, opts.priceId);
    if (!stripePrice) {
      return {
        error:
          `ไม่พบราคา "${opts.priceId}" ใน Stripe (${opts.environment}) — ` +
          "รัน cd Solo-Code && npm run stripe:sync หลังตั้ง sk_test_ / sk_live_ ให้ถูกต้อง",
      };
    }

    const customerId = await resolveOrCreateCustomer(stripe, opts.userId, opts.email);
    const oneTime = isOneTimePrice(opts.priceId);
    const kind = checkoutKind(opts.priceId);
    const quantity = clampCheckoutQuantity(opts.quantity);

    const session = await stripe.checkout.sessions.create({
      mode: oneTime ? "payment" : "subscription",
      customer: customerId,
      line_items: [{ price: stripePrice.id, quantity }],
      allow_promotion_codes: true,
      ...(opts.environment === "live" ? { automatic_tax: { enabled: true } } : {}),
      customer_update: { address: "auto", name: "auto" },
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
      client_reference_id: opts.userId,
      metadata: {
        userId: opts.userId,
        priceId: opts.priceId,
        quantity: String(quantity),
        kind,
      },
      ...(oneTime
        ? {
            payment_intent_data: {
              metadata: { userId: opts.userId, priceId: opts.priceId, kind },
            },
          }
        : {
            subscription_data: {
              metadata: { userId: opts.userId, priceId: opts.priceId },
            },
          }),
    });

    if (!session.url) return { error: "Checkout session has no URL" };
    return { url: session.url };
  } catch (error) {
    return { error: getStripeErrorMessage(error) };
  }
}

function tsToIso(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

function subscriptionPeriodStart(
  subscription: Stripe.Subscription,
  item?: Stripe.SubscriptionItem | null,
): number | undefined {
  return (item ?? subscription.items?.data?.[0])?.current_period_start;
}

function subscriptionPeriodEnd(
  subscription: Stripe.Subscription,
  item?: Stripe.SubscriptionItem | null,
): number | undefined {
  return (item ?? subscription.items?.data?.[0])?.current_period_end;
}

function resolveStripePriceIdFromItem(item: Stripe.SubscriptionItem | undefined): string {
  const price = item?.price;
  if (!price || typeof price === "string") return "unknown";
  return (
    price.lookup_key ||
    (price.metadata as { lovable_external_id?: string } | undefined)?.lovable_external_id ||
    price.id ||
    "unknown"
  );
}

/** Upsert subscriptions row + sync profile tier from Stripe subscription object. */
export async function upsertSubscriptionRecordFromStripe(
  subscription: Stripe.Subscription,
  env: StripeEnv,
): Promise<string | null> {
  const userId = subscription.metadata?.userId;
  if (!userId) return null;

  const item = subscription.items?.data?.[0];
  const periodStart = subscriptionPeriodStart(subscription, item);
  const periodEnd = subscriptionPeriodEnd(subscription, item);
  const priceId = resolveStripePriceIdFromItem(item);
  const seatQuantity = Math.max(1, Number(item?.quantity) || 1);
  const productId =
    item?.price && typeof item.price !== "string"
      ? (typeof item.price.product === "string" ? item.price.product : item.price.product?.id)
      : "unknown";

  const sb = getServiceSupabase();
  const baseRow = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
    product_id: productId ?? "unknown",
    price_id: priceId,
    status: subscription.status,
    current_period_start: tsToIso(periodStart),
    current_period_end: tsToIso(periodEnd),
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    environment: env,
    updated_at: new Date().toISOString(),
  };

  let { error: upsertError } = await sb
    .from("subscriptions")
    .upsert({ ...baseRow, seat_quantity: seatQuantity }, { onConflict: "stripe_subscription_id" });

  if (upsertError?.message?.includes("seat_quantity")) {
    ({ error: upsertError } = await sb
      .from("subscriptions")
      .upsert(baseRow, { onConflict: "stripe_subscription_id" }));
    if (!upsertError && seatQuantity > 1) {
      await sb.from("profiles").update({ subscription_seats: seatQuantity }).eq("user_id", userId);
    }
  }

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  await sb.rpc("sync_user_tier", { _user_id: userId });
  await sb.rpc("sync_inhouse_org_seat_limit", { _owner_id: userId }).then(({ error }) => {
    if (error && !error.message.includes("does not exist")) {
      console.warn("[stripe] sync_inhouse_org_seat_limit:", error.message);
    }
  });
  const { syncAnthemFromSo1oUserFull } = await import("@/lib/ecosystemSync.server");
  await syncAnthemFromSo1oUserFull(sb, userId);
  return userId;
}

/** Pull active Stripe subscription into DB when webhooks are unavailable (e.g. local dev). */
export async function syncSubscriptionFromStripeForUser(opts: {
  userId: string;
  environment: StripeEnv;
}): Promise<{ synced: true; tier: string } | { synced: false } | { error: string }> {
  try {
    const setupErr = getStripeSetupError(opts.environment);
    if (setupErr) return { error: setupErr };

    const stripe = createStripeClient(opts.environment);
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${opts.userId}'`,
      limit: 1,
    });
    if (!found.data[0]) return { synced: false };

    const list = await stripe.subscriptions.list({
      customer: found.data[0].id,
      status: "all",
      limit: 20,
      expand: ["data.items.data.price"],
    });

    const nowSec = Date.now() / 1000;
    const subscription = list.data
      .filter((sub) => {
        if (["active", "trialing", "past_due"].includes(sub.status)) return true;
        return sub.status === "canceled" && (subscriptionPeriodEnd(sub) ?? 0) > nowSec;
      })
      .sort((a, b) => b.created - a.created)[0];

    if (!subscription) return { synced: false };

    const syncedUserId = await upsertSubscriptionRecordFromStripe(subscription, opts.environment);
    if (!syncedUserId) return { error: "Subscription ไม่มี userId ใน metadata" };

    const sb = getServiceSupabase();
    const { data: profile } = await sb
      .from("profiles")
      .select("subscription_tier")
      .eq("user_id", opts.userId)
      .maybeSingle();

    return { synced: true, tier: profile?.subscription_tier ?? "free" };
  } catch (error) {
    return { error: getStripeErrorMessage(error) };
  }
}

export async function createConnectOnboardingLinkForUser(opts: {
  userId: string;
  email?: string;
  environment: StripeEnv;
  returnUrl: string;
  refreshUrl: string;
}): Promise<{ url: string } | { error: string }> {
  try {
    const stripe = createStripeClient(opts.environment);
    const sb = getServiceSupabase();

    let accountId = await getConnectAccountIdForEnv(sb, opts.userId, opts.environment);

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "TH",
        email: opts.email ?? undefined,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: { userId: opts.userId, environment: opts.environment },
      });
      accountId = account.id;
      await sb.rpc("sync_connect_account", {
        _user_id: opts.userId,
        _account_id: accountId,
        _onboarding_complete: false,
        _payouts_enabled: false,
        _environment: opts.environment,
      });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: opts.refreshUrl,
      return_url: opts.returnUrl,
      type: "account_onboarding",
    });

    if (!link.url) return { error: "Account link has no URL" };
    return { url: link.url };
  } catch (error) {
    return { error: getStripeErrorMessage(error) };
  }
}

export async function processCashoutTransferForAdmin(opts: {
  adminUserId: string;
  cashoutId: string;
  environment: StripeEnv;
}): Promise<{ transferId: string } | { error: string }> {
  try {
    await assertAdmin(opts.adminUserId);

    const sb = getServiceSupabase();
    const shared = getSharedSupabase();
    const { data: row, error } = await shared
      .from("cashout_requests")
      .select("id, user_id, status, net_px, gross_px, environment")
      .eq("id", opts.cashoutId)
      .maybeSingle();

    if (error || !row) return { error: "ไม่พบคำขอถอน" };
    if (row.status !== "pending") {
      return { error: `สถานะไม่รองรับ: ${row.status}` };
    }
    if (row.environment && row.environment !== opts.environment) {
      return { error: `คำขอถอนอยู่ใน environment ${row.environment} ไม่ตรงกับที่เลือก` };
    }

    const claimToken = `claim:${crypto.randomUUID()}`;
    await sb.rpc("mark_cashout_processing", {
      _cashout_id: opts.cashoutId,
      _stripe_transfer_id: claimToken,
    });

    const { data: claimed, error: claimErr } = await shared
      .from("cashout_requests")
      .select("id, user_id, status, net_px, gross_px, stripe_transfer_id")
      .eq("id", opts.cashoutId)
      .maybeSingle();

    if (claimErr || !claimed || claimed.status !== "processing") {
      return { error: "คำขอถอนกำลังดำเนินการอยู่แล้ว" };
    }
    if (claimed.stripe_transfer_id !== claimToken) {
      return { error: "คำขอถอนกำลังดำเนินการอยู่แล้ว" };
    }

    const accountId = await getConnectAccountIdForEnv(sb, row.user_id, opts.environment);
    if (!accountId) {
      return { error: "ผู้ใช้ยังไม่ได้เชื่อม Stripe Connect" };
    }

    const { data: profile } = await sb
      .from("profiles")
      .select("connect_payouts_enabled, connect_onboarding_complete")
      .eq("user_id", row.user_id)
      .maybeSingle();

    if (!profile?.connect_onboarding_complete || !profile.connect_payouts_enabled) {
      return { error: "บัญชี Connect ยังไม่พร้อมรับเงิน" };
    }

    const stripe = createStripeClient(opts.environment);
    const amountSatang = Math.round(claimed.net_px * 100);

    const transfer = await stripe.transfers.create({
      amount: amountSatang,
      currency: "thb",
      destination: accountId,
      metadata: {
        cashoutId: claimed.id,
        userId: claimed.user_id,
        grossPx: String(claimed.gross_px),
        netPx: String(claimed.net_px),
      },
    });

    await sb.rpc("mark_cashout_processing", {
      _cashout_id: claimed.id,
      _stripe_transfer_id: transfer.id,
    });

    return { transferId: transfer.id };
  } catch (error) {
    return { error: getStripeErrorMessage(error) };
  }
}

export async function authenticateBearerToken(
  request: Request,
): Promise<{ userId: string; email?: string } | { error: string; status: number }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "");
  if (!token) return { error: "Unauthorized", status: 401 };

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) {
    return { error: "Invalid token", status: 401 };
  }
  return { userId: data.user.id, email: data.user.email ?? undefined };
}

export const PAYMENTS_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function paymentsJsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: PAYMENTS_CORS_HEADERS });
}

export type { PendingTierChange, SubscriptionDowngradeState } from "@/lib/subscriptionTiers";

export interface ActiveSubscriptionRecord {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  price_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  environment: string;
  seat_quantity?: number | null;
}

async function resolveStripePriceByLookupKey(
  stripe: ReturnType<typeof createStripeClient>,
  lookupKey: string,
): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });
  return prices.data[0] ?? null;
}

function resolveLookupKeyFromPrice(price: Stripe.Price | string): string | null {
  if (typeof price === "string") return null;
  return price.lookup_key || price.metadata?.lovable_external_id || null;
}

function isSubscriptionActive(record: ActiveSubscriptionRecord): boolean {
  const periodEndMs = record.current_period_end
    ? new Date(record.current_period_end).getTime()
    : null;
  const now = Date.now();
  return (
    ["active", "trialing", "past_due"].includes(record.status) &&
    (!periodEndMs || periodEndMs > now)
  );
}

const ACTIVE_SUBSCRIPTION_COLUMNS =
  "id, user_id, stripe_subscription_id, stripe_customer_id, price_id, status, current_period_end, cancel_at_period_end, environment";

export async function getActiveSubscriptionRecord(
  userId: string,
  environment: StripeEnv,
): Promise<ActiveSubscriptionRecord | null> {
  const sb = getServiceSupabase();
  let { data, error } = await sb
    .from("subscriptions")
    .select(`${ACTIVE_SUBSCRIPTION_COLUMNS}, seat_quantity`)
    .eq("user_id", userId)
    .eq("environment", environment)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error?.message?.includes("seat_quantity")) {
    ({ data, error } = await sb
      .from("subscriptions")
      .select(ACTIVE_SUBSCRIPTION_COLUMNS)
      .eq("user_id", userId)
      .eq("environment", environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle());
  }

  if (error || !data) return null;
  const record = data as ActiveSubscriptionRecord;
  if (!isSubscriptionActive(record)) return null;
  return record;
}

async function releaseSubscriptionScheduleIfAny(
  stripe: ReturnType<typeof createStripeClient>,
  subscriptionId: string,
): Promise<void> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const scheduleId = sub.schedule;
  if (scheduleId && typeof scheduleId === "string") {
    await stripe.subscriptionSchedules.release(scheduleId);
  }
}

async function readPendingTierChange(
  stripe: ReturnType<typeof createStripeClient>,
  subscriptionId: string,
  currentPriceId: string,
): Promise<PendingTierChange | null> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const scheduleId = sub.schedule;
  if (!scheduleId || typeof scheduleId !== "string") return null;

  const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
  if (schedule.phases.length < 2) return null;

  const nextPhase = schedule.phases[1];
  const nextItem = nextPhase.items[0];
  if (!nextItem?.price) return null;

  const price =
    typeof nextItem.price === "string"
      ? await stripe.prices.retrieve(nextItem.price)
      : nextItem.price;

  if ("deleted" in price && price.deleted) return null;

  const targetPriceId = resolveLookupKeyFromPrice(price) ?? price.id;
  if (targetPriceId === currentPriceId) return null;

  const targetTier = tierFromPriceId(targetPriceId);
  if (!isPaidTier(targetTier) || targetTier === "inhouse") return null;

  const effectiveAt = nextPhase.start_date
    ? new Date(nextPhase.start_date * 1000).toISOString()
    : null;
  if (!effectiveAt) return null;

  return {
    targetTier: targetTier as DowngradeTargetTier,
    targetPriceId,
    effectiveAt,
  };
}

export async function getSubscriptionDowngradeStateForUser(opts: {
  userId: string;
  environment: StripeEnv;
}): Promise<SubscriptionDowngradeState | { error: string }> {
  try {
    const record = await getActiveSubscriptionRecord(opts.userId, opts.environment);
    if (!record) {
      return { error: "ไม่พบ subscription ที่ใช้งานอยู่" };
    }

    const tier = tierFromPriceId(record.price_id);
    if (!isPaidTier(tier)) {
      return { error: "ไม่มีแพ็กที่สามารถ downgrade ได้" };
    }

    const stripe = createStripeClient(opts.environment);
    const pendingTierChange = await readPendingTierChange(
      stripe,
      record.stripe_subscription_id,
      record.price_id,
    );

    return {
      tier,
      priceId: record.price_id,
      cancelAtPeriodEnd: record.cancel_at_period_end,
      currentPeriodEnd: record.current_period_end,
      downgradeTargets: allowedDowngradeTargets(tier),
      pendingTierChange,
    };
  } catch (error) {
    return { error: getStripeErrorMessage(error) };
  }
}

export async function scheduleSubscriptionCancelForUser(opts: {
  userId: string;
  environment: StripeEnv;
}): Promise<{ ok: true } | { error: string }> {
  try {
    const record = await getActiveSubscriptionRecord(opts.userId, opts.environment);
    if (!record) return { error: "ไม่พบ subscription ที่ใช้งานอยู่" };

    const stripe = createStripeClient(opts.environment);
    await releaseSubscriptionScheduleIfAny(stripe, record.stripe_subscription_id);

    await stripe.subscriptions.update(record.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    return { ok: true };
  } catch (error) {
    return { error: getStripeErrorMessage(error) };
  }
}

export async function resumeSubscriptionForUser(opts: {
  userId: string;
  environment: StripeEnv;
}): Promise<{ ok: true } | { error: string }> {
  try {
    const record = await getActiveSubscriptionRecord(opts.userId, opts.environment);
    if (!record) return { error: "ไม่พบ subscription ที่ใช้งานอยู่" };

    const stripe = createStripeClient(opts.environment);
    await releaseSubscriptionScheduleIfAny(stripe, record.stripe_subscription_id);

    await stripe.subscriptions.update(record.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    return { ok: true };
  } catch (error) {
    return { error: getStripeErrorMessage(error) };
  }
}

export async function upgradeSubscriptionTierForUser(opts: {
  userId: string;
  environment: StripeEnv;
  targetTier: UpgradeTargetTier;
  quantity?: number;
}): Promise<{ ok: true; tier: string } | { error: string }> {
  try {
    const setupErr = getStripeSetupError(opts.environment);
    if (setupErr) return { error: setupErr };

    const record = await getActiveSubscriptionRecord(opts.userId, opts.environment);
    if (!record) return { error: "ไม่พบ subscription ที่ใช้งานอยู่" };
    if (!isStripeManagedSubscription(record.stripe_subscription_id)) {
      return { error: "แพ็กนี้จัดการโดยแอดมิน — ติดต่อทีมเพื่อเปลี่ยนแพ็ก" };
    }
    if (record.cancel_at_period_end) {
      return { error: "ยกเลิกการ downgrade เป็น Free ก่อน แล้วค่อยอัปเกรด" };
    }

    const currentTier = tierFromPriceId(record.price_id);
    if (!isPaidTier(currentTier)) {
      return { error: "ไม่มีแพ็กที่สามารถอัปเกรดได้" };
    }
    if (!isHigherTier(currentTier, opts.targetTier)) {
      return { error: "แพ็กเป้าหมายต้องสูงกว่าแพ็กปัจจุบัน" };
    }
    if (!allowedUpgradeTargets(currentTier).includes(opts.targetTier)) {
      return { error: "ไม่สามารถอัปเกรดไปแพ็กนี้ได้" };
    }

    const targetLookupKey = upgradeTargetPriceId(record.price_id, opts.targetTier);
    const stripe = createStripeClient(opts.environment);

    const [currentPrice, targetPrice] = await Promise.all([
      resolveStripePriceByLookupKey(stripe, record.price_id),
      resolveStripePrice(stripe, opts.environment, targetLookupKey),
    ]);

    if (!currentPrice) return { error: `ไม่พบราคา: ${record.price_id}` };
    if (!targetPrice) return { error: `ไม่พบราคา: ${targetLookupKey}` };

    const stripeSub = await stripe.subscriptions.retrieve(record.stripe_subscription_id, {
      expand: ["items.data.price"],
    });
    const item = stripeSub.items.data[0];
    if (!item) return { error: "ไม่พบรายการ subscription" };

    await releaseSubscriptionScheduleIfAny(stripe, record.stripe_subscription_id);

    const currentQty = Math.max(1, item.quantity ?? record.seat_quantity ?? 1);
    const nextQty =
      opts.targetTier === "inhouse"
        ? Math.max(2, Math.min(50, opts.quantity ?? currentQty))
        : 1;

    const updated = await stripe.subscriptions.update(record.stripe_subscription_id, {
      items: [{ id: item.id, price: targetPrice.id, quantity: nextQty }],
      proration_behavior: "always_invoice",
      cancel_at_period_end: false,
      metadata: {
        ...stripeSub.metadata,
        userId: opts.userId,
        priceId: targetLookupKey,
      },
    });

    const refreshed = await stripe.subscriptions.retrieve(updated.id, {
      expand: ["items.data.price"],
    });
    await upsertSubscriptionRecordFromStripe(refreshed, opts.environment);

    const sb = getServiceSupabase();
    const { data: profile } = await sb
      .from("profiles")
      .select("subscription_tier")
      .eq("user_id", opts.userId)
      .maybeSingle();

    return { ok: true, tier: profile?.subscription_tier ?? opts.targetTier };
  } catch (error) {
    return { error: getStripeErrorMessage(error) };
  }
}

export async function scheduleSubscriptionTierDowngradeForUser(opts: {
  userId: string;
  environment: StripeEnv;
  targetTier: DowngradeTargetTier;
}): Promise<{ ok: true; effectiveAt: string } | { error: string }> {
  try {
    const record = await getActiveSubscriptionRecord(opts.userId, opts.environment);
    if (!record) return { error: "ไม่พบ subscription ที่ใช้งานอยู่" };
    if (record.cancel_at_period_end) {
      return { error: "ยกเลิกการ downgrade เป็น Free ก่อน หรือกดยกเลิกการ downgrade" };
    }

    const currentTier = tierFromPriceId(record.price_id);
    if (!isPaidTier(currentTier)) {
      return { error: "ไม่มีแพ็กที่สามารถ downgrade ได้" };
    }
    if (!isLowerTier(currentTier, opts.targetTier)) {
      return { error: "แพ็กเป้าหมายต้องต่ำกว่าแพ็กปัจจุบัน" };
    }
    if (!allowedDowngradeTargets(currentTier).includes(opts.targetTier)) {
      return { error: "ไม่สามารถ downgrade ไปแพ็กนี้ได้" };
    }

    const targetLookupKey = downgradeTargetPriceId(record.price_id, opts.targetTier);
    const stripe = createStripeClient(opts.environment);

    const [currentPrice, targetPrice] = await Promise.all([
      resolveStripePrice(stripe, opts.environment, record.price_id),
      resolveStripePrice(stripe, opts.environment, targetLookupKey),
    ]);

    if (!currentPrice) return { error: `ไม่พบราคา: ${record.price_id}` };
    if (!targetPrice) return { error: `ไม่พบราคา: ${targetLookupKey}` };

    const stripeSub = await stripe.subscriptions.retrieve(record.stripe_subscription_id, {
      expand: ["items.data.price"],
    });
    const item = stripeSub.items.data[0];
    if (!item) return { error: "ไม่พบรายการ subscription" };

    const periodEnd =
      subscriptionPeriodEnd(stripeSub, item) ?? Math.floor(Date.now() / 1000) + 86400;

    await releaseSubscriptionScheduleIfAny(stripe, record.stripe_subscription_id);

    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: record.stripe_subscription_id,
    });

    const currentQty = Math.max(1, item.quantity ?? record.seat_quantity ?? 1);
    const nextQty = opts.targetTier === "pro" || opts.targetTier === "pro_plus" ? 1 : currentQty;

    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: "release",
      phases: [
        {
          items: [{ price: currentPrice.id, quantity: currentQty }],
          start_date: schedule.phases[0].start_date,
          end_date: periodEnd,
        },
        {
          items: [{ price: targetPrice.id, quantity: nextQty }],
        },
      ],
    });

    return {
      ok: true,
      effectiveAt: new Date(periodEnd * 1000).toISOString(),
    };
  } catch (error) {
    return { error: getStripeErrorMessage(error) };
  }
}

export async function syncConnectAccountFromStripe(
  account: {
    id: string;
    metadata?: { userId?: string; environment?: string };
    details_submitted?: boolean;
    payouts_enabled?: boolean;
  },
  env: StripeEnv,
) {
  const userId = account.metadata?.userId;
  if (!userId) return;

  const accountEnv =
    account.metadata?.environment === "live" || account.metadata?.environment === "sandbox"
      ? account.metadata.environment
      : env;

  const sb = getServiceSupabase();
  await sb.rpc("sync_connect_account", {
    _user_id: userId,
    _account_id: account.id,
    _onboarding_complete: !!account.details_submitted,
    _payouts_enabled: !!account.payouts_enabled,
    _environment: accountEnv,
  });
}
