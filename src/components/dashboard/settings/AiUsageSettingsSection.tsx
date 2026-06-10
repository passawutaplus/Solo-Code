import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Zap, Loader2, Sparkles, CreditCard, Crown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSubscription } from "@/hooks/useSubscription";
import { useAiUsage } from "@/hooks/useAiUsage";
import {
  aiRemainingBarColor,
  aiRemainingPercent,
  describeAiCreditsPlan,
  formatAiPeriodEnd,
} from "@/lib/aiCredits";
import { anthemShowcaseUrl } from "@/lib/productLinks";
import { createPortalSession } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TIER_LABEL = { free: "Free", pro: "Pro", inhouse: "In-House" } as const;

export function AiUsageSettingsSection() {
  const { tier, isPro, isActive, subscription, isLoading: subLoading } = useSubscription();
  const {
    included_used,
    included_limit,
    included_remaining,
    purchased_balance,
    total_remaining,
    period_end,
    period_type,
    isLoading: usageLoading,
  } = useAiUsage();
  const portal = useServerFn(createPortalSession);
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const isLoading = subLoading || usageLoading;
  const capacity = Math.max(included_limit, total_remaining, 1);
  const remainingPercent = aiRemainingPercent(total_remaining, capacity);
  const barColor = aiRemainingBarColor(total_remaining);
  const resetsAt = formatAiPeriodEnd(period_end);
  const planHint = describeAiCreditsPlan({ tier, period_type, included_limit });
  const isFree = tier === "free";
  const creditsEnded = period_type === "free_starter_ended" && isFree;
  const packLabel = isFree ? "เครดิตเริ่มต้น" : "โควต้าแพ็ก";

  async function openPortal() {
    setBusy(true);
    try {
      const res = await portal({
        data: { environment: getStripeEnvironment(), returnUrl: window.location.href },
      });
      if ("error" in res) throw new Error(res.error);
      window.open(res.url, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "เปิดหน้าจัดการไม่ได้");
    } finally {
      setBusy(false);
    }
  }

  const renewsAt = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Card className="border-border/60 overflow-hidden h-full">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardContent className="p-0">
          <div className="p-5 space-y-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-start justify-between gap-3 text-left group"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                    โควต้า AI
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {open
                      ? planHint
                      : `เหลือ ${total_remaining.toLocaleString("th-TH")} เครดิต`}
                  </p>
                </div>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                ) : (
                  <Badge
                    variant="secondary"
                    className={cn("shrink-0", isPro && "bg-primary/15 text-primary border-primary/20")}
                  >
                    {isPro ? <Crown className="h-3 w-3 mr-1" /> : null}
                    {TIER_LABEL[tier]}
                  </Badge>
                )}
              </button>
            </CollapsibleTrigger>

            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    isLoading ? "bg-primary" : barColor,
                  )}
                  style={{ width: `${isLoading ? 0 : remainingPercent}%` }}
                />
              </div>
              {!open && !isLoading && (
                <div className="flex items-center justify-between text-[11px] tabular-nums">
                  <span
                    className={cn(
                      total_remaining < 10
                        ? "text-destructive font-medium"
                        : total_remaining < 20
                          ? "text-amber-600 dark:text-amber-400 font-medium"
                          : "text-muted-foreground",
                    )}
                  >
                    เหลือ {total_remaining.toLocaleString("th-TH")} / {capacity.toLocaleString("th-TH")} เครดิต
                  </span>
                  {resetsAt && !isFree && (
                    <span className="text-muted-foreground">รีเซ็ต {resetsAt}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <CollapsibleContent>
            <div className="px-5 pb-4 space-y-3 border-t border-border/40 pt-4">
              {creditsEnded && (
                <p className="text-xs text-destructive">เครดิตหมดแล้ว — อัพเกรดหรือเติมเพื่อใช้ต่อ</p>
              )}

              <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{packLabel}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {included_used.toLocaleString("th-TH")} / {included_limit.toLocaleString("th-TH")}
                  </span>
                </div>
                {purchased_balance > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      เติมเพิ่ม
                    </span>
                    <span className="tabular-nums font-medium text-amber-600 dark:text-amber-400">
                      {purchased_balance.toLocaleString("th-TH")}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/40">
                  <span className="font-medium">รวมใช้ได้</span>
                  <span className="tabular-nums font-bold text-primary">
                    {total_remaining.toLocaleString("th-TH")} เครดิต
                  </span>
                </div>
                {resetsAt && !isFree && (
                  <p className="text-[11px] text-muted-foreground">รีเซ็ต {resetsAt}</p>
                )}
              </div>
            </div>

            <div className="border-t border-border/60 bg-muted/20 px-5 py-4 space-y-3">
              {isPro && isActive && renewsAt && (
                <p className="text-[11px] text-muted-foreground">
                  {subscription?.cancel_at_period_end
                    ? `สิ้นสุด ${renewsAt}`
                    : `ต่ออายุ ${renewsAt}`}
                  {subscription?.status === "past_due" && (
                    <span className="text-destructive block mt-1">ชำระไม่สำเร็จ — อัปเดตบัตร</span>
                  )}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="gap-1.5 border-amber-500/30">
                  <Link to="/pricing">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    เติมเครดิต
                  </Link>
                </Button>
                {!isPro ? (
                  <Button asChild size="sm" className="gap-1.5">
                    <Link to="/pricing">
                      <Sparkles className="h-3.5 w-3.5" />
                      อัพเกรด Pro
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={openPortal} disabled={busy} className="gap-1.5">
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CreditCard className="h-3.5 w-3.5" />
                    )}
                    จัดการชำระเงิน
                  </Button>
                )}
                {!isPro && (
                  <p className="w-full text-[10px] text-muted-foreground">
                    Pro ปลดล็อก So1o My Desk +{" "}
                    <a
                      href={anthemShowcaseUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      an1hem
                    </a>
                  </p>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
