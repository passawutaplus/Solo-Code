import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Crown, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { ANTHEM_SHOWCASE_URL } from "@/lib/productLinks";
import { createPortalSession } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TIER_LABEL = { free: "Free", pro: "Pro", inhouse: "In-House" } as const;

export function BillingSettingsSection() {
  const { tier, isPro, isActive, subscription, isLoading } = useSubscription();
  const portal = useServerFn(createPortalSession);
  const [busy, setBusy] = React.useState(false);

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
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              แผนและการชำระเงิน
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Pro ปลดล็อกทั้ง So1o My Desk และ{" "}
              <a
                href={ANTHEM_SHOWCASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                an1hem
              </a>{" "}
              บัญชีเดียวกัน
            </p>
          </div>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Badge
              variant="secondary"
              className={cn(
                isPro && "bg-primary/15 text-primary border-primary/20",
              )}
            >
              {isPro ? <Crown className="h-3 w-3 mr-1" /> : null}
              {TIER_LABEL[tier]}
            </Badge>
          )}
        </div>

        {isPro && isActive && renewsAt && (
          <p className="text-xs text-muted-foreground">
            {subscription?.cancel_at_period_end
              ? `สิ้นสุดวันที่ ${renewsAt} (ไม่ต่ออายุอัตโนมัติ)`
              : `ต่ออายุถัดไป: ${renewsAt}`}
            {subscription?.status === "past_due" && (
              <span className="text-destructive block mt-1">การชำระเงินล่าสุดไม่สำเร็จ — กรุณาอัปเดตบัตร</span>
            )}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!isPro ? (
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/pricing">
                <Sparkles className="h-3.5 w-3.5" />
                อัพเกรด Pro
              </Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={openPortal} disabled={busy} className="gap-1.5">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
              จัดการการชำระเงิน
            </Button>
          )}
          <Button asChild size="sm" variant="ghost">
            <Link to="/pricing">ดูแผนราคา</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to="/refund">นโยบายคืนเงิน</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
