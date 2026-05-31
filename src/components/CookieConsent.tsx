import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "so1o-cookie-consent";
const MAX_AGE_DAYS = 180;

type ConsentValue = "all" | "essential" | "dismissed";
interface StoredConsent {
  value: ConsentValue;
  at: number;
}

function readConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    const ageDays = (Date.now() - parsed.at) / (1000 * 60 * 60 * 24);
    if (ageDays > MAX_AGE_DAYS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(value: ConsentValue) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ value, at: Date.now() } satisfies StoredConsent),
    );
  } catch {
    /* ignore */
  }
}

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Defer to avoid hydration mismatch + give the user time to land on the page
    const t = window.setTimeout(() => {
      if (!readConsent()) setVisible(true);
    }, 600);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  const dismiss = (value: ConsentValue) => {
    writeConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="การยินยอมใช้คุกกี้"
      className="fixed z-[60] inset-x-3 bottom-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="relative rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-xl ring-1 ring-primary/10 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => dismiss("dismissed")}
          aria-label="ปิด"
          className="absolute right-2 top-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-start gap-3 pr-4">
          <div className="shrink-0 h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Cookie className="h-4 w-4" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">เราใช้คุกกี้</h3>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              เพื่อให้ระบบล็อกอินและบันทึกการตั้งค่าใช้งานได้ และเพื่อวิเคราะห์ฟีเจอร์ที่ผู้ใช้ชอบ
              อ่านรายละเอียดได้ที่{" "}
              <Link to="/cookies" className="text-primary hover:underline font-medium">
                นโยบายคุกกี้
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => dismiss("essential")}
            className="flex-1 h-9 text-xs"
          >
            เฉพาะที่จำเป็น
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => dismiss("all")}
            className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90"
          >
            ยอมรับทั้งหมด
          </Button>
        </div>
      </div>
    </div>
  );
}
