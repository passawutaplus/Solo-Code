export type PlanId = "free" | "pro" | "pro_plus" | "inhouse";
export type BillingCycle = "monthly" | "yearly";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  features: string[];
  cta: string;
  highlighted?: boolean;
  perSeat?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "เริ่มต้นใช้งานฟรี ทุกฟีเจอร์พื้นฐาน",
    monthly: 0,
    yearly: 0,
    features: [
      "Job Tracker ได้ 3 งาน/เดือน",
      "Quotation & Invoice พื้นฐาน",
      "Client & Supplier Management",
      "Fair Price Calculator",
      "AI Mentor 10 ครั้ง/เดือน",
    ],
    cta: "เริ่มใช้งานฟรี",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "ปลดล็อกทุกฟีเจอร์เต็มรูปแบบ",
    monthly: 249,
    yearly: 2388,
    features: [
      "ปลดล็อก So1o My Desk + an1hem บัญชีเดียวกัน",
      "Job Tracker ไม่จำกัด",
      "AI Mentor ขั้นสูงไม่จำกัด",
      "Content Planner + AI Assist",
      "Design Brief แบบมืออาชีพ",
      "Public Tracking Links ไม่จำกัด",
      "โชว์เคส an1hem เต็มรูปแบบ (ฟีเจอร์ Pro กำลังขยาย)",
      "Export PDF + Custom Branding",
      "Priority Support",
    ],
    cta: "อัพเกรดเป็น Pro",
    highlighted: true,
  },
  {
    id: "pro_plus",
    name: "Pro+",
    tagline: "Ecosystem เต็ม — Auto-link Anthem + เครดิต AI มากขึ้น",
    monthly: 399,
    yearly: 3828,
    features: [
      "ทุกอย่างใน Pro",
      "AI 1,400 เครดิต/รอบ",
      "So1o Storage 4 GB + Anthem 2.5 GB",
      "Auto CRM / Quote จากแชท Anthem (เร็วๆ นี้)",
      "Priority Support",
    ],
    cta: "อัพเกรดเป็น Pro+",
  },
  {
    id: "inhouse",
    name: "In-House (Team)",
    tagline: "สำหรับทีมและบริษัท · คิดรายที่นั่ง (workspace กำลังพัฒนา)",
    monthly: 599,
    yearly: 5750,
    features: [
      "ทุกอย่างใน Pro Plan",
      "Multi-user Workspace",
      "Team Permissions & Roles",
      "Shared Asset Library",
      "Centralized Billing",
      "Priority Support สำหรับทีม",
    ],
    cta: "เริ่มใช้งานสำหรับทีม",
    perSeat: true,
  },
];

export function planPrice(plan: Plan, cycle: BillingCycle, seats = 1): number {
  const base = cycle === "monthly" ? plan.monthly : plan.yearly;
  return plan.perSeat ? base * seats : base;
}
