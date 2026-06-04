import { createFileRoute, Link } from "@tanstack/react-router";
import { RouteError } from "@/components/RouteError";
import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/auth/AuthProvider";
import { Progress } from "@/components/ui/progress";
import { getEarlyAccessStats } from "@/server/public-stats.functions";
import {
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  Sparkles,
  Users,
  FileText,
  Coins,
  CalendarDays,
  MessageSquare,
  Receipt,
  Briefcase,
  Truck,
  ListChecks,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Calculator,
  
  Smartphone,
  Globe,
  Moon,
  Sun,
  Menu,
  BookOpen,
  Mail,
  LayoutGrid,
} from "lucide-react";
import { ANTHEM_SHOWCASE_URL, FREE_QUOTATION_URL } from "@/lib/productLinks";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/NotificationBell";
import { LineHeaderButton, LineContactChip } from "@/components/LineContactButton";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import logoUrl from "@/assets/solo-freelancer-logo.webp";
import { HomeInsightsSection } from "@/components/blog/HomeInsightsSection";
import { CalculatorUsageBadge } from "@/components/landing/CalculatorUsageBadge";
import { SiteFooter } from "@/components/layout/SiteFooter";

// Lazy-load the calculator (a large, interaction-only widget) to keep
// the initial bundle small and improve mobile FCP/TBT.
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
      // Use the project-wide social image (webp) for richer link previews.
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
    links: [
      { rel: "canonical", href: "https://solofreelancer.com/" },
      // Preload LCP-candidate logo (above-the-fold in header)
      { rel: "preload", as: "image", href: logoUrl, fetchPriority: "high" } as any,
    ],
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

const FEATURES = [
  { icon: ListChecks, title: "Job Tracker", desc: "ติดตามทุกขั้นตอนของงาน ตั้งแต่รับบรีฟ ส่งร่าง แก้ไข จนถึงปิดงาน — เห็นภาพรวมทุกโปรเจกต์ในที่เดียว ไม่หลงลืม ไม่พลาดเดดไลน์" },
  { icon: Briefcase, title: "Subscriber Tracker", desc: "บริหารจัดการ Subscription ทั้งหมดที่เดียว ติดตามค่าใช้จ่าย แจ้งเตือนวันครบกำหนด" },
  { icon: Users, title: "Clients CRM", desc: "บันทึกประวัติการติดต่อ และรายละเอียดงาน เพื่อให้คุณดูแลลูกค้าได้อย่างมืออาชีพ" },
  { icon: Truck, title: "Suppliers Hub", desc: "รวมข้อมูล จัดเก็บเอกสาร PDF ตัวอย่างงาน และลิงก์อ้างอิง เพื่อให้ใช้งานได้อย่างรวดเร็ว" },
  { icon: FileText, title: "Quotations & Invoices", desc: "สร้างใบเสนอราคา และใบแจ้งหนี้ได้อย่างรวดเร็ว ลูกค้าได้ทันที เพิ่มความน่าเชื่อถือ" },
  { icon: Coins, title: "รายได้", desc: "ซิงค์รายได้จากใบเสนอราคา กราฟรายเดือน และส่งออก CSV — เชื่อมกับหน้าภาษีอัตโนมัติ" },
  { icon: Receipt, title: "ภาษี & 50 ทวิ", desc: "ประมาณการภาษี หักเหมา/จริง ลดหย่อน ใบ 50 ทวิ และโหมดจำลองวางแผน" },
  { icon: MessageSquare, title: "Feedback Hub", desc: "จัดการ Feedback จากลูกค้าอย่างเป็นระบบ แยกเป็นรอบชัดเจน ลดความสับสน ไม่พลาด" },
  { icon: CalendarDays, title: "Content Planner", desc: "วางแผน จัดตารางงาน อย่างมีประสิทธิภาพ ช่วยให้บริหารการโพสต์โซเชียลได้ต่อเนื่อง" },
];

