import * as React from "react";
import { Home, Newspaper, Compass } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { TrendsTab } from "./TrendsTab";
import { InspireSection } from "./inspire/InspireSection";
import { PageFooterActions } from "./PageFooterActions";

export function HomeTab() {
  const { profile } = useAuth();
  const name = profile?.brand_name || profile?.display_name || "";
  const today = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  React.useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash !== "news" && hash !== "inspire") return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7 shadow-soft">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-3 min-w-0">
          <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-3 shadow-elevated shrink-0">
            <Home className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">So1o Home</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 leading-tight">
              สวัสดี{name ? `, ${name}` : ""} 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 capitalize">
              {today} · อัปเดตและแรงบันดาลใจวันนี้
            </p>
          </div>
        </div>
      </header>

      <section id="news" className="space-y-4 scroll-mt-24">
        <SectionHeading
          icon={Newspaper}
          title="ข่าวสาร & เทรนด์"
          subtitle="So1o Daily — สรุปข่าวครีเอทีฟและเทรนด์วันนี้"
        />
        <TrendsTab embedded />
      </section>

      <section id="inspire" className="space-y-4 scroll-mt-24 pt-2 border-t border-border/60">
        <SectionHeading
          icon={Compass}
          title="Inspire"
          subtitle="แหล่งบ่มเพาะไอเดียสำหรับฟรีแลนซ์ครีเอทีฟ"
        />
        <InspireSection previewLimit={6} />
      </section>

      <PageFooterActions feature="home" label="Home" />
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="rounded-lg bg-primary-soft text-primary p-2 shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
