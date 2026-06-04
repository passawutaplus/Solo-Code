import { Link } from "@tanstack/react-router";
import { Check, Sparkles, Users } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLANS, planPrice, type BillingCycle } from "@/data/plans";

interface Props {
  user: { id: string } | null;
}

export function LandingPricingSection({ user }: Props) {
  const [cycle, setCycle] = React.useState<BillingCycle>("yearly");
  const seats = 3;

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          ราคา<span className="text-primary">โปร่งใส</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          เริ่มฟรี อัพเกรดเมื่อพร้อม — ดูรายละเอียดและ Top-up ได้ที่หน้าราคาเต็ม
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              className={cn(
                "px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all",
                cycle === c
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c === "monthly" ? "รายเดือน" : "รายปี"}
              {c === "yearly" && (
                <span className="ml-1.5 text-[10px] text-primary font-semibold">~20%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const displayPrice = planPrice(plan, cycle, seats);
          const isInhouse = plan.id === "inhouse";

          return (
            <div key={plan.id} className="relative">
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-primary text-primary-foreground border-0 gap-1">
                    <Sparkles className="h-3 w-3" /> แนะนำ
                  </Badge>
                </div>
              )}
              {isInhouse && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="outline" className="bg-card text-[10px]">
                    ทีม · เร็วๆ นี้
                  </Badge>
                </div>
              )}
              <Card
                className={cn(
                  "h-full p-6 flex flex-col",
                  plan.highlighted && "border-primary/40 ring-1 ring-primary/25 shadow-lg",
                )}
              >
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {isInhouse && <Users className="h-4 w-4 text-primary" />}
                  {plan.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tabular-nums">
                    {displayPrice === 0 ? "0" : displayPrice.toLocaleString("th-TH")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    THB
                    {plan.id !== "free" && (cycle === "monthly" ? "/เดือน" : "/ปี")}
                  </span>
                </div>
                {isInhouse && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    ตัวอย่าง {seats} ที่นั่ง
                  </p>
                )}
                <ul className="mt-5 space-y-2 flex-1 text-sm">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant={plan.highlighted ? "default" : "outline"} className="mt-6 w-full">
                  <Link to={plan.id === "free" ? (user ? "/dashboard" : "/apply") : "/pricing"}>
                    {plan.cta}
                  </Link>
                </Button>
              </Card>
            </div>
          );
        })}
      </div>

      <p className="text-center mt-8">
        <Link to="/pricing" className="text-sm text-primary font-medium hover:underline">
          ดูแพ็กเกจเต็ม + Top-up Credits →
        </Link>
      </p>
    </section>
  );
}
