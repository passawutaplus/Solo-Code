import * as React from "react";
import { Download, Apple, Smartphone, Monitor, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Platform = "android" | "ios" | "windows" | "mac";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "windows";
  const ua = navigator.userAgent || "";
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
    navigator.platform ||
    "";
  if (/Android/i.test(ua)) return "android";
  if (
    /iPhone|iPad|iPod/i.test(ua) ||
    (platform === "MacIntel" && (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1)
  )
    return "ios";
  if (/Windows/i.test(ua) || /Win/i.test(platform)) return "windows";
  if (/Mac/i.test(ua) || /Mac/i.test(platform)) return "mac";
  return "windows";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export type InstallAppButtonProps = {
  variant?: "icon" | "full";
  className?: string;
};

export function InstallAppButton({ variant = "icon", className }: InstallAppButtonProps) {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState<boolean>(false);
  const [detected, setDetected] = React.useState<Platform>("windows");
  const [active, setActive] = React.useState<Platform>("windows");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const p = detectPlatform();
    setDetected(p);
    setActive(p);
    setInstalled(isStandalone());

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      toast.success("ติดตั้งแอป So1o สำเร็จแล้ว 🎉");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleOneClick = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") toast.success("กำลังติดตั้งแอป...");
      setDeferred(null);
      setOpen(false);
    } catch {
      toast.error("ติดตั้งไม่สำเร็จ ลองอีกครั้งนะครับ");
    }
  };

  const Trigger =
    variant === "icon" ? (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={
          className ??
          "h-8 w-8 rounded-full text-primary hover:bg-primary/10 border border-primary/20"
        }
        aria-label="ติดตั้งแอป So1o"
        title="ติดตั้งแอป So1o"
      >
        <Download className="h-4 w-4" />
      </Button>
    ) : (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={className ?? "h-8 gap-1.5"}
      >
        <Download className="h-4 w-4" /> Save So1o เป็นแอป
      </Button>
    );

  const platforms: { id: Platform; label: string; icon: React.ReactNode }[] = [
    { id: "android", label: "Android", icon: <Smartphone className="h-3.5 w-3.5" /> },
    { id: "ios", label: "iPhone", icon: <Apple className="h-3.5 w-3.5" /> },
    { id: "windows", label: "Windows", icon: <Monitor className="h-3.5 w-3.5" /> },
    { id: "mac", label: "Mac", icon: <Apple className="h-3.5 w-3.5" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        {/* Hero */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-primary/8 to-transparent">
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-elevated mb-3">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-bold">Save So1o เป็นแอป</DialogTitle>
              <p className="text-xs text-muted-foreground max-w-[300px]">
                คล้ายกับการ <span className="font-semibold text-foreground">สร้าง Shortcut</span> ของเว็บ So1o ไว้บนเครื่อง
                <br />
                เพื่อให้เปิดเข้าใช้งานได้สะดวก รวดเร็ว เหมือนแอปจริง
                <br />
                <span className="text-[10px] opacity-80">
                  (ไม่ใช่การดาวน์โหลดไฟล์ติดตั้ง — ทำตามขั้นตอนด้านล่างได้เลย)
                </span>
              </p>
            </DialogHeader>

          </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* One-click install (browsers that support prompt) */}
          {deferred && (
            <button
              type="button"
              onClick={handleOneClick}
              className="w-full rounded-xl bg-gradient-primary text-primary-foreground py-3 px-4 text-sm font-semibold shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" /> ติดตั้งทันที (คลิกเดียว)
            </button>
          )}

          {/* Platform tabs */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-2 text-center uppercase tracking-wider">
              เลือกอุปกรณ์ของคุณ
            </p>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted/50 rounded-xl">
              {platforms.map((p) => {
                const isActive = active === p.id;
                const isDetected = detected === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActive(p.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[11px] font-medium transition-all",
                      isActive
                        ? "bg-background shadow-soft text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p.icon}
                    <span>{p.label}</span>
                    {isDetected && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                    )}
                  </button>
                );
              })}
            </div>
            {detected === active ? (
              <p className="text-[10px] text-primary text-center mt-1.5 flex items-center justify-center gap-1">
                <Check className="h-2.5 w-2.5" /> เครื่องของคุณ
              </p>
            ) : (
              <div className="h-3.5" />
            )}
          </div>

          {/* Steps */}
          <Steps platform={active} />

          <p className="text-[10px] text-muted-foreground text-center pt-1">
            ฟรี · ถอนติดตั้งได้ทุกเมื่อ (กดค้างที่ไอคอนแล้วลบ)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================ */
/* Step content per platform                                    */
/* ============================================================ */

function Steps({ platform }: { platform: Platform }) {
  const steps = STEPS[platform];
  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => (
        <StepCard key={i} index={i + 1} title={s.title} desc={s.desc} visual={s.visual} />
      ))}
      {NOTES[platform] && (
        <p className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg px-3 py-2">
          ⚠️ {NOTES[platform]}
        </p>
      )}
    </div>
  );
}

