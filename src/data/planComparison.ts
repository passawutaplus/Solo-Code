import type { PlanId } from "@/data/plans";
import { PLANS } from "@/data/plans";
import { AI_TIER_MONTHLY, FREE_STARTER_CREDITS } from "@/lib/aiCredits";
import { FREE_MONTHLY_JOB_LIMIT } from "@/lib/planLimits";
import { SO1O_STORAGE_QUOTA_LABEL } from "@/lib/storageQuotas";

/** Keep in sync with Anthem-Code/src/lib/storageQuotas.ts + projectLimits.ts */
const ANTHEM_STORAGE_LABEL: Record<PlanId, string> = {
  free: "300 MB",
  pro: "1.5 GB",
  pro_plus: "2.5 GB",
  inhouse: "8 GB",
};

const ANTHEM_PROJECT_LIMITS: Record<
  PlanId,
  { published: string; draft: number; galleryImages: number; videosPerProject: number }
> = {
  free: { published: "15", draft: 5, galleryImages: 6, videosPerProject: 1 },
  pro: { published: "ไม่จำกัด", draft: 50, galleryImages: 20, videosPerProject: 3 },
  pro_plus: { published: "ไม่จำกัด", draft: 50, galleryImages: 20, videosPerProject: 3 },
  inhouse: { published: "ไม่จำกัด", draft: 100, galleryImages: 20, videosPerProject: 3 },
};

export type ComparisonCell = string | boolean | "coming_soon";

export interface PlanComparisonRow {
  label: string;
  values: Record<PlanId, ComparisonCell>;
}

function formatJobs(tier: PlanId): string {
  if (tier === "free") return `${FREE_MONTHLY_JOB_LIMIT}/เดือน`;
  return "ไม่จำกัด";
}

function formatAiCredits(tier: PlanId): string {
  if (tier === "free") return `${FREE_STARTER_CREDITS} เริ่มต้น`;
  return AI_TIER_MONTHLY[tier].toLocaleString("th-TH");
}

function formatPrice(tier: PlanId): string {
  const plan = PLANS.find((p) => p.id === tier)!;
  if (tier === "free") return "0";
  if (plan.perSeat) return `${plan.monthly.toLocaleString("th-TH")}/ที่นั่ง`;
  return plan.monthly.toLocaleString("th-TH");
}

function ecosystemUnlock(tier: PlanId): ComparisonCell {
  return tier !== "free";
}

function lineNotifications(tier: PlanId): ComparisonCell {
  return tier !== "free";
}

/** Rows for the tier comparison table — values derived from limit constants. */
export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  {
    label: "ราคา/เดือน (THB)",
    values: {
      free: formatPrice("free"),
      pro: formatPrice("pro"),
      pro_plus: formatPrice("pro_plus"),
      inhouse: formatPrice("inhouse"),
    },
  },
  {
    label: "Job Tracker",
    values: {
      free: formatJobs("free"),
      pro: formatJobs("pro"),
      pro_plus: formatJobs("pro_plus"),
      inhouse: formatJobs("inhouse"),
    },
  },
  {
    label: "AI เครดิต/รอบ",
    values: {
      free: formatAiCredits("free"),
      pro: formatAiCredits("pro"),
      pro_plus: formatAiCredits("pro_plus"),
      inhouse: formatAiCredits("inhouse"),
    },
  },
  {
    label: "So1o Storage",
    values: {
      free: SO1O_STORAGE_QUOTA_LABEL.free,
      pro: SO1O_STORAGE_QUOTA_LABEL.pro,
      pro_plus: SO1O_STORAGE_QUOTA_LABEL.pro_plus,
      inhouse: SO1O_STORAGE_QUOTA_LABEL.inhouse,
    },
  },
  {
    label: "an1hem Storage",
    values: {
      free: ANTHEM_STORAGE_LABEL.free,
      pro: ANTHEM_STORAGE_LABEL.pro,
      pro_plus: ANTHEM_STORAGE_LABEL.pro_plus,
      inhouse: ANTHEM_STORAGE_LABEL.inhouse,
    },
  },
  {
    label: "โพสต์ผลงาน an1hem",
    values: {
      free: ANTHEM_PROJECT_LIMITS.free.published,
      pro: ANTHEM_PROJECT_LIMITS.pro.published,
      pro_plus: ANTHEM_PROJECT_LIMITS.pro_plus.published,
      inhouse: ANTHEM_PROJECT_LIMITS.inhouse.published,
    },
  },
  {
    label: "แบบร่าง an1hem",
    values: {
      free: String(ANTHEM_PROJECT_LIMITS.free.draft),
      pro: String(ANTHEM_PROJECT_LIMITS.pro.draft),
      pro_plus: String(ANTHEM_PROJECT_LIMITS.pro_plus.draft),
      inhouse: String(ANTHEM_PROJECT_LIMITS.inhouse.draft),
    },
  },
  {
    label: "รูป/ผลงาน",
    values: {
      free: String(ANTHEM_PROJECT_LIMITS.free.galleryImages),
      pro: String(ANTHEM_PROJECT_LIMITS.pro.galleryImages),
      pro_plus: String(ANTHEM_PROJECT_LIMITS.pro_plus.galleryImages),
      inhouse: String(ANTHEM_PROJECT_LIMITS.inhouse.galleryImages),
    },
  },
  {
    label: "วิดีโอ/ผลงาน",
    values: {
      free: String(ANTHEM_PROJECT_LIMITS.free.videosPerProject),
      pro: String(ANTHEM_PROJECT_LIMITS.pro.videosPerProject),
      pro_plus: String(ANTHEM_PROJECT_LIMITS.pro_plus.videosPerProject),
      inhouse: String(ANTHEM_PROJECT_LIMITS.inhouse.videosPerProject),
    },
  },
  {
    label: "So1o + an1hem บัญชีเดียว",
    values: {
      free: ecosystemUnlock("free"),
      pro: ecosystemUnlock("pro"),
      pro_plus: ecosystemUnlock("pro_plus"),
      inhouse: ecosystemUnlock("inhouse"),
    },
  },
  {
    label: "LINE แจ้งเตือน",
    values: {
      free: lineNotifications("free"),
      pro: lineNotifications("pro"),
      pro_plus: lineNotifications("pro_plus"),
      inhouse: lineNotifications("inhouse"),
    },
  },
  {
    label: "Workspace ทีม",
    values: {
      free: false,
      pro: false,
      pro_plus: false,
      inhouse: true,
    },
  },
  {
    label: "Auto CRM จากแชท",
    values: {
      free: false,
      pro: false,
      pro_plus: "coming_soon",
      inhouse: false,
    },
  },
];

export const PLAN_COMPARISON_TIER_LABELS: Record<PlanId, string> = {
  free: "Free",
  pro: "Pro",
  pro_plus: "Pro+",
  inhouse: "In-House",
};

export const PLAN_COMPARISON_TIER_ORDER: PlanId[] = ["free", "pro", "pro_plus", "inhouse"];
