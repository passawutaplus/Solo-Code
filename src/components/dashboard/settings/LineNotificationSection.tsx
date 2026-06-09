import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Crown, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LINE_ID, LINE_URL, LineGlyph } from "@/components/LineContactButton";
import {
  LINE_NOTIFY_GROUPS,
  mergeLineNotifyPrefs,
  pickLocale,
  type LineNotifyKind,
  type UserLocale,
} from "@/lib/lineNotificationKinds";
import { cn } from "@/lib/utils";

function LineGlyphBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#06C755] text-white shadow-soft",
        className,
      )}
    >
      <LineGlyph className="h-5 w-5" />
    </span>
  );
}

export function LineNotificationSection() {
  const { isPro, tier } = useSubscription();
  const { profile, refreshProfile } = useAuth();
  const locale = pickLocale(profile?.locale);
  const [saving, setSaving] = React.useState(false);
  const [enabled, setEnabled] = React.useState(false);
  const [prefs, setPrefs] = React.useState(mergeLineNotifyPrefs(null));

  const linked = Boolean(profile?.line_messaging_user_id);
  const linkedAt = profile?.line_linked_at;

  React.useEffect(() => {
    setEnabled(!!profile?.line_notify_enabled);
    setPrefs(mergeLineNotifyPrefs(profile?.line_notify_prefs));
  }, [profile]);

  const t = (th: string, en: string) => (locale === "en" ? en : th);

  async function persist(nextEnabled: boolean, nextPrefs: typeof prefs) {
    if (!profile?.user_id) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        line_notify_enabled: nextEnabled,
        line_notify_prefs: nextPrefs,
      })
      .eq("user_id", profile.user_id);
    setSaving(false);
    if (error) {
      toast.error(t("บันทึกไม่สำเร็จ", "Could not save settings"));
      return;
    }
    toast.success(t("บันทึกการแจ้งเตือน LINE แล้ว", "LINE notification settings saved"));
    await refreshProfile();
  }

  function toggleMaster(checked: boolean) {
    setEnabled(checked);
    void persist(checked, prefs);
  }

  function toggleKind(key: LineNotifyKind, checked: boolean) {
    const next = { ...prefs, [key]: checked };
    setPrefs(next);
    void persist(enabled, next);
  }

  if (!isPro) {
    return (
      <Card className="glass border-border shadow-soft overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <LineGlyphBadge className="opacity-60" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold tracking-tight">
                  {t("แจ้งเตือน LINE", "LINE notifications")}
                </h2>
                <Badge variant="secondary" className="text-[10px]">
                  Pro
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  "รับแจ้งเตือนทันทีเมื่อลูกค้าอัปโหลดสลิป ยืนยันบรีฟ หรืออนุมัติคอนเทนต์ — สำหรับสมาชิก Pro / In-House",
                  "Get instant alerts when clients upload slips, confirm briefs, or approve content — Pro / In-House only",
                )}
              </p>
              <Button asChild size="sm" className="mt-1">
                <Link to="/pricing">
                  <Crown className="h-3.5 w-3.5 mr-1.5" />
                  {t("อัปเกรดเป็น Pro", "Upgrade to Pro")}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border shadow-soft overflow-hidden">
      <CardContent className="p-4 sm:p-5 space-y-5">
        <div className="flex items-start gap-3">
          <LineGlyphBadge />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold tracking-tight">
                {t("แจ้งเตือน LINE", "LINE notifications")}
              </h2>
              <Badge
                variant="outline"
                className="text-[10px] bg-primary/10 text-primary border-primary/20"
              >
                {tier === "inhouse" ? "In-House" : "Pro"}
              </Badge>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {t(
                "เน้นเหตุการณ์จากลูกค้าใน Portal ที่คุณแชร์ — ข้อความตามภาษาที่ตั้งใน「ธีม & ภาษา」",
                "Focused on customer actions on your shared portals — messages follow your language in Theme & language",
              )}
            </p>
          </div>
        </div>

        {/* Link status — LIFF coming in Phase 2 */}
        <div
          className={cn(
            "rounded-xl border p-3.5 space-y-2",
            linked ? "border-[#06C755]/40 bg-[#06C755]/5" : "border-dashed border-border bg-muted/30",
          )}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4 text-[#06C755]" />
              {linked
                ? t("เชื่อม LINE แล้ว", "LINE connected")
                : t("ยังไม่ได้เชื่อม LINE", "LINE not connected")}
            </div>
            {!linked && (
              <Button asChild size="sm" variant="outline" className="h-8 text-xs border-[#06C755]/50">
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer">
                  <LineGlyph className="h-3.5 w-3.5 mr-1" />
                  {t("เพิ่มเพื่อน", "Add friend")} {LINE_ID}
                </a>
              </Button>
            )}
          </div>
          {linked && linkedAt && (
            <p className="text-[11px] text-muted-foreground">
              {t("เชื่อมเมื่อ", "Linked")}{" "}
              {new Date(linkedAt).toLocaleString(locale === "en" ? "en-US" : "th-TH")}
            </p>
          )}
          {!linked && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t(
                "ขั้นตอนถัดไป: เชื่อมบัญชีจากหน้านี้ (กำลังพัฒนา) — ตอนนี้เพิ่มเพื่อน OA ก่อน แล้วรอเปิดใช้การเชื่อม",
                "Next: link your account from here (coming soon). Add our OA as a friend first.",
              )}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-3">
          <div>
            <Label className="text-sm font-medium">
              {t("เปิดแจ้งเตือน LINE", "Enable LINE notifications")}
            </Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {linked
                ? t("ส่ง Push เมื่อมีเหตุการณ์ที่เลือกด้านล่าง", "Send push for events selected below")
                : t("ต้องเชื่อม LINE ก่อนจึงจะส่งได้", "Connect LINE before messages can be sent")}
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={toggleMaster}
            disabled={!linked || saving}
            aria-label={t("เปิดแจ้งเตือน LINE", "Enable LINE notifications")}
          />
        </div>

        {LINE_NOTIFY_GROUPS.map((group) => (
          <div key={group.id} className="space-y-2.5">
            <div>
              <h3 className="text-xs font-semibold text-foreground">
                {group.label[locale as UserLocale]}
              </h3>
              <p className="text-[11px] text-muted-foreground">{group.description[locale as UserLocale]}</p>
            </div>
            <div className="space-y-1.5">
              {group.kinds.map((kind) => {
                const isQuotation = kind.key === "portal_quotation";
                return (
                  <div
                    key={kind.key}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-lg border border-border/50 px-3 py-2.5",
                      isQuotation && "opacity-60",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-snug">{kind.label[locale as UserLocale]}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {kind.hint[locale as UserLocale]}
                      </p>
                    </div>
                    <Switch
                      checked={prefs[kind.key]}
                      onCheckedChange={(c) => toggleKind(kind.key, c)}
                      disabled={!enabled || !linked || saving || isQuotation}
                      className="shrink-0 mt-0.5"
                      aria-label={kind.label[locale as UserLocale]}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
