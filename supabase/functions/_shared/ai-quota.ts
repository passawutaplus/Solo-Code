// Shared daily quota guard for AI edge functions.
// Backed by public.check_and_increment_ai_usage(user_id, feature, limit) RPC.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const FREE_DAILY_LIMIT = 10;
export const PRO_DAILY_LIMIT = 100;

export interface QuotaResult {
  allowed: boolean;
  count: number;
  limit: number;
  reason?: string;
}

/**
 * Atomically check + increment daily AI usage for a user.
 * Returns { allowed, count, limit }. When `allowed` is false the caller MUST short-circuit.
 *
 * Uses service role so the counter cannot be bypassed by mutating the user JWT.
 */
export async function checkAiQuota(
  userId: string,
  feature: string,
  isPro: boolean,
): Promise<QuotaResult> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) {
    // Fail closed when misconfigured.
    return { allowed: false, count: 0, limit: 0, reason: "server_misconfiguration" };
  }
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const limit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const { data, error } = await admin.rpc("check_and_increment_ai_usage", {
    _user_id: userId,
    _feature: feature,
    _limit: limit,
  });
  if (error) {
    console.error(`[ai-quota:${feature}] rpc error`, error.message);
    return { allowed: false, count: 0, limit, reason: "quota_check_failed" };
  }
  return data as QuotaResult;
}

/** Returns true if the user has an active Pro/Inhouse subscription. */
export async function isProUser(userId: string): Promise<boolean> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) return false;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data } = await admin
    .from("profiles")
    .select("subscription_tier")
    .eq("user_id", userId)
    .maybeSingle();
  const tier = (data?.subscription_tier ?? "free") as string;
  return tier === "pro" || tier === "inhouse";
}
