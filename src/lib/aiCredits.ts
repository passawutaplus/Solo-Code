/** Client-safe AI credits constants — keep in sync with DB functions / ai_tier_config. */

export const FREE_STARTER_CREDITS = 25;

export const AI_TIER_MONTHLY: Record<"free" | "pro" | "pro_plus" | "inhouse", number> = {
  free: FREE_STARTER_CREDITS,
  pro: 800,
  pro_plus: 1400,
  inhouse: 2000,
};

export type AiPeriodType =
  | "free_starter"
  | "free_starter_ended"
  | "monthly"
  | "subscription";

export type AiUsageSummary = {
  tier: string;
  period_key: string;
  period_end: string | null;
  period_type?: AiPeriodType | string;
  included_used: number;
  included_limit: number;
  included_remaining: number;
  purchased_balance: number;
  total_remaining: number;
};

/** Human-readable credit plan label for UI. */
export function describeAiCreditsPlan(summary: Pick<
  AiUsageSummary,
  "tier" | "period_type" | "included_limit"
>): string {
  if (summary.period_type === "free_starter") {
    return "แพ็กเริ่มต้นฟรี";
  }
  if (summary.period_type === "free_starter_ended" && summary.tier === "free") {
    return "เครดิตหมดแล้ว — อัพเกรดหรือเติมเพื่อใช้ต่อ";
  }
  if (summary.period_type === "subscription") {
    return `Pro ${summary.included_limit.toLocaleString("th-TH")} เครดิต/รอบบิล`;
  }
  return `${summary.included_limit.toLocaleString("th-TH")} เครดิต/เดือน`;
}

export function formatAiPeriodEnd(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function aiUsagePercent(used: number, limit: number): number {
  if (limit <= 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

/** Countdown bar fill — 100% when full, shrinks as credits are spent. */
export function aiRemainingPercent(remaining: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((remaining / capacity) * 100));
}

/** Bar color from credits left: <10 red, <20 yellow, else primary. */
export function aiRemainingBarColor(remaining: number): string {
  if (remaining < 10) return "bg-destructive";
  if (remaining < 20) return "bg-amber-500";
  return "bg-primary";
}
