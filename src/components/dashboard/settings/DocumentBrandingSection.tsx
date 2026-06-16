import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Palette, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  resolveDocumentTheme,
  type DocumentThemeInput,
  type ResolvedDocumentTheme,
} from "@/lib/documentTheme";
import {
  SOLO_DEFAULT_BRIEF,
  SOLO_DEFAULT_INVOICE,
  SOLO_DEFAULT_PRIMARY,
  SOLO_DEFAULT_RECEIPT,
} from "@/lib/documentTheme/defaults";
import { normalizeHex } from "@/lib/colorUtils";
import { PreviewPanel } from "@/components/dashboard/quotations/PreviewPanel";
import type { Quotation } from "@/store/quotations";

const PREVIEW_QUOTATION: Quotation = {
  id: "preview",
  number: "QT-PREVIEW",
  projectName: "ตัวอย่างโปรเจกต์",
  clientName: "ลูกค้าตัวอย่าง",
  items: [{ id: "1", name: "ออกแบบโลโก้", description: "3 แบบ + แก้ไข 2 รอบ", quantity: 1, unitPrice: 15000 }],
  addons: [],
  difficulties: [],
  milestones: [],
  hiddenCost: 0,
  discountValue: 0,
  discountKind: "percent",
  vatEnabled: false,
  vatRate: 7,
  whtEnabled: false,
  whtRate: 3,
  depositPreset: 50,
  paymentTerms: "มัดจำ 50% ก่อนเริ่มงาน",
  notes: "",
  status: "draft",
  hourlyDays: 0,
  hourlyHours: 0,
  revisionsCount: 2,
  lateFeePercent: 0,
  paidPartial: 0,
  timelineEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

type ThemeForm = {
  primary: string;
  invoiceColor: string;
  receiptColor: string;
  briefAccent: string;
  unifiedColors: boolean;
  portalWelcomeMessage: string;
};

function fromInput(input: DocumentThemeInput | undefined): ThemeForm {
  return {
    primary: input?.primary ?? SOLO_DEFAULT_PRIMARY,
    invoiceColor: input?.invoiceColor ?? SOLO_DEFAULT_INVOICE,
    receiptColor: input?.receiptColor ?? SOLO_DEFAULT_RECEIPT,
    briefAccent: input?.briefAccent ?? SOLO_DEFAULT_BRIEF,
    unifiedColors: input?.unifiedColors !== false,
    portalWelcomeMessage: input?.portalWelcomeMessage ?? "",
  };
}

function toInput(form: ThemeForm): DocumentThemeInput {
  const base: DocumentThemeInput = {
    unifiedColors: form.unifiedColors,
    portalShowLogo: true,
    portalWelcomeMessage: form.portalWelcomeMessage.trim() || undefined,
  };
  const primary = normalizeHex(form.primary);
  if (primary) base.primary = primary;
  if (!form.unifiedColors) {
    const inv = normalizeHex(form.invoiceColor);
    const rec = normalizeHex(form.receiptColor);
    const brief = normalizeHex(form.briefAccent);
    if (inv) base.invoiceColor = inv;
    if (rec) base.receiptColor = rec;
    if (brief) base.briefAccent = brief;
  }
  return base;
}

export function DocumentBrandingSection() {
  const { user, profile, refreshProfile } = useAuth();
  const { tier, isPro } = useSubscription();
  const [form, setForm] = React.useState<ThemeForm>(() =>
    fromInput((profile?.document_theme ?? {}) as DocumentThemeInput),
  );
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm(fromInput((profile?.document_theme ?? {}) as DocumentThemeInput));
  }, [profile?.document_theme]);

  const previewTheme = React.useMemo(
    () => resolveDocumentTheme(tier, toInput(form)),
    [tier, form],
  );

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !isPro) return;
    const primary = normalizeHex(form.primary);
    if (!primary) {
      toast.error("สีหลักไม่ถูกต้อง — ใช้รูปแบบ #RRGGBB");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ document_theme: toInput(form) })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("บันทึกไม่สำเร็จ: " + error.message);
    } else {
      toast.success("บันทึกธีมเอกสารแล้ว");
      await refreshProfile();
    }
  }

  return (
    <Card className="glass border-border shadow-soft">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              ธีมเอกสาร & Portal
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              ปรับสีใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ และ portal ลูกค้า — Pro ขึ้นไปเอาแบรนด์ So1o ออกจากเอกสาร
            </p>
          </div>
          {isPro && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/10 text-primary px-2 py-1 rounded-full shrink-0">
              <Crown className="h-3 w-3" /> White-label
            </span>
          )}
        </div>

        {!isPro && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm space-y-2">
            <p className="font-medium">อัพเกรด Pro เพื่อเอาแบรนด์ So1o ออกและปรับสีเอกสาร</p>
            <p className="text-xs text-muted-foreground">
              แผน Free จะมี footer &quot;So1o Freelancer&quot; บน PDF และ Powered by บน portal ลูกค้า
            </p>
            <Button size="sm" asChild>
              <Link to="/pricing">ดูแพ็ก Pro</Link>
            </Button>
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">สีหลัก (Primary)</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.primary}
                  onChange={(e) => setForm((f) => ({ ...f, primary: e.target.value }))}
                  className="h-10 w-14 p-1 cursor-pointer"
                  disabled={!isPro}
                />
                <Input
                  value={form.primary}
                  onChange={(e) => setForm((f) => ({ ...f, primary: e.target.value }))}
                  className="font-mono text-xs"
                  disabled={!isPro}
                  placeholder="#F37021"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <p className="text-xs font-medium">ใช้สีเดียวทุกเอกสาร</p>
                <p className="text-[10px] text-muted-foreground">ปิดเพื่อแยกสีใบแจ้งหนี้/ใบเสร็จ/บรีฟ</p>
              </div>
              <Switch
                checked={form.unifiedColors}
                onCheckedChange={(v) => setForm((f) => ({ ...f, unifiedColors: v }))}
                disabled={!isPro}
              />
            </div>
          </div>

          {!form.unifiedColors && (
            <div className="grid sm:grid-cols-3 gap-3">
              {(
                [
                  ["invoiceColor", "ใบแจ้งหนี้"],
                  ["receiptColor", "ใบเสร็จ"],
                  ["briefAccent", "บรีฟ"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-[10px]">{label}</Label>
                  <Input
                    type="color"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="h-9 w-full p-1 cursor-pointer"
                    disabled={!isPro}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs">ข้อความต้อนรับ portal (ไม่บังคับ)</Label>
            <Input
              value={form.portalWelcomeMessage}
              onChange={(e) => setForm((f) => ({ ...f, portalWelcomeMessage: e.target.value }))}
              placeholder="เช่น ยินดีต้อนรับ — ติดตามงานของคุณได้ที่นี่"
              disabled={!isPro}
              maxLength={200}
            />
          </div>

          <div className="rounded-xl border bg-white overflow-hidden">
            <p className="text-[10px] font-medium text-muted-foreground px-3 py-2 border-b bg-muted/30">
              ตัวอย่างใบเสนอราคา
            </p>
            <div className="p-2 scale-[0.85] origin-top-left w-[118%] max-h-[280px] overflow-hidden pointer-events-none">
              <PreviewPanel q={PREVIEW_QUOTATION} themeOverride={previewTheme} />
            </div>
          </div>

          {isPro && (
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              บันทึกธีมเอกสาร
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
