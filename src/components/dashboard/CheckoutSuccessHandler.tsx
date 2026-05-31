import * as React from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";

/**
 * After Stripe redirect (?upgrade=success or ?topup=success), poll subscription
 * until the webhook has propagated, then show a celebratory toast.
 * Mount once near the dashboard root.
 */
export function CheckoutSuccessHandler() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, string | undefined>;
  const { tier, credits, refetch } = useSubscription();
  const handled = React.useRef(false);

  React.useEffect(() => {
    if (handled.current) return;
    const isUpgrade = search.upgrade === "success";
    const isTopup = search.topup === "success";
    if (!isUpgrade && !isTopup) return;
    handled.current = true;

    const id = toast.loading(
      isUpgrade ? "กำลังเปิดใช้งานแพ็กเกจ Pro…" : "กำลังเติมเครดิต…",
    );

    let attempts = 0;
    const initialTier = tier;
    const initialCredits = credits;
    const interval = setInterval(async () => {
      attempts++;
      const res = await refetch();
      const newTier = res.data?.profileTier ?? "free";
      const newCredits = res.data?.credits ?? 0;

      const upgraded = isUpgrade && newTier !== "free" && newTier !== initialTier;
      const topped = isTopup && newCredits > initialCredits;

      if (upgraded || topped || attempts >= 12) {
        clearInterval(interval);
        toast.dismiss(id);
        if (upgraded) toast.success("🎉 อัปเกรดสำเร็จ! ยินดีต้อนรับสู่ Pro");
        else if (topped) toast.success(`⚡ เติมเครดิตสำเร็จ +${newCredits - initialCredits}`);
        else toast.info("ระบบกำลังประมวลผล — รีเฟรชหน้าอีกครั้งภายใน 1 นาที");
        // Clean URL
        const { upgrade, topup, ...rest } = search;
        navigate({ to: "/dashboard", search: rest as any, replace: true });
      }
    }, 2500);

    return () => {
      clearInterval(interval);
      toast.dismiss(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
