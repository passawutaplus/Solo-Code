import { createFileRoute } from "@tanstack/react-router";
import { RouteError } from "@/components/RouteError";
import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { FinanceProvider } from "@/store/finance";
import { RequireAuth } from "@/auth/RequireAuth";
import { useAuth } from "@/auth/AuthProvider";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { DashboardSidebar, type DashSection } from "@/components/dashboard/layout/DashboardSidebar";
import { BottomNav } from "@/components/dashboard/layout/BottomNav";
import { DashboardCommandMenu } from "@/components/dashboard/DashboardCommandMenu";
import { NotificationBell } from "@/components/NotificationBell";

import { SubscriptionStatusBanner } from "@/components/dashboard/SubscriptionStatusBanner";
import { CheckoutSuccessHandler } from "@/components/dashboard/CheckoutSuccessHandler";
import {
  OverviewSkeleton,
  FinanceSkeleton,
  PlannerSkeleton,
  MyDataSkeleton,
  SettingsSkeleton,
} from "@/components/dashboard/skeletons/TabSkeletons";

const OverviewTab = React.lazy(() =>
  import("@/components/dashboard/OverviewTab").then((m) => ({ default: m.OverviewTab })),
);
const TrendsTab = React.lazy(() =>
  import("@/components/dashboard/TrendsTab").then((m) => ({ default: m.TrendsTab })),
);
const FinanceTab = React.lazy(() =>
  import("@/components/dashboard/FinanceTab").then((m) => ({ default: m.FinanceTab })),
);
const PlannerTab = React.lazy(() =>
  import("@/components/dashboard/PlannerTab").then((m) => ({ default: m.PlannerTab })),
);
const MyDataTab = React.lazy(() =>
  import("@/components/dashboard/MyDataTab").then((m) => ({ default: m.MyDataTab })),
);
const SettingsTab = React.lazy(() =>
  import("@/components/dashboard/SettingsTab").then((m) => ({ default: m.SettingsTab })),
);
const InspireTab = React.lazy(() =>
  import("@/components/dashboard/InspireTab").then((m) => ({ default: m.InspireTab })),
);

import { trackFeature } from "@/lib/featureUsage";
import { parseAnthemDashboardParams, storeAnthemQuotationHandoff } from "@/lib/ecosystemHandoff";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { DashboardBannerSlider } from "@/components/DashboardBannerSlider";
import { useTrackActivity } from "@/hooks/useTrackActivity";
import { useLogActivity } from "@/hooks/useLogActivity";
import { useDailyTrendsPrefetch } from "@/hooks/useDailyTrendsPrefetch";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import logoUrl from "@/assets/solo-freelancer-logo.webp";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Desk — หลังบ้านฟรีแลนซ์ | So1o Freelancer" },
      { name: "description", content: "บริหารจัดการรายได้ ค่าสมาชิก ภาษี ลูกค้า โปรเจกต์ และคอนเทนต์ในที่เดียว สำหรับฟรีแลนซ์ไทย" },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "My Desk — หลังบ้านฟรีแลนซ์" },
      { property: "og:description", content: "ติดตามรายได้ ภาษี VAT และค่าสมาชิกแบบครบวงจร" },
      { property: "og:url", content: "https://solofreelancer.com/dashboard" },
      { property: "og:image", content: logoUrl },
    ],
    links: [{ rel: "canonical", href: "https://solofreelancer.com/dashboard" }],
  }),
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

const SECTION_FALLBACK: Record<DashSection, string> = {
  overview: "Dashboard",
  trends: "ข่าวสาร & เทรนด์",
  inspire: "Inspire",
  finance: "Quotation",
  planner: "Content",
  mydata: "ลูกค้า",
  settings: "ตั้งค่า",
};

const SUB_TITLES: Partial<Record<DashSection, Record<string, string>>> = {
  finance: {
    pipeline: "Pipeline",
    quotations: "Quotation",
    jobs: "Job Tracker",
    income: "รายได้",
    tax: "ภาษี",
    subs: "Subscription",
  },
  planner: {
    content: "ปฏิทินคอนเทนต์",
    projects: "To Do List",
    briefs: "Smart Brief",
    feedback: "Feedback ลูกค้า",
  },
  mydata: {
    clients: "ลูกค้า",
    suppliers: "Suppliers",
    assets: "Assets",
    legal: "Legal Desk",
  },
};