const STEPS = [
  { n: "01", t: "สมัครฟรี", d: "สมัครและตอบแบบฟอร์มกลุ่มบุกเบิกสั้นๆ ให้เรารู้จักคุณ" },
  { n: "02", t: "รับสิทธิ์ Tester", d: "เข้าใช้งานหลังบ้านได้ทันทีหลังตอบแบบฟอร์ม จำกัด 100 user แรก" },
  { n: "03", t: "ใช้งาน + ให้ฟีดแบ็ก", d: "ทดลองทุกฟีเจอร์ พร้อมรับสิทธิพิเศษเมื่อเปิดตัวจริง" },
];

function CalculatorSection({ remaining }: { remaining: number }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5 sm:p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-elevated">
            <Calculator className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-primary uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> The Freelance Fair Price
            </div>
            <h3 className="mt-1 text-lg sm:text-xl font-bold tracking-tight">
              ลองคำนวณราคางานฟรีใน 30 วินาที
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              ตอบคำถามสั้นๆ แล้วรู้ทันทีว่าควรเสนอราคาเท่าไหร่ — ฟรี ไม่ต้องสมัคร
            </p>
            <div className="mt-3">
              <CalculatorUsageBadge />
            </div>
          </div>
        </div>
      </div>
      <React.Suspense
        fallback={
          <div className="rounded-3xl border border-border bg-card/60 h-96 animate-pulse" />
        }
      >
        <PriceCalculator remaining={remaining} />
      </React.Suspense>
    </div>
  );
}

