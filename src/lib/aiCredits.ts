/** Client-safe AI credits constants — keep in sync with DB functions / ai_tier_config. */

export const FREE_STARTER_CREDITS = 25;

export const AI_TIER_MONTHLY: Record<"free" | "pro" | "inhouse", number> = {
  free: FREE_STARTER_CREDITS,
  pro: 800,
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
    return `แจกเริ่มต้น ${FREE_STARTER_CREDITS} เครดิต`;
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
