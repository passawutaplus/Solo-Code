/** LINE notification preference keys (stored in profiles.line_notify_prefs). */

export type LineNotifyKind =
  | "portal_slip"
  | "portal_tracker_comment"
  | "portal_brief"
  | "portal_planner"
  | "portal_quotation"
  | "support_ticket"
  | "billing";

export type UserLocale = "th" | "en";

export const DEFAULT_LINE_NOTIFY_PREFS: Record<LineNotifyKind, boolean> = {
  portal_slip: true,
  portal_tracker_comment: true,
  portal_brief: true,
  portal_planner: true,
  portal_quotation: true,
  support_ticket: false,
  billing: false,
};

export interface LineNotifyGroup {
  id: string;
  label: Record<UserLocale, string>;
  description: Record<UserLocale, string>;
  kinds: Array<{
    key: LineNotifyKind;
    label: Record<UserLocale, string>;
    hint: Record<UserLocale, string>;
  }>;
}

/** Hero / customer portal events — primary value for Pro LINE alerts. */
export const LINE_NOTIFY_GROUPS: LineNotifyGroup[] = [
  {
    id: "portal",
    label: { th: "จากลูกค้าใน Portal", en: "Customer portal" },
    description: {
      th: "แจ้งเตือนเมื่อลูกค้าทำอะไรบนหน้าที่คุณแชร์ให้",
      en: "When clients act on your shared links",
    },
    kinds: [
      {
        key: "portal_slip",
        label: { th: "อัปโหลดสลิปชำระเงิน", en: "Payment slip uploaded" },
        hint: {
          th: "Job Tracker — ลูกค้าส่งสลิปในลิงก์ติดตามงาน",
          en: "Job Tracker — client uploads a slip on the tracking page",
        },
      },
      {
        key: "portal_tracker_comment",
        label: { th: "คอมเมนต์ในงาน", en: "Job step comment" },
        hint: {
          th: "Job Tracker — ลูกค้าแสดงความคิดเห็นในขั้นตอนงาน",
          en: "Job Tracker — client comments on a workflow step",
        },
      },
      {
        key: "portal_brief",
        label: { th: "ยืนยันบรีฟงาน", en: "Brief confirmed" },
        hint: {
          th: "Design Brief — ลูกค้ากดยืนยันบรีฟครบถ้วน",
          en: "Design Brief — client confirms the creative brief",
        },
      },
      {
        key: "portal_planner",
        label: { th: "อนุมัติ / ขอแก้คอนเทนต์", en: "Content approval" },
        hint: {
          th: "Content Planner — ลูกค้าอนุมัติหรือขอแก้โพสต์",
          en: "Content Planner — client approves or requests changes",
        },
      },
      {
        key: "portal_quotation",
        label: { th: "อัปเดตใบเสนอราคา", en: "Quotation update" },
        hint: {
          th: "เร็วๆ นี้ — เมื่อลูกค้าตอบรับหรือแก้ไขใบเสนอราคา",
          en: "Coming soon — client accepts or updates a quotation",
        },
      },
    ],
  },
  {
    id: "system",
    label: { th: "ระบบ & บัญชี", en: "Account & support" },
    description: {
      th: "การแจ้งเตือนจาก So1o โดยตรง",
      en: "Notifications from So1o itself",
    },
    kinds: [
      {
        key: "support_ticket",
        label: { th: "ตั๋วซัพพอร์ต", en: "Support tickets" },
        hint: {
          th: "สถานะตั๋วช่วยเหลือ / ฟีดแบ็กเปลี่ยน",
          en: "Support or feedback ticket status changes",
        },
      },
      {
        key: "billing",
        label: { th: "การชำระเงินแพ็กเกจ", en: "Subscription billing" },
        hint: {
          th: "แจ้งเตือนเมื่อบัตรถูกปฏิเสธหรือใกล้หมดอายุ",
          en: "Card declined, renewal, or cancellation alerts",
        },
      },
    ],
  },
];

export function mergeLineNotifyPrefs(
  raw: unknown,
): Record<LineNotifyKind, boolean> {
  const base = { ...DEFAULT_LINE_NOTIFY_PREFS };
  if (!raw || typeof raw !== "object") return base;
  for (const key of Object.keys(base) as LineNotifyKind[]) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v === "boolean") base[key] = v;
  }
  return base;
}

export function pickLocale(raw: unknown): UserLocale {
  return raw === "en" ? "en" : "th";
}
