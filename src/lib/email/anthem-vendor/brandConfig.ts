/**
 * 1PX brand — ทุกคนคือ 1 พิกเซล รวมกันเป็นภาพใหญ่ของชุมชนครีเอทีฟ
 * อ่านแบรนด์: "วัน-พี-เอ็กซ์" (ไม่ใช่หน่วย CSS) · คอนเซปต์: 1 pixel = 1 freelancer
 */

/** ชื่อทางการ / SEO / กฎหมาย */
export const BRAND_NAME = "1PX";

/** โดเมนหลักที่แนะนำ (1px.app ว่าง — จดก่อน production) */
export const BRAND_DOMAIN = "1px.app";

/** URL เดโม่บน Vercel — ใช้จนกว่าจะซื้อโดเมนและ deploy production */
export const ANTHEM_DEMO_URL = "https://1px-demo.vercel.app";

export const BRAND_TAGLINE = "ชุมชนครีเอทีฟ — ทุกคนคือ 1 PX";

export const BRAND_DESCRIPTION =
  "ลงผลงาน ติดตามครีเอเตอร์ ส่ง PX สนับสนุน และค้นหางานดีไซน์ — ยิ่งมีคนยิ่งคม ชุมชนพอร์ตโฟลิโอสำหรับฟรีแลนซ์ไทย";

/** ใช้บริบทที่ต้องการมุมมองเพิ่ม — อย่าแสดงคู่กับ BRAND_TAGLINE ในหน้าเดียว */
export const BRAND_CONCEPT = "ยิ่งมีคน ยิ่งคม — รวมกันเป็นภาพใหญ่ของครีเอทีฟไทย";

export const BRAND_HERO_SUBTITLE = "พื้นที่ของฟรีแลนซ์";

/** โลโก้ mark ในกล่อง — พิกเซลเดียว (ย่อจาก 1PX) */
export const BRAND_MARK = "1";

export const BRAND_COMPANY = "1PX Platform";

export const BRAND_SUPPORT_EMAIL = "support@1px.app";
export const BRAND_PRIVACY_EMAIL = "privacy@1px.app";

/** คีย์ภายใน (คงเดิมเพื่อไม่รีเซ็ต localStorage / session ของผู้ใช้เดิม) */
export const BRAND_STORAGE_THEME = "an1hem-theme";
export const BRAND_STORAGE_ONBOARDING = "an1hem_onboarding";
export const BRAND_STORAGE_NO_PERSIST = "an1hem_no_persist";

/** คีย์ ecosystem ข้ามแอป (So1o อาจอ้างอิงค่านี้) */
export const BRAND_ECOSYSTEM_KEY = "anthem";

export function defaultSiteUrl(): string {
  const fromEnv =
    typeof import.meta !== "undefined"
      ? (import.meta.env?.VITE_SITE_URL as string | undefined)
      : undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return ANTHEM_DEMO_URL;
}
