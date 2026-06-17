import mockDashboard from "@/assets/landing/mock-dashboard.svg";
import mockQuotation from "@/assets/landing/mock-quotation.svg";
import mockTax from "@/assets/landing/mock-tax.svg";
import mockBrief from "@/assets/landing/mock-brief.svg";
import mockTrack from "@/assets/landing/mock-track.svg";
import mockInvoice from "@/assets/landing/mock-invoice.svg";

export type LandingMockup = {
  src: string;
  alt: string;
  label?: string;
};

/** Swap images here when real screenshots are ready. */
export const LANDING_MOCKUPS = {
  heroSlides: [
    { src: mockDashboard, alt: "So1o Dashboard — ภาพรวมหลังบ้าน", label: "Dashboard" },
    { src: mockQuotation, alt: "ใบเสนอราคา So1o", label: "ใบเสนอราคา" },
    { src: mockTax, alt: "หน้าภาษี So1o", label: "ภาษี" },
  ] satisfies LandingMockup[],
  features: {
    jobs: { src: mockDashboard, alt: "ติดตามงานและลูกค้า" },
    manage: { src: mockTrack, alt: "บริหารงานและ feedback" },
    finance: { src: mockTax, alt: "การเงินและภาษี" },
  },
  workflow: [
    { src: mockBrief, alt: "Smart Brief", label: "Brief" },
    { src: mockQuotation, alt: "ใบเสนอราคา", label: "QT" },
    { src: mockTrack, alt: "Track งาน", label: "Track" },
    { src: mockInvoice, alt: "ใบแจ้งหนี้", label: "Invoice" },
    { src: mockTax, alt: "ภาษี", label: "Tax" },
  ] satisfies LandingMockup[],
} as const;
