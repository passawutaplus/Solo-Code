import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Crown, Loader2, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { useServerFn } from "@tanstack/react-start";
import { sendLineTestSamples } from "@/server/lineNotifications.functions";

const TIER_LABEL: Record<string, Record<UserLocale, string>> = {
  pro: { th: "โปร", en: "Pro" },
  pro_plus: { th: "โปร+", en: "Pro+" },
  inhouse: { th: "อินฮาวส์", en: "In-House" },
};

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

function countEnabledPrefs(prefs: Record<LineNotifyKind, boolean>): number {
  return Object.values(prefs).filter(Boolean).length;
}

export function LineNotificationSection() {
  const { isPro, tier } = useSubscription();
  const { profile, refreshProfile } = useAuth();
  const locale = pickLocale(profile?.locale);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [sendingSamples, setSendingSamples] = React.useState(false);
  const sendSamplesFn = useServerFn(sendLineTestSamples);
  const [enabled, setEnabled] = React.useState(false);
  const [prefs, setPrefs] = React.useState(mergeLineNotifyPrefs(null));

  const linked = Boolean(profile?.line_messaging_user_id);
  const linkedAt = profile?.line_linked_at;
  const enabledCount = countEnabledPrefs(prefs);

  React.useEffect(() => {
    setEnabled(!!profile?.line_notify_enabled);
    setPrefs(mergeLineNotifyPrefs(profile?.line_notify_prefs));
  }, [profile]);

  const t = (th: string, en: string) => (locale === "en" ? en : th);

  const tierLabel =
    TIER_LABEL[tier]?.[locale as UserLocale] ?? (locale === "en" ? "Pro" : "โปร");

  const collapsedSummary = linked
    ? enabled
      ? t(`เปิดอยู่ ${enabledCount} รายการ`, `${enabledCount} alerts on`)
      : t("ปิดการแจ้งเตือน", "Notifications off")
    : t("ยังไม่ได้เชื่อมบัญชี", "Not linked");

  async function persist(
    nextEnabled: boolean,
    nextPrefs: typeof prefs,
    rollback: { enabled: boolean; prefs: typeof prefs },
  ) {
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
      setEnabled(rollback.enabled);
      setPrefs(rollback.prefs);
      toast.error(t("บันทึกไม่สำเร็จ", "Could not save settings"));
      return;
    }
    toast.success(t("บันทึกการตั้งค่าแล้ว", "Settings saved"));
    await refreshProfile();
  }

  function toggleMaster(checked: boolean) {
    const rollback = { enabled, prefs };
    setEnabled(checked);
    void persist(checked, prefs, rollback);
  }

  function toggleKind(key: LineNotifyKind, checked: boolean) {
    const rollback = { enabled, prefs };
    const next = { ...prefs, [key]: checked };
    setPrefs(next);
    void persist(enabled, next, rollback);
  }

  function sampleErrorMessage(err: unknown): string {
    const code = err instanceof Error ? err.message : "";
    if (code === "line_not_linked") return t("เชื่อมบัญชีก่อนนะ", "Link your account first");
    if (code === "pro_required") return t("ต้องเป็นสมาชิกโปร", "Pro membership required");
    if (code === "line_not_configured" || code === "line_push_failed") {
      return t("ระบบไลน์ยังไม่พร้อม ลองใหม่ภายหลัง", "LINE is not configured yet");
    }
    return t("ส่งไม่สำเร็จ — ตรวจสอบการเชื่อมต่อ", "Could not send — check your connection");
  }

  async function sendAllSamples() {
    setSendingSamples(true);
    try {
      const data = await sendSamplesFn();
      toast.success(
        t(
          `ส่งตัวอย่าง ${data.sent}/${data.total} ข้อความแล้ว`,
          `Sent ${data.sent}/${data.total} sample messages`,
        ),
      );
    } catch (err) {
      toast.error(sampleErrorMessage(err));
    } finally {
      setSendingSamples(false);
    }
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
                  {t("แจ้งเตือนผ่านไลน์", "LINE notifications")}
                </h2>
                <Badge variant="secondary" className="text-[10px]">
                  {t("โปร", "Pro")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  "รับแจ้งเตือนทันทีเมื่อลูกค้าอัปโหลดสลิป ยืนยันบรีฟ หรืออนุมัติคอนเทนต์ — สำหรับสมาชิกโปรและอินฮาวส์",
                  "Get instant alerts when clients upload slips, confirm briefs, or approve content — Pro / In-House only",
                )}
              </p>
              <Button asChild size="sm" className="mt-1">
                <Link to="/pricing">
                  <Crown className="h-3.5 w-3.5 mr-1.5" />
                  {t("อัปเกรดเป็นโปร", "Upgrade to Pro")}
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
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardContent className="p-0">
          <div className="p-4 sm:p-5 space-y-4">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-start justify-between gap-3 text-left group"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <LineGlyphBadge className="shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold tracking-tight flex items-center gap-1.5 flex-wrap">
                      {t("แจ้งเตือนผ่านไลน์", "LINE notifications")}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                          open && "rotate-180",
                        )}
                      />
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {open
                        ? t(
                            "เลือกประเภทเหตุการณ์ที่ต้องการรับแจ้งเตือน — ข้อความตามภาษาที่ตั้งใน「ปรับโหมด」",
                            "Choose which events to notify — messages follow your language in Display mode",
                          )
                        : collapsedSummary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-primary/10 text-primary border-primary/20"
                  >
                    {tierLabel}
                  </Badge>
                </div>
              </button>
            </CollapsibleTrigger>

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
                    ? t("เชื่อมบัญชีแล้ว", "Account linked")
                    : t("ยังไม่ได้เชื่อมบัญชี", "Not linked yet")}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    asChild
                    size="sm"
                    className={cn(
                      "h-8 text-xs gap-1",
                      linked
                        ? "bg-[#06C755]/10 text-[#06C755] border border-[#06C755]/30 hover:bg-[#06C755]/15"
                        : "bg-[#06C755] hover:bg-[#05b34c] text-white",
                    )}
                    variant={linked ? "outline" : "default"}
                  >
                    <Link to="/line-link">
                      <LineGlyph className="h-3.5 w-3.5" />
                      {linked ? t("จัดการการเชื่อม", "Manage link") : t("เชื่อมบัญชี", "Link account")}
                    </Link>
                  </Button>
                  {!linked && (
                    <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                      <a href={LINE_URL} target="_blank" rel="noopener noreferrer">
                        {t("เพิ่มเพื่อน", "Add friend")} {LINE_ID}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              {linked && linkedAt && (
                <p className="text-[11px] text-muted-foreground">
                  {t("เชื่อมเมื่อ", "Linked")}{" "}
                  {new Date(linkedAt).toLocaleString(locale === "en" ? "en-US" : "th-TH")}
                </p>
              )}
              {linked && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t(
                    "ปรึกษา AI ในแชท @solofreelancer ได้ — ใช้เครดิตร่วมกับ Assistant บนเว็บ · พิมพ์「ทีมงาน」เพื่อคุยแอดมิน",
                    "Ask AI in @solofreelancer chat — shares credits with web Assistant · type「ทีมงาน」for human support",
                  )}
                </p>
              )}
              {!linked && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t(
                    "กด「เชื่อมบัญชี」เพื่อล็อกอิน — ใช้บัญชีเดียวกับแพลตฟอร์มโชว์เคส",
                    "Tap Link account to sign in — one account for showcase and desk",
                  )}
                </p>
              )}
            </div>
          </div>

          <CollapsibleContent>
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-5 border-t border-border/50 pt-4">
              {linked && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 w-full sm:w-auto"
                  disabled={sendingSamples}
                  onClick={() => void sendAllSamples()}
                >
                  {sendingSamples ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {t("ส่งตัวอย่างทั้งหมด", "Send all samples")}
                </Button>
              )}

              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-3">
                <div>
                  <Label className="text-sm font-medium">
                    {t("เปิดการแจ้งเตือน", "Enable notifications")}
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {linked
                      ? t("ส่งแจ้งเตือนเมื่อมีเหตุการณ์ที่เลือกด้านล่าง", "Notify for selected events below")
                      : t("ต้องเชื่อมบัญชีก่อนจึงจะส่งได้", "Link your account first")}
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={toggleMaster}
                  disabled={!linked || saving}
                  aria-label={t("เปิดการแจ้งเตือน", "Enable notifications")}
                />
              </div>

              {LINE_NOTIFY_GROUPS.map((group) => (
                <div key={group.id} className="space-y-2.5">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">
                      {group.label[locale as UserLocale]}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {group.description[locale as UserLocale]}
                    </p>
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
                            <p className="text-xs font-medium leading-snug">
                              {kind.label[locale as UserLocale]}
                            </p>
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
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