function getSectionTitle(section: DashSection, sub?: string): string {
  const subMap = SUB_TITLES[section];
  if (sub && subMap && subMap[sub]) return subMap[sub];
  return SECTION_FALLBACK[section];
}


const DEFAULT_SUBS: Record<DashSection, string | undefined> = {
  overview: undefined,
  trends: undefined,
  inspire: undefined,
  finance: "quotations",
  planner: "content",
  mydata: "clients",
  settings: undefined,
};

function Dashboard() {
  const { profile, user } = useAuth();
  const [section, setSection] = React.useState<DashSection>(() => {
    if (typeof window === "undefined") return "overview";
    const t = new URLSearchParams(window.location.search).get("tab");
    return (["overview", "trends", "inspire", "finance", "planner", "mydata", "settings"].includes(t || "")
      ? (t as DashSection)
      : "overview");
  });
  const [sub, setSub] = React.useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const sp = new URLSearchParams(window.location.search);
    return sp.get("sub") ?? undefined;
  });
  const updateSection = React.useCallback((next: DashSection, nextSub?: string) => {
    setSection(next);
    const resolvedSub = nextSub ?? DEFAULT_SUBS[next];
    setSub(resolvedSub);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      if (resolvedSub) url.searchParams.set("sub", resolvedSub);
      else url.searchParams.delete("sub");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  

  useTrackActivity(user?.id);
  useLogActivity(user?.id, "dashboard_view");
  useDailyTrendsPrefetch();
  React.useEffect(() => {
    trackFeature(`dashboard.${section}`);
  }, [section]);

  // Anthem → So1o quotation deep-link handoff
  React.useEffect(() => {
    if (typeof window === "undefined" || !user?.id) return;
    const params = parseAnthemDashboardParams(window.location.search);
    if (!params.fromAnthem) return;

    void (async () => {
      let clientName = params.clientName;
      let projectTitle = params.projectTitle;
      let clientEmail = params.clientEmail;
      let clientPhone = params.clientPhone;
      let message = params.message;
      let deadline = params.deadline;
      let requestId = params.requestId;

      if (params.requestId) {
        const { data: hire } = await supabase
          .from("hiring_requests")
          .select("id, client_name, email, phone, message, deadline, project_title, budget_amount")
          .eq("id", params.requestId)
          .eq("freelancer_id", user.id)
          .maybeSingle();
        if (hire) {
          clientName = hire.client_name ?? clientName;
          projectTitle = hire.project_title ?? projectTitle;
          clientEmail = hire.email ?? clientEmail;
          clientPhone = hire.phone ?? clientPhone;
          message = hire.message ?? message;
          deadline = hire.deadline ?? deadline;
          requestId = hire.id;
        }
      }

      const notesParts: string[] = [];
      if (message) notesParts.push(message);
      if (deadline) notesParts.push(`กำหนดส่ง: ${deadline}`);
      if (params.conversationId) notesParts.push(`แชท Anthem: ${params.conversationId}`);

      storeAnthemQuotationHandoff({
        projectName: projectTitle || "งานจาก Anthem",
        clientName: clientName || "ลูกค้า Anthem",
        clientEmail,
        clientPhone,
        endDate: deadline,
        notes: notesParts.length ? notesParts.join("\n\n") : undefined,
        ecosystemLinkId: params.linkId,
        conversationId: params.conversationId,
        requestId,
      });

      if (params.linkId) {
        const ownsLink =
          !requestId ||
          (
            await supabase
              .from("hiring_requests")
              .select("id")
              .eq("id", requestId)
              .eq("freelancer_id", user.id)
              .maybeSingle()
          ).data != null;

        if (ownsLink) {
          await supabase
            .from("ecosystem_links")
            .update({ meta: { converted_at: new Date().toISOString(), target: "quotation_handoff" } })
            .eq("id", params.linkId);
        }
      }

      updateSection("finance", "quotations");
      const url = new URL(window.location.href);
      ["from", "conversation_id", "request_id", "client_name", "project_title", "client_email", "client_phone", "message", "deadline", "link_id"].forEach(
        (k) => url.searchParams.delete(k),
      );
      window.history.replaceState({}, "", url.toString());
    })();
  }, [updateSection, user?.id]);

  return (
    <FinanceProvider>
      <OnboardingFlow />
      <SidebarProvider>
        <div className="relative min-h-screen flex w-full bg-background">
          <DashboardSidebar active={section} activeSub={sub} setActive={updateSection} />

          <SidebarInset className="flex-1 min-w-0 flex flex-col">
            {/* Top bar */}
            <header className="sticky top-0 z-20 border-b border-border/40 bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
              <SubscriptionStatusBanner />
              <CheckoutSuccessHandler />
              <div className="flex items-center justify-between gap-3 px-3 sm:px-5 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <SidebarTrigger className="shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      สวัสดี, {profile?.display_name || profile?.brand_name || "เพื่อนฟรีแลนซ์"} 👋
                    </p>
                    <h1 className="text-sm sm:text-base font-semibold leading-tight truncate">
                      {getSectionTitle(section, sub)}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/labs"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold border border-primary/30 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all"
                    aria-label="เปิด So1o Creative Labs"
                  >
                    <FlaskConical className="h-3.5 w-3.5" /> Labs
                  </Link>
                  <NotificationBell />
                </div>
              </div>
            </header>


            <div className="flex-1 flex min-w-0">
              <main className="relative flex-1 min-w-0 overflow-x-hidden">
                <div className="ambient-blobs" aria-hidden="true" />
                <div className="relative z-10 mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                  <DashboardBannerSlider />
                  <div className="animate-fade-in">
                    {section === "overview" && (
                      <React.Suspense fallback={<OverviewSkeleton />}>
                        <OverviewTab onGo={(t, s) => updateSection(t as DashSection, s)} />
                      </React.Suspense>
                    )}
                    {section === "inspire" && (
                      <React.Suspense fallback={<OverviewSkeleton />}>
                        <InspireTab />
                      </React.Suspense>
                    )}
                    {section === "trends" && (
                      <React.Suspense fallback={<OverviewSkeleton />}>
                        <TrendsTab />
                      </React.Suspense>
                    )}
                    {section === "finance" && (
                      <React.Suspense fallback={<FinanceSkeleton />}>
                        <FinanceTab
                          sub={(sub as any) ?? "quotations"}
                          onMoneySubChange={(s) => updateSection("finance", s)}
                          onSubChange={(s) => updateSection("finance", s)}
                          onGoTab={updateSection}
                        />
                      </React.Suspense>
                    )}
                    {section === "planner" && (
                      <React.Suspense fallback={<PlannerSkeleton />}>
                        <PlannerTab sub={(sub as any) ?? "content"} />
                      </React.Suspense>
                    )}
                    {section === "mydata" && (
                      <React.Suspense fallback={<MyDataSkeleton />}>
                        <MyDataTab
                          sub={(sub as any) ?? "clients"}
                          onNavigate={updateSection}
                        />
                      </React.Suspense>
                    )}
                    {section === "settings" && (
                      <React.Suspense fallback={<SettingsSkeleton />}>
                        <SettingsTab />
                      </React.Suspense>
                    )}
                  </div>
                  <div className="mt-6">
                    <AnnouncementBanner />
                  </div>
                </div>
                {/* Bottom safe-area spacer so content isn't hidden behind BottomNav on mobile */}
                <div className="md:hidden h-[calc(env(safe-area-inset-bottom)+64px)]" aria-hidden="true" />
              </main>
            </div>
          </SidebarInset>

          {/* Mobile bottom navigation (PWA-friendly) */}
          <BottomNav active={section} activeSub={sub} onSelect={(s, nextSub) => updateSection(s, nextSub)} />
          <DashboardCommandMenu onNavigate={updateSection} />

          {/* AI chat FAB: DraggableFabDock in __root. Support + สร้างดีล: sidebar footer */}

          <Toaster position="top-center" richColors />
        </div>
      </SidebarProvider>
    </FinanceProvider>
  );
}