function Landing() {
  const { user, isAdmin } = useAuth();
  const { theme, toggle } = useTheme();
  const stats = Route.useLoaderData();
  const approved = stats?.approved ?? 0;
  const target = stats?.target ?? 100;
  const remaining = Math.max(0, target - approved);
  const pct = Math.min(100, Math.round((approved / target) * 100));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="ambient-blobs" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] -z-0"
        aria-hidden="true"
        style={{ backgroundImage: "var(--gradient-mesh)" }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src={logoUrl}
              alt="So1o Freelancer logo"
              width={36}
              height={36}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-9 w-9 rounded-xl object-cover shadow-soft ring-1 ring-border"
            />
            <div>
              <h1 className="text-sm sm:text-base font-semibold leading-none tracking-tight">
                So<span className="text-primary">1</span>o Freelancer — หลังบ้านครบวงจรสำหรับฟรีแลนซ์
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">หลังบ้านครบวงจรสำหรับฟรีแลนซ์</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
            <a href="#calculator" className="hover:text-foreground transition-colors">คำนวณราคา</a>
            <a href="#features" className="hover:text-foreground transition-colors">ฟีเจอร์</a>
            <a href="#showcase" className="hover:text-foreground transition-colors">โชว์เคส</a>
            <a href="#how" className="hover:text-foreground transition-colors">วิธีใช้</a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={toggle}
              aria-label={theme === "dark" ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              className="h-8 w-8 rounded-full"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <LineHeaderButton />
            {user && <NotificationBell />}
            {isAdmin && (
              <Link to="/admin" className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-2 text-xs font-semibold hover:bg-foreground/90 transition-colors">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            {user ? (
              <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground px-3.5 sm:px-4 py-2 text-xs font-semibold shadow-elevated hover:opacity-90 transition-opacity">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>ทดลองระบบเต็มก่อนใคร</span>
              </Link>
            ) : (
              <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground px-3.5 sm:px-4 py-2 text-xs font-semibold shadow-elevated hover:opacity-90 transition-opacity">
                <LogIn className="h-3.5 w-3.5" /> เข้าสู่ระบบ
              </Link>
            )}

            {/* Mobile Hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="เปิดเมนู"
                  className="md:hidden h-8 w-8 rounded-full"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] glass border-l border-border">
                <SheetHeader>
                  <SheetTitle className="text-left text-base">เมนู</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1 text-sm">
                  <a href="#calculator" className="px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2.5">
                    <Calculator className="h-4 w-4 text-primary" /> คำนวณราคา
                  </a>
                  <a href="#features" className="px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-primary" /> ฟีเจอร์
                  </a>
                  <a href="#showcase" className="px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2.5">
                    <LayoutGrid className="h-4 w-4 text-primary" /> โชว์เคสผลงาน
                  </a>
                  <a
                    href={ANTHEM_SHOWCASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2.5"
                  >
                    <ExternalLink className="h-4 w-4 text-primary" /> an1hem Showcase
                  </a>
                  <a href="#how" className="px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2.5">
                    <ListChecks className="h-4 w-4 text-primary" /> วิธีใช้
                  </a>
                  <Link to="/blog" className="px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-primary" /> Blog
                  </Link>
                  <Link to="/creative-partner" className="px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2.5">
                    <Briefcase className="h-4 w-4 text-primary" /> Creative Partner
                  </Link>
                  <div className="my-2 border-t border-border" />
                  {isAdmin && (
                    <Link to="/admin" className="px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-primary" /> Admin
                    </Link>
                  )}
                  {user ? (
                    <Link to="/dashboard" className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold shadow-elevated">
                      <LayoutDashboard className="h-3.5 w-3.5" /> เข้าสู่ Dashboard
                    </Link>
                  ) : (
                    <Link to="/auth" className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold shadow-elevated">
                      <LogIn className="h-3.5 w-3.5" /> เข้าสู่ระบบ
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:pt-20 sm:pb-14 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-soft">
            <Sparkles className="h-3 w-3 text-primary" />
            เปิดรับสมัคร Tester รุ่นแรก จำกัด {target} user
          </div>
          <h2 className="mt-5 text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            ทำงานฟรีแลนซ์ให้
            <br className="hidden sm:block" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">ง่ายกว่าเดิม 10 เท่า</span>
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
            บริหารลูกค้า ใบเสนอราคา การเงิน ภาษี และ supplier
            — ทุกอย่างที่ฟรีแลนซ์ต้องการ ในแอปเดียว
          </p>

          <div className="mt-8 max-w-md mx-auto rounded-2xl border border-border bg-card/80 backdrop-blur p-4 shadow-soft">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                มีคนสมัครไปแล้ว
              </span>
              <span className="text-foreground tabular-nums">
                <span className="text-primary font-bold">{approved}</span> / {target}
              </span>
            </div>
            <Progress value={pct} className="mt-2.5 h-2" />
            <p className="mt-2 text-[11px] text-muted-foreground text-center">
              {remaining > 0 ? `เหลือสิทธิ์อีกเพียง ${remaining} ที่นั่ง — รีบสมัครก่อนเต็ม` : "ปิดรับสมัครรุ่นแรกแล้ว"}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={user ? "/dashboard" : "/apply"} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-elevated hover:opacity-90 transition-opacity">
              {user ? "ทดลองระบบเต็มก่อนใคร" : "สมัครเข้ากลุ่มบุกเบิก"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={FREE_QUOTATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-card/80 backdrop-blur text-foreground px-6 py-3 text-sm font-semibold shadow-soft hover:border-primary hover:bg-card transition-all"
            >
              <FileText className="h-4 w-4 text-primary" />
              ทำใบเสนอราคาออนไลน์ฟรี
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
            <Link
              to="/creative-partner"
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-card/80 backdrop-blur text-foreground px-6 py-3 text-sm font-semibold shadow-soft hover:border-primary hover:bg-card transition-all"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              So1o Creative Partner AI
            </Link>
            <a
              href={ANTHEM_SHOWCASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card/80 backdrop-blur text-foreground px-6 py-3 text-sm font-semibold shadow-soft hover:border-primary/40 hover:bg-card transition-all"
            >
              <LayoutGrid className="h-4 w-4 text-primary" />
              โชว์เคสผลงาน an1hem
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            ใช้งานฟรีไม่จำกัด แม้สมัครเป็นผู้ทดลองไม่ทัน — เราจะค่อยๆ อัปเดตฟีเจอร์ที่พร้อมแล้วให้ใช้ในอนาคต
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> ฟรี ไม่มีบัตรเครดิต</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> ใช้งานภาษาไทย</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> รองรับภาษีไทย</span>
          </div>
        </section>

        {/* Price Calculator */}
        <section id="calculator" className="mx-auto max-w-5xl px-4 pb-14 sm:pb-20">
          <CalculatorSection remaining={remaining} />
        </section>

        {/* So1o Mentor AI Chat */}
        <React.Suspense
          fallback={
            <div className="rounded-3xl border border-border bg-card/60 h-[600px] animate-pulse" />
          }
        >
          <LandingMentorChat />
        </React.Suspense>


        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">ฟีเจอร์ที่ครบทุกมุมการทำงาน</h3>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              ออกแบบมาเพื่อฟรีแลนซ์โดยเฉพาะ ตั้งแต่รับงาน บริหาร ไปจนถึงเก็บเงินและยื่นภาษี
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card/70 backdrop-blur p-5 shadow-soft hover:shadow-elevated transition-all hover:-translate-y-0.5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <f.icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-base font-semibold">{f.title}</h4>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* an1hem — external community showcase */}
        <section id="showcase" className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 shadow-soft">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                  <LayoutGrid className="h-3 w-3" /> ผลิตภัณฑ์แยกในระบบ So1o
                </div>
                <h3 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
                  ฟีดผลงานชุมชนฟรีแลนซ์
                  <span className="text-muted-foreground font-semibold"> สไตล์ Pinterest</span>
                </h3>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                  <strong className="text-foreground font-medium">an1hem</strong> คือแพลตฟอร์มโชว์เคสและค้นพบผลงานของครีเอทีฟ —
                  ไม่ได้อยู่ใน My Desk แต่เชื่อมกับ ecosystem เดียวกัน โพสต์ผลงาน ดูแรงบันดาลใจ และเชื่อมกับชุมชนฟรีแลนซ์ไทย
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  So1o Freelancer = หลังบ้านงาน · an1hem = หน้าร้านโชว์ผลงาน
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
                <a
                  href={ANTHEM_SHOWCASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-elevated hover:opacity-90 transition-opacity"
                >
                  เปิด an1hem Showcase
                  <ExternalLink className="h-4 w-4" />
                </a>
                <Link
                  to={user ? "/dashboard" : "/apply"}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted/50 transition-colors"
                >
                  ไปหลังบ้าน My Desk
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">เริ่มใน 3 ขั้นตอน</h3>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">ใช้เวลาไม่ถึง 10 นาทีก็พร้อมรับงานแล้ว</p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card/70 backdrop-blur p-6 shadow-soft">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{s.n}</div>
                <h4 className="mt-3 text-lg font-semibold">{s.t}</h4>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-5 shadow-soft flex items-start gap-3">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-soft">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold">Responsive ทุกหน้าจอ</h4>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  ใช้งานได้ลื่นทั้งบนมือถือ แท็บเล็ต iPad และจอคอมพิวเตอร์
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-5 shadow-soft flex items-start gap-3">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-soft">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold">ทำงานที่ไหนก็ได้</h4>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  เป็นโปรแกรมออนไลน์ ไม่ต้องติดตั้ง เปิดเว็บก็ใช้งานได้ทันที
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Freelance Insights */}
        <HomeInsightsSection />

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
          <div className="rounded-3xl bg-gradient-primary p-8 sm:p-12 text-center shadow-elevated">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">
              พร้อมยกระดับงานฟรีแลนซ์ของคุณหรือยัง?
            </h3>
            <p className="mt-3 text-sm sm:text-base text-primary-foreground/85">
              สมัครฟรี ไม่ต้องใช้บัตรเครดิต เริ่มใช้งานได้ทันที
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to={user ? "/dashboard" : "/apply"} className="inline-flex items-center gap-2 rounded-full bg-card text-foreground px-6 py-3 text-sm font-semibold shadow-elevated hover:bg-card/90 transition-colors">
                {user ? "ทดลองระบบเต็มก่อนใคร" : "สมัครเข้ากลุ่มบุกเบิก"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={FREE_QUOTATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur text-primary-foreground border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/25 transition-colors"
              >
                <FileText className="h-4 w-4" />
                ลองทำใบเสนอราคาฟรี
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </section>

        <SiteFooter variant="full" />

      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
}
