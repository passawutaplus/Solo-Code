import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Check, Circle, ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "brand", label: "ตั้งค่าโปรไฟล์ร้าน (โลโก้/ธนาคาร)", tab: "settings" as const },
  { id: "client", label: "เพิ่มลูกค้าคนแรก", tab: "mydata", sub: "clients" },
  { id: "quotation", label: "สร้างใบเสนอราคา / ดีล", tab: "finance", sub: "pipeline" },
  { id: "tracker", label: "แชร์ Job Tracker ให้ลูกค้า", tab: "finance", sub: "jobs" },
  { id: "income", label: "บันทึกรายได้เมื่อได้เงิน", tab: "finance", sub: "income" },
  { id: "tax", label: "ดูภาษีประมาณการปีนี้", tab: "finance", sub: "tax" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

type OnboardingProgress = Partial<Record<StepId, boolean>>;

export function OnboardingChecklist({
  onGo,
  stats,
}: {
  onGo: (tab: string, sub?: string) => void;
  stats: {
    clients: number;
    quotations: number;
    jobs: number;
    incomes: number;
    hasBrand?: boolean;
  };
}) {
  const { user, profile } = useAuth();
  const [dismissed, setDismissed] = React.useState(false);
  const [manual, setManual] = React.useState<OnboardingProgress>({});

  React.useEffect(() => {
    const data = (profile?.onboarding_data ?? {}) as Record<string, unknown>;
    if (data.pipeline_checklist_dismissed) setDismissed(true);
    if (data.pipeline_checklist_manual) {
      setManual(data.pipeline_checklist_manual as OnboardingProgress);
    }
  }, [profile?.onboarding_data]);

  const autoDone: OnboardingProgress = {
    brand: stats.hasBrand ?? false,
    client: stats.clients > 0,
    quotation: stats.quotations > 0,
    tracker: stats.jobs > 0,
    income: stats.incomes > 0,
    tax: stats.incomes > 0,
  };

  const done = (id: StepId) => !!(autoDone[id] || manual[id]);
  const completedCount = STEPS.filter((s) => done(s.id)).length;
  const allDone = completedCount === STEPS.length;

  if (dismissed || allDone) return null;

  const dismiss = async () => {
    setDismissed(true);
    if (!user) return;
    const prev = (profile?.onboarding_data ?? {}) as Record<string, unknown>;
    await supabase
      .from("profiles")
      .update({
        onboarding_data: { ...prev, pipeline_checklist_dismissed: true },
      } as never)
      .eq("user_id", user.id);
  };

  return (
    <Card className="border-[#FF5F05]/25 bg-gradient-to-br from-[#FF5F05]/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">เริ่มต้นใช้ So1o — {completedCount}/{STEPS.length}</CardTitle>
          <button
            type="button"
            onClick={dismiss}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            ซ่อน
          </button>
        </div>
        <p className="text-xs text-muted-foreground">ทำครบ {STEPS.length} ขั้นเพื่อบริหารงานแบบมืออาชีพ</p>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {STEPS.map((step) => {
          const isDone = done(step.id);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onGo(step.tab, step.sub)}
              className={cn(
                "w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition hover:bg-muted/50",
                isDone && "opacity-70",
              )}
            >
              {isDone ? (
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className={cn("flex-1", isDone && "line-through text-muted-foreground")}>
                {step.label}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          );
        })}
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => onGo("finance", "pipeline")}
          >
            เปิด Pipeline
          </Button>
          <Button size="sm" variant="ghost" className="text-xs gap-1" asChild>
            <Link to="/help/getting-started">
              <BookOpen className="h-3.5 w-3.5" />
              คู่มือ
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