function StepCard({
  index,
  title,
  desc,
  visual,
}: {
  index: number;
  title: string;
  desc: string;
  visual: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 items-start rounded-xl border border-border bg-card p-3">
      <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold grid place-items-center shadow-soft">
        {index}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <div className="shrink-0 w-20 h-14 rounded-lg bg-muted/60 border border-border/60 overflow-hidden grid place-items-center">
        {visual}
      </div>
    </div>
  );
}

/* ============================================================ */
/* Tiny inline browser-UI illustrations                          */
/* ============================================================ */

const HighlightRing: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn("relative", className)}>
    <div className="absolute inset-0 rounded-full ring-2 ring-primary animate-pulse" />
    {children}
  </div>
);

// Chrome address bar with menu (⋮) highlighted
function VisualChromeMenu() {
  return (
    <svg viewBox="0 0 80 56" className="w-full h-full">
      <rect x="2" y="6" width="76" height="10" rx="5" className="fill-background stroke-border" />
      <rect x="6" y="9" width="48" height="4" rx="2" className="fill-muted-foreground/30" />
      <circle cx="68" cy="11" r="0.8" className="fill-foreground" />
      <circle cx="68" cy="11" r="0.8" className="fill-foreground" transform="translate(0,-3)" />
      <circle cx="68" cy="11" r="0.8" className="fill-foreground" transform="translate(0,3)" />
      <circle cx="68" cy="11" r="5" className="fill-none stroke-primary" strokeWidth="1.5">
        <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <rect x="6" y="22" width="68" height="28" rx="2" className="fill-card stroke-border" />
      <text x="40" y="40" textAnchor="middle" className="fill-foreground" fontSize="6">
        so1o.com
      </text>
    </svg>
  );
}

// "Install App" menu item
function VisualInstallMenuItem() {
  return (
    <svg viewBox="0 0 80 56" className="w-full h-full">
      <rect x="4" y="4" width="72" height="48" rx="3" className="fill-card stroke-border" />
      <rect x="8" y="8" width="64" height="8" rx="1" className="fill-muted/60" />
      <text x="10" y="14" className="fill-muted-foreground" fontSize="5">
        New tab
      </text>
      <rect x="8" y="18" width="64" height="8" rx="1" className="fill-primary/15 stroke-primary" strokeWidth="0.8">
        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <text x="10" y="24" className="fill-primary" fontSize="5" fontWeight="bold">
        ⬇ Install So1o
      </text>
      <rect x="8" y="28" width="64" height="8" rx="1" className="fill-muted/60" />
      <text x="10" y="34" className="fill-muted-foreground" fontSize="5">
        Bookmarks
      </text>
    </svg>
  );
}

// Confirm install dialog
function VisualInstallConfirm() {
  return (
    <svg viewBox="0 0 80 56" className="w-full h-full">
      <rect x="6" y="10" width="68" height="36" rx="4" className="fill-card stroke-border" />
      <text x="40" y="22" textAnchor="middle" fontSize="5" className="fill-foreground" fontWeight="bold">
        Install So1o?
      </text>
      <rect x="14" y="30" width="22" height="9" rx="2" className="fill-muted" />
      <text x="25" y="36" textAnchor="middle" fontSize="4.5" className="fill-foreground">
        Cancel
      </text>
      <rect x="44" y="30" width="22" height="9" rx="2" className="fill-primary">
        <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <text x="55" y="36" textAnchor="middle" fontSize="4.5" className="fill-primary-foreground" fontWeight="bold">
        Install
      </text>
    </svg>
  );
}

