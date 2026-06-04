import { createFileRoute } from "@tanstack/react-router";
import { RouteError } from "@/components/RouteError";
import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/auth/AuthProvider";
import { getEarlyAccessStats } from "@/server/public-stats.functions";
import { LandingNav } from "@/components/landing/sections/LandingNav";
import { LandingHero } from "@/components/landing/sections/LandingHero";
import { LandingQuotationTeaser } from "@/components/landing/sections/LandingQuotationTeaser";
import { LandingProductShowcase } from "@/components/landing/sections/LandingProductShowcase";
import { LandingFeatureAssistant } from "@/components/landing/sections/LandingFeatureAssistant";
import { LandingDashboardPreview } from "@/components/landing/sections/LandingDashboardPreview";
import { LandingLabsTeaser } from "@/components/landing/sections/LandingLabsTeaser";
import { LandingPricingSection } from "@/components/landing/sections/LandingPricingSection";
import { LandingFeatures } from "@/components/landing/sections/LandingFeatures";
import { CalculatorUsageBadge } from "@/components/landing/CalculatorUsageBadge";
import { HomeInsightsSection } from "@/components/blog/HomeInsightsSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Calculator } from "lucide-react";

const PriceCalculator = React.lazy(() =>
  import("@/components/landing/PriceCalculator").then((m) => ({ default: m.PriceCalculator })),
);

const LandingMentorChat = React.lazy(() =>
  import("@/components/landing/LandingMentorChat").then((m) => ({ default: m.LandingMentorChat })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "So1o Freelancer — หลังบ้านครบวงจรสำหรับฟรีแลนซ์" },
      {
        name: "description",
        content:
          "หลังบ้านครบวงจรสำหรับฟรีแลนซ์ไทย — ลูกค้า ใบเสนอราคา การเงิน ภาษี Smart Brief และ Creative Labs",
      },
      { property: "og:title", content: "So1o Freelancer — หลังบ้านครบวงจรสำหรับฟรีแลนซ์" },
      {
        property: "og:description",
        content: "บริหารพอร์ต ลูกค้า ใบเสนอราคา การเงิน ภาษี ครบในที่เดียว",
      },
      { property: "og:url", content: "https://solofreelancer.com/" },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/SB11sYmcAcWg6RHXTfd1y5NFKnt2/social-images/social-1777699020537-WELLCOME_(1).webp",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/SB11sYmcAcWg6RHXTfd1y5NFKnt2/social-images/social-1777699020537-WELLCOME_(1).webp",
      },
    ],
    links: [{ rel: "canonical", href: "https://solofreelancer.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "So1o Freelancer",
          url: "https://www.solofreelancer.com/",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "th-TH",
          description:
            "หลังบ้านครบวงจรสำหรับฟรีแลนซ์ไทย — บริหารพอร์ต ลูกค้า ใบเสนอราคา การเงิน และภาษีในที่เดียว",
          offers: { "@type": "Offer", price: "0", priceCurrency: "THB" },
          publisher: { "@type": "Organization", name: "So1o Freelancer" },
        }),
      },
    ],
  }),
  loader: () => getEarlyAccessStats(),
  staleTime: 60_000,
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: Landing,
});

function Landing() {
  const { user, isAdmin } = useAuth();
  const stats = Route.useLoaderData();
  const approved = stats?.approved ?? 0;
  const target = stats?.target ?? 100;
  const remaining = Math.max(0, target - approved);
  const pct = Math.min(100, Math.round((approved / target) * 100));
  const mentorRef = React.useRef<HTMLDivElement>(null);

  const scrollToMentor = () => {
    mentorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="ambient-blobs" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] -z-0"
        aria-hidden="true"
        style={{ backgroundImage: "var(--gradient-mesh)" }}
      />

      <LandingNav user={user} isAdmin={isAdmin} />

      <main className="relative z-10">
        <LandingHero approved={approved} target={target} remaining={remaining} pct={pct} />

        <LandingQuotationTeaser user={user} />

        <section id="calculator" className="mx-auto max-w-5xl px-4 pb-12">
          <details className="group rounded-3xl border border-border bg-card/60 overflow-hidden">
            <summary className="cursor-pointer list-none px-5 py-4 sm:px-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Calculator className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">ลองประเมินราคางาน (Fair Price)</p>
                <p className="text-xs text-muted-foreground">คำนวณราคาที่ควรเสนอจากวันงาน · ชม. · ความยาก — ฟรี</p>
              </div>
              <span className="text-xs text-primary font-medium group-open:hidden">เปิด</span>
              <span className="text-xs text-muted-foreground hidden group-open:inline">ปิด</span>
            </summary>
            <div className="px-4 pb-5 sm:px-6 sm:pb-6 border-t border-border pt-4">
              <CalculatorUsageBadge />
              <React.Suspense
                fallback={
                  <div className="mt-4 rounded-3xl border border-border bg-card/60 h-80 animate-pulse" />
                }
              >
                <div className="mt-4">
                  <PriceCalculator remaining={remaining} />
                </div>
              </React.Suspense>
            </div>
          </details>
        </section>

        <LandingProductShowcase />
        <LandingFeatures />
        <LandingFeatureAssistant onOpenMentor={scrollToMentor} />

        <div ref={mentorRef}>
          <React.Suspense
            fallback={
              <div className="mx-auto max-w-6xl px-4 h-[480px] rounded-3xl border border-border animate-pulse" />
            }
          >
            <LandingMentorChat />
          </React.Suspense>
        </div>

        <LandingDashboardPreview />
        <LandingLabsTeaser />
        <LandingPricingSection user={user} />
        <HomeInsightsSection />
        <SiteFooter variant="minimal" />
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
}
