import shotDashboard from "@/assets/landing/shot-dashboard.webp";
import shotQuotation from "@/assets/landing/shot-quotation.webp";
import shotTax from "@/assets/landing/shot-tax.webp";
import shotBrief from "@/assets/landing/shot-brief.webp";
import shotTrack from "@/assets/landing/shot-track.webp";
import shotInvoice from "@/assets/landing/shot-invoice.webp";
import shotJobs from "@/assets/landing/shot-jobs.webp";
import shotFeedback from "@/assets/landing/shot-feedback.webp";
import shotIncome from "@/assets/landing/shot-income.webp";
import shotQtList from "@/assets/landing/shot-qt-list.webp";
import shotWht from "@/assets/landing/shot-wht.webp";

export type LandingMockup = {
  src: string;
  alt: string;
  label?: string;
};

/** Real app screenshots — 11 unique images, regenerate via scripts/capture-landing-screenshots-win.mjs */
export const LANDING_MOCKUPS = {
  heroSlides: [
    { src: shotDashboard, alt: "So1o Dashboard — ภาพรวมหลังบ้าน", label: "Dashboard" },
    { src: shotQuotation, alt: "ใบเสนอราคา So1o", label: "ใบเสนอราคา" },
    { src: shotTax, alt: "หน้าภาษี So1o", label: "ภาษี" },
  ] satisfies LandingMockup[],
  features: {
    jobs: { src: shotJobs, alt: "Job Tracker — ติดตามงานลูกค้า" },
    manage: { src: shotFeedback, alt: "Feedback และ revision ลูกค้า" },
    finance: { src: shotIncome, alt: "บันทึกรายได้และ WHT" },
  },
  workflow: [
    { src: shotBrief, alt: "Smart Brief", label: "Brief" },
    { src: shotQtList, alt: "รายการใบเสนอราคา", label: "QT" },
    { src: shotTrack, alt: "Track งาน", label: "Track" },
    { src: shotInvoice, alt: "ใบแจ้งหนี้", label: "Invoice" },
    { src: shotWht, alt: "ใบหัก ณ ที่จ่าย 50 ทวิ", label: "Tax" },
  ] satisfies LandingMockup[],
} as const;