// Safari share icon
function VisualSafariShare() {
  return (
    <svg viewBox="0 0 80 56" className="w-full h-full">
      <rect x="4" y="6" width="72" height="38" rx="3" className="fill-card stroke-border" />
      <rect x="4" y="44" width="72" height="8" rx="0" className="fill-muted/60 stroke-border" />
      <g transform="translate(38,46)">
        <rect x="-5" y="-1" width="10" height="6" rx="1" className="fill-none stroke-primary" strokeWidth="1.2" />
        <line x1="0" y1="-4" x2="0" y2="2" className="stroke-primary" strokeWidth="1.2" />
        <polyline points="-2,-2 0,-4 2,-2" className="fill-none stroke-primary" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="7" className="fill-none stroke-primary" strokeWidth="1">
          <animate attributeName="r" values="6;9;6" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

// "Add to Home Screen"
function VisualAddToHome() {
  return (
    <svg viewBox="0 0 80 56" className="w-full h-full">
      <rect x="4" y="4" width="72" height="48" rx="3" className="fill-card stroke-border" />
      <rect x="8" y="8" width="64" height="8" rx="1" className="fill-muted/60" />
      <text x="10" y="14" fontSize="5" className="fill-muted-foreground">
        Copy
      </text>
      <rect x="8" y="18" width="64" height="8" rx="1" className="fill-primary/15 stroke-primary" strokeWidth="0.8">
        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <text x="10" y="24" fontSize="4.5" className="fill-primary" fontWeight="bold">
        ＋ Add to Home Screen
      </text>
      <rect x="8" y="28" width="64" height="8" rx="1" className="fill-muted/60" />
      <text x="10" y="34" fontSize="5" className="fill-muted-foreground">
        Save to Files
      </text>
    </svg>
  );
}

// Safari "Add" confirmation
function VisualSafariAddConfirm() {
  return (
    <svg viewBox="0 0 80 56" className="w-full h-full">
      <rect x="4" y="4" width="72" height="48" rx="3" className="fill-card stroke-border" />
      <text x="10" y="14" fontSize="5" className="fill-muted-foreground">
        Cancel
      </text>
      <text x="40" y="14" textAnchor="middle" fontSize="5" className="fill-foreground" fontWeight="bold">
        Home Screen
      </text>
      <text x="70" y="14" textAnchor="end" fontSize="5" className="fill-primary" fontWeight="bold">
        Add
      </text>
      <circle cx="70" cy="12" r="6" className="fill-none stroke-primary" strokeWidth="1">
        <animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <rect x="20" y="22" width="40" height="22" rx="6" className="fill-gradient-primary" style={{ fill: "hsl(var(--primary))" }} />
      <text x="40" y="36" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">
        So1o
      </text>
    </svg>
  );
}

// Chrome/Edge install icon in URL bar (desktop)
function VisualUrlBarInstall() {
  return (
    <svg viewBox="0 0 80 56" className="w-full h-full">
      <rect x="2" y="14" width="76" height="10" rx="5" className="fill-background stroke-border" />
      <rect x="6" y="17" width="44" height="4" rx="2" className="fill-muted-foreground/30" />
      <g transform="translate(60,19)">
        <rect x="-4" y="-2" width="8" height="5" rx="0.5" className="fill-none stroke-primary" strokeWidth="1" />
        <line x1="0" y1="-4" x2="0" y2="1" className="stroke-primary" strokeWidth="1" />
        <polyline points="-2,-2 0,1 2,-2" className="fill-none stroke-primary" strokeWidth="1" />
        <circle cx="0" cy="0" r="6" className="fill-none stroke-primary" strokeWidth="1">
          <animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
      <rect x="6" y="30" width="68" height="20" rx="2" className="fill-card stroke-border" />
      <text x="40" y="42" textAnchor="middle" fontSize="6" className="fill-foreground">
        so1o.com
      </text>
    </svg>
  );
}

// macOS Safari "Add to Dock"
function VisualMacDock() {
  return (
    <svg viewBox="0 0 80 56" className="w-full h-full">
      <rect x="4" y="4" width="72" height="36" rx="3" className="fill-card stroke-border" />
      <rect x="8" y="8" width="20" height="6" rx="1" className="fill-muted/60" />
      <text x="10" y="13" fontSize="4.5" className="fill-muted-foreground">
        File
      </text>
      <rect x="8" y="16" width="64" height="7" rx="1" className="fill-primary/15 stroke-primary" strokeWidth="0.8">
        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <text x="10" y="21" fontSize="4.5" className="fill-primary" fontWeight="bold">
        Add to Dock…
      </text>
      <rect x="2" y="44" width="76" height="10" rx="5" className="fill-muted/40 stroke-border" />
      <circle cx="12" cy="49" r="3" className="fill-primary" />
      <circle cx="22" cy="49" r="3" className="fill-muted-foreground/40" />
      <circle cx="32" cy="49" r="3" className="fill-muted-foreground/40" />
    </svg>
  );
}

/* ============================================================ */
/* Per-platform step data                                       */
/* ============================================================ */

type Step = { title: string; desc: string; visual: React.ReactNode };

const STEPS: Record<Platform, Step[]> = {
  android: [
    {
      title: "แตะปุ่มเมนู ⋮",
      desc: "อยู่มุมขวาบนของ Chrome",
      visual: <VisualChromeMenu />,
    },
    {
      title: 'เลือก "Install app"',
      desc: 'หรือ "Add to Home screen"',
      visual: <VisualInstallMenuItem />,
    },
    {
      title: 'ยืนยัน "Install"',
      desc: "ไอคอนจะขึ้นบนหน้าจอหลักทันที",
      visual: <VisualInstallConfirm />,
    },
  ],
  ios: [
    {
      title: "แตะปุ่ม Share ⬆️",
      desc: "อยู่ตรงกลางแถบล่างของ Safari",
      visual: <VisualSafariShare />,
    },
    {
      title: 'เลื่อนหา "Add to Home Screen"',
      desc: "เลื่อนรายการเมนูลง จะเจอตัวเลือกนี้",
      visual: <VisualAddToHome />,
    },
    {
      title: 'แตะ "Add" มุมขวาบน',
      desc: "ไอคอน So1o จะปรากฏบนหน้าจอหลัก",
      visual: <VisualSafariAddConfirm />,
    },
  ],
  windows: [
    {
      title: "ดูที่แถบ URL ด้านบน",
      desc: "หาไอคอน ⬇️ ติดตั้ง (ด้านขวาของช่อง URL)",
      visual: <VisualUrlBarInstall />,
    },
    {
      title: "คลิกไอคอน ⬇️",
      desc: 'หรือเปิดเมนู ⋮ → "Install So1o…"',
      visual: <VisualChromeMenu />,
    },
    {
      title: 'กด "Install"',
      desc: "So1o จะเปิดเป็นหน้าต่างแยก + มีไอคอนใน Start Menu",
      visual: <VisualInstallConfirm />,
    },
  ],
  mac: [
    {
      title: "เปิดด้วย Safari",
      desc: "หรือใช้ Chrome / Edge ก็ได้",
      visual: <VisualSafariShare />,
    },
    {
      title: 'เมนู File → "Add to Dock…"',
      desc: "Chrome: คลิกไอคอน ⬇️ ที่แถบ URL แทน",
      visual: <VisualMacDock />,
    },
    {
      title: 'ยืนยัน "Add"',
      desc: "ไอคอน So1o จะอยู่ใน Dock และ Launchpad",
      visual: <VisualInstallConfirm />,
    },
  ],
};

const NOTES: Partial<Record<Platform, string>> = {
  ios: "ต้องเปิดด้วย Safari เท่านั้น — Chrome บน iPhone ไม่รองรับการติดตั้ง",
  mac: "ฟีเจอร์ Add to Dock ต้องใช้ macOS Sonoma (14) ขึ้นไป",
};
