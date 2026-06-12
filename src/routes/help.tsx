import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, FileText, Coins, Rocket, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "ศูนย์ช่วยเหลือ — So1o Freelancer" },
      {
        name: "description",
        content:
          "คู่มือใช้งาน So1o Freelancer — เริ่มต้น ภาษี Smart Brief ใบเสนอราคา และติดตามงานลูกค้า",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://solofreelancer.com/help" }],
  }),
  component: HelpIndexPage,
});

const GUIDES = [
  {
    to: "/help/getting-started",
    icon: Rocket,
    title: "เริ่มต้นใช้งาน",
    desc: "3 ขั้นแรกหลังสมัคร — ตั้งแบรนด์ เพิ่มลูกค้า สร้างใบเสนอราคา",
    tag: "แนะนำ",
  },
  {
    to: "/help/brief",
    icon: MessageCircle,
    title: "Smart Brief & Job Tracker",
    desc: "ส่งบรีฟให้ลูกค้า ติดตามงาน และรับ feedback รอบแก้ไข",
    tag: "ลูกค้า",
  },
  {
    to: "/help/tax",
    icon: Coins,
    title: "คู่มือภาษีฟรีแลนซ์",
    desc: "บันทึกรายได้ ใบ 50ทวิ ประมาณการภาษี และส่งนักบัญชี",
    tag: "ภาษี",
  },
] as const;

function HelpIndexPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 shrink-0">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> หน้าแรก
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">ศูนย์ช่วยเหลือ</h1>
            <p className="text-[11px] text-muted-foreground">คู่มือภาษาไทย อ่านจบแล้วลงมือได้เลย</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            เลือกหัวข้อที่ต้องการ — ทุกคู่มือออกแบบให้<strong> ฟรีแลนซ์ไทย</strong> ใช้งานจริงใน My Desk
          </p>
        </div>

        <div className="grid gap-3">
          {GUIDES.map((g) => {
            const Icon = g.icon;
            return (
              <Link key={g.to} to={g.to} className="block group">
                <Card className="transition-colors group-hover:border-primary/40">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-semibold">{g.title}</h2>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {g.tag}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{g.desc}</p>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild className="flex-1">
            <Link to="/dashboard">เปิด My Desk</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <a href="mailto:hello@solofreelancer.com">ติดต่อทีมงาน</a>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
