import { Link } from "@tanstack/react-router";
import {
  FileText,
  ListChecks,
  Coins,
  Briefcase,
  FlaskConical,
  Smartphone,
  Monitor,
} from "lucide-react";
import { ANTHEM_SHOWCASE_URL } from "@/lib/productLinks";

const MODULES = [
  { icon: FileText, label: "ใบเสนอราคา", href: "#quotation-demo", external: false },
  { icon: ListChecks, label: "Job Tracker", href: "#features", external: false },
  { icon: Coins, label: "การเงิน & ภาษี", href: "#features", external: false },
  { icon: Briefcase, label: "Smart Brief", href: "#features", external: false },
  { icon: FlaskConical, label: "Creative Labs", href: "/labs", external: false, route: true },
] as const;

export function LandingProductShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          หลังบ้านที่ฟรีแลนซ์ไทยใช้จริง
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          ดูตัวอย่าง UI บนเดสก์ท็อปและมือถือ — ออกแบบให้ใช้งานได้ทุก device
        </p>
      </div>

      <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4">
        <DeviceFrame variant="desktop" />
        <DeviceFrame variant="mobile" />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const className =
            "inline-flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-3 min-w-[88px] shadow-soft hover:border-primary/40 hover:shadow-elevated transition-all";
          const inner = (
            <>
              <div className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-soft">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-center">{m.label}</span>
            </>
          );
          if ("route" in m && m.route) {
            return (
              <Link key={m.label} to={m.href} className={className}>
                {inner}
              </Link>
            );
          }
          return (
            <a key={m.label} href={m.href} className={className}>
              {inner}
            </a>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        โชว์เคสผลงานชุมชนอยู่ที่{" "}
        <a
          href={ANTHEM_SHOWCASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline"
        >
          an1hem Showcase
        </a>
        {" "}— แยกจาก My Desk
      </p>
    </section>
  );
}

function DeviceFrame({ variant }: { variant: "desktop" | "mobile" }) {
  const isMobile = variant === "mobile";
  return (
    <div
      className={
        isMobile
          ? "w-[140px] sm:w-[160px] shrink-0 lg:absolute lg:right-[8%] lg:-bottom-4 z-10"
          : "w-full max-w-xl"
      }
    >
      <div className="rounded-[1.25rem] border-4 border-neutral-800/90 bg-neutral-900 p-1.5 shadow-2xl">
        <div className="rounded-xl overflow-hidden bg-muted aspect-[16/10] relative">
          {/* TODO: replace with dashboard screenshot / GIF */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-card to-muted flex flex-col items-center justify-center gap-2 p-4">
            {isMobile ? (
              <Smartphone className="h-8 w-8 text-primary/60" />
            ) : (
              <Monitor className="h-10 w-10 text-primary/60" />
            )}
            <span className="text-[10px] font-medium text-muted-foreground text-center">
              {isMobile ? "Mobile preview" : "Dashboard preview"}
            </span>
            <span className="text-[9px] text-muted-foreground/80">TODO: asset</span>
          </div>
        </div>
      </div>
    </div>
  );
}
