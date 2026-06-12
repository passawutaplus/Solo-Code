export type PlanId = "free" | "pro" | "pro_plus" | "inhouse";
export type BillingCycle = "monthly" | "yearly";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  /** Short bullets shown on pricing cards */
  highlights: string[];
  /** Extra details shown in expandable section */
  details: string[];
  /** @deprecated Use highlights — kept for backward compatibility */
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
    highlights: [
      "เริ่มใช้งานฟรี ไม่ต้องผูกบัตร",
      "Job Tracker 3 งาน/เดือน",
      "ใบเสนอราคา & ใบแจ้งหนี้พื้นฐาน",
      "จัดการลูกค้า & Supplier",
      "Fair Price Calculator",
      "AI 25 เครดิตเริ่มต้น (ครั้งเดียวต่อบัญชี)",
    ],
    details: [
      "So1o Storage 50 MB · an1hem 300 MB",
      "โพสต์ผลงาน an1hem ได้ 15 ชิ้น · แบบร่าง 5 · รูป/ผลงาน 6 · วิดีโอ 1 คลิป",
      "ไม่มี LINE แจ้งเตือน · ไม่ปลดล็อก ecosystem ข้ามแอป",
    ],
    features: [
      "เริ่มใช้งานฟรี ไม่ต้องผูกบัตร",
      "Job Tracker 3 งาน/เดือน",
      "ใบเสนอราคา & ใบแจ้งหนี้พื้นฐาน",
      "จัดการลูกค้า & Supplier",
      "Fair Price Calculator",
      "AI 25 เครดิตเริ่มต้น (ครั้งเดียวต่อบัญชี)",
    ],
    cta: "เริ่มใช้งานฟรี",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "ปลดล็อกทุกฟีเจอร์เต็มรูปแบบ",
    monthly: 249,
    yearly: 2388,
    highlights: [
      "ปลดล็อก So1o My Desk + an1hem บัญชีเดียว",
      "Job Tracker ไม่จำกัด",
      "AI 800 เครดิต/รอบบิล",
      "Content Planner + AI Assist · Design Brief มืออาชีพ",
      "Public Tracking Links ไม่จำกัด",
      "Export PDF + Custom Branding · Priority Support",
    ],
    details: [
      "So1o 2 GB · an1hem 1.5 GB",
      "โพสต์ผลงาน an1hem ไม่จำกัด · แบบร่าง 50 · รูป 20 · วิดีโอ 3 คลิป/ผลงาน",
      "LINE แจ้งเตือนได้",
      "โชว์เคส an1hem เต็มรูปแบบ (ฟีเจอร์ Pro กำลังขยาย)",
    ],
    features: [
      "ปลดล็อก So1o My Desk + an1hem บัญชีเดียว",
      "Job Tracker ไม่จำกัด",
      "AI 800 เครดิต/รอบบิล",
      "Content Planner + AI Assist · Design Brief มืออาชีพ",
      "Public Tracking Links ไม่จำกัด",
      "Export PDF + Custom Branding · Priority Support",
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
    highlights: [
      "ทุกอย่างใน Pro",
      "AI 1,400 เครดิต/รอบบิล",
      "So1o 4 GB + an1hem 2.5 GB",
      "Auto CRM / Quote จากแชท an1hem (เร็วๆ นี้)",
      "Priority Support",
    ],
    details: [
      "โควต้า an1hem เทียบ Pro: storage +75% · เหมาะกับ creator ที่โพสต์งานหนัก",
      "ยังไม่มี workspace ทีม (ต่างจาก In-House)",
    ],
    features: [
      "ทุกอย่างใน Pro",
      "AI 1,400 เครดิต/รอบบิล",
      "So1o 4 GB + an1hem 2.5 GB",
      "Auto CRM / Quote จากแชท an1hem (เร็วๆ นี้)",
      "Priority Support",
    ],
    cta: "อัพเกรดเป็น Pro+",
  },
  {
    id: "inhouse",
    name: "In-House (Team)",
    tagline: "สำหรับทีมและบริษัท · คิดรายที่นั่ง · Co-working workspace",
    monthly: 599,
    yearly: 5750,
    highlights: [
      "ทุกอย่างใน Pro",
      "AI 2,000 เครดิต/รอบบิล",
      "So1o 10 GB · an1hem 8 GB",
      "Multi-user Workspace · Kanban · Chat · Monitor · Team Roles",
      "Centralized Billing · Priority Support สำหรับทีม",
      "ขั้นต่ำ 2 ที่นั่ง · สูงสุด 50",
    ],
    details: [
      "แบบร่าง an1hem 100 ชิ้น (vs 50 ใน Pro/Pro+)",
      "Co-working workspace พร้อมใช้ — Kanban, To-do, Chat, Monitor สำหรับทีม",
    ],
    features: [
      "ทุกอย่างใน Pro",
      "AI 2,000 เครดิต/รอบบิล",
      "So1o 10 GB · an1hem 8 GB",
      "Multi-user Workspace · Kanban · Chat · Monitor · Team Roles",
      "Centralized Billing · Priority Support สำหรับทีม",
      "ขั้นต่ำ 2 ที่นั่ง · สูงสุด 50",
    ],
    cta: "เริ่มใช้งานสำหรับทีม",
    perSeat: true,
  },
];

export function planPrice(plan: Plan, cycle: BillingCycle, seats = 1): number {
  const base = cycle === "monthly" ? plan.monthly : plan.yearly;
  return plan.perSeat ? base * seats : base;
}
