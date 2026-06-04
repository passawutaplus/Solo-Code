import * as React from "react";
import { useQuotations, computeTotals, statusLabel, type Quotation, type QuotationStatus, type DocKind } from "@/store/quotations";
import { useFinance } from "@/store/finance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Settings2, ListTree, CalendarRange, FileText, Save, ArrowRight, CheckCircle2, RefreshCw, Eye, Link2, ChevronLeft, ChevronRight } from "lucide-react";
import { StickyToolbar, type ToolbarAction } from "../shared/StickyToolbar";
import { SettingsPanel } from "./SettingsPanel";
import { ServicesPanel } from "./ServicesPanel";
import { TimelinePanel } from "./TimelinePanel";
import { PreviewPanel } from "./PreviewPanel";
import { QuotationMockupDialog } from "./QuotationMockupDialog";
import { QuotationExportOptionsDialog, type QuotationExportChoice } from "./QuotationExportOptionsDialog";
import { ShareTrackerDialog } from "./ShareTrackerDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { cssAboveMobileBottomNav, DASH_MOBILE_STICKY_ACTION_PX } from "@/lib/layoutConstants";

interface Props {
  id: string;
  onBack: () => void;
}

type View = "settings" | "services" | "timeline" | "preview";

export function QuotationEditor({ id, onBack }: Props) {
  const { get, update, markPdfExported, advanceStatus } = useQuotations();
  const { upsertIncomeFromQuotation, removeIncomeBySource } = useFinance();
  const { user } = useAuth();
  const q = get(id);
  const [mobileView, setMobileView] = React.useState<View>("settings");
  const [desktopView, setDesktopView] = React.useState<Exclude<View, "preview">>("settings");
  const [mockupOpen, setMockupOpen] = React.useState(false);
  const [autoPrint, setAutoPrint] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [previewOptionsOpen, setPreviewOptionsOpen] = React.useState(false);
  const [exportChoice, setExportChoice] = React.useState<QuotationExportChoice>({
    includeBrief: false,
    includeTimeline: false,
  });

  const [shareOpen, setShareOpen] = React.useState(false);
  const [shareInfo, setShareInfo] = React.useState<{ share_token: string; tracking_code: string; isNew: boolean } | null>(null);
  const [creatingTracker, setCreatingTracker] = React.useState(false);

  // Document kind shown in preview/print → derived from current status
  const docKind: DocKind = React.useMemo(() => {
    if (!q) return "quotation";
    if (q.status === "completed" || q.status === "pending_receipt") return "receipt";
    if (q.status === "pending_payment") return "invoice";
    return "quotation";
  }, [q]);

  // Auto-sync income to Tax module whenever a quotation reaches "completed"
  // Sync helper — สามารถเรียกซ้ำได้ทั้งใน effect และจากปุ่ม Resync
  const syncIncomeNow = React.useCallback((quotation: typeof q) => {
    if (!quotation || quotation.status !== "completed") return;
    const totals = computeTotals(quotation);
    const monthSrc = quotation.paidAt || quotation.receiptIssuedAt || quotation.updatedAt || new Date().toISOString();
    const month = monthSrc.slice(0, 7);
    upsertIncomeFromQuotation({
      sourceQuotationId: quotation.id,
      month,
      client: quotation.clientName || "ลูกค้า",
      gross: totals.preTax,
      withholding: totals.withholdingAmount,
      incomeType: "freelance",
      whtRate: quotation.whtEnabled ? quotation.whtRate : 0,
      certificateReceived: false,
      note: `จาก ${quotation.number}${quotation.invoiceNumber ? ` / ${quotation.invoiceNumber}` : ""}${quotation.receiptNumber ? ` / ${quotation.receiptNumber}` : ""}`,
    });
  }, [upsertIncomeFromQuotation]);

  // Auto-sync income to Tax module whenever a quotation reaches "completed"
  React.useEffect(() => {
    syncIncomeNow(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.status, q?.paidAt, q?.receiptNumber]);

  function handleResyncIncome() {
    if (!q) return;
    if (q.status !== "completed") {
      toast.info("ปิดงานก่อน (สถานะ 'เสร็จสิ้น') ถึงจะ sync รายได้ได้");
      return;
    }
    syncIncomeNow(q);
    toast.success("ซิงค์รายได้เข้าหมวดภาษีแล้ว");
  }

  if (!q) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground mb-3">ไม่พบใบเสนอราคา</p>
        <Button onClick={onBack} variant="outline">กลับ</Button>
      </div>
    );
  }

  const patch = (p: Partial<Quotation>) => update(q.id, p);

  function handleSave() {
    if (!q) return;
    update(q.id, { updatedAt: new Date().toISOString() });
    toast.success("บันทึกฉบับร่างแล้ว");
  }

  function handlePrint() {
    if (!q) return;
    // Open the export-options dialog first so user can choose what to bundle
    setExportOpen(true);
  }

  function handleExportConfirm(choice: QuotationExportChoice) {
    if (!q) return;
    setExportChoice(choice);
    markPdfExported(q.id);
    if (q.status === "draft") {
      toast.success("เลื่อนสถานะเป็น 'รออนุมัติ' · กำลังเตรียมไฟล์ PDF...");
    } else {
      toast.info("กำลังเตรียมไฟล์ PDF...");
    }
    setAutoPrint(true);
    setMockupOpen(true);
  }

  function handlePreviewConfirm(choice: QuotationExportChoice) {
    setExportChoice(choice);
    setAutoPrint(false);
    setMockupOpen(true);
  }


  function handleAdvance(next: QuotationStatus) {
    if (!q) return;
    advanceStatus(q.id, next);
    if (next === "pending_payment") {
      toast.success("สร้างใบแจ้งหนี้แล้ว — กดบันทึก PDF เพื่อส่งให้ลูกค้า");
    } else if (next === "pending_receipt") {
      toast.success("สร้างใบเสร็จรับเงินแล้ว");
    } else if (next === "completed") {
      toast.success("ปิดงานเรียบร้อย — ซิงค์เข้าหมวดภาษี & รายได้แล้ว");
    }
  }

  function handleStatusManualChange(next: QuotationStatus) {
    if (!q) return;
    if (q.status === "completed" && next !== "completed") {
      removeIncomeBySource(q.id);
    }
    advanceStatus(q.id, next);
  }
  // expose to keep helper available; status changes now happen from the list
  void handleStatusManualChange;

  // Workflow CTA mapping
  const nextStep: { label: string; status: QuotationStatus; icon: React.ReactNode } | null = (() => {
    switch (q.status) {
      case "pending_approval":
        return { label: "ทำใบแจ้งหนี้", status: "pending_payment", icon: <ArrowRight className="h-4 w-4" /> };
      case "pending_payment":
        return { label: "ทำใบเสร็จรับเงิน", status: "pending_receipt", icon: <ArrowRight className="h-4 w-4" /> };
      case "pending_receipt":
        return { label: "ปิดงาน (ลูกค้าได้รับใบเสร็จ)", status: "completed", icon: <CheckCircle2 className="h-4 w-4" /> };
      default:
        return null;
    }
  })();

  const statusInfo = statusLabel(q.status);

  async function handleCreateOrOpenTracker() {
    if (!q || !user) return;
    setCreatingTracker(true);
    try {
      // ดูว่ามี job tracker ของใบนี้แล้วหรือยัง
      const { data: existing } = await supabase
        .from("job_trackers")
        .select("share_token, tracking_code")
        .eq("user_id", user.id)
        .eq("quotation_id", q.id)
        .maybeSingle();

      if (existing) {
        setShareInfo({ share_token: existing.share_token, tracking_code: existing.tracking_code, isNew: false });
        setShareOpen(true);
        return;
      }

      const totals = computeTotals(q);
      const payload = {
        user_id: user.id,
        title: q.projectName || `งานของ ${q.clientName || "ลูกค้า"}`,
        client_name: q.clientName || "",
        total_amount: Math.round(totals.grandTotal),
        deposit_percent: q.depositPreset || 0,
        payment_info: q.paymentTerms || "",
        start_date: q.startDate || null,
        deadline: q.endDate || null,
        notes: q.notes || "",
        quotation_id: q.id,
        brief_id: q.briefId ?? null,
      };
      const { data: created, error } = await supabase
        .from("job_trackers")
        .insert(payload)
        .select("share_token, tracking_code")
        .single();
      if (error) throw error;
      setShareInfo({ share_token: created.share_token, tracking_code: created.tracking_code, isNew: true });
      setShareOpen(true);
      toast.success("สร้าง Job Tracker แล้ว — คัดลอกลิงก์ส่งให้ลูกค้าได้เลย");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "สร้าง Job Tracker ไม่สำเร็จ");
    } finally {
      setCreatingTracker(false);
    }
  }

  const secondaryActions: ToolbarAction[] = [
    { label: "บันทึก", onClick: handleSave, icon: <Save className="h-4 w-4" /> },
    { label: "ดูตัวอย่าง", onClick: () => setPreviewOptionsOpen(true), icon: <Eye className="h-4 w-4" /> },
  ];
  if (q.status === "completed") {
    secondaryActions.push({
      label: "Resync รายได้",
      onClick: handleResyncIncome,
      icon: <RefreshCw className="h-4 w-4" />,
      title: "ซิงค์รายได้ใบนี้เข้าหมวดภาษีอีกครั้ง",
    });
  }

  const primaryActions: ToolbarAction[] = [];
  // workflow advance buttons removed — status is managed from the list dropdown only.
  void nextStep; void handleAdvance;
  if (q.status !== "draft") {
    primaryActions.push({
      label: creatingTracker ? "กำลังสร้าง..." : "สร้างลิงก์ติดตามงาน",
      onClick: handleCreateOrOpenTracker,
      icon: <Link2 className="h-4 w-4" />,
      variant: "secondary",
      title: "สร้าง/เปิดลิงก์ติดตามงานสำหรับลูกค้า (แนบใบบรีฟ + ใบเสนอราคา)",
    });
  }
  primaryActions.push({
    label: "บันทึก PDF",
    onClick: handlePrint,
    icon: <Download className="h-4 w-4" />,
  });

  return (
    <div className="space-y-3 quotation-editor-root lg:pb-3">
      <StickyToolbar
        offsetTop={60}
        leading={
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 shrink-0">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">กลับ</span>
          </Button>
        }
        title={<span className="num">{q.number}</span>}
        badge={
          <Badge
            variant="outline"
            className={`${statusInfo.tone} border-0 text-[11px] rounded-full px-2.5 py-1 shrink-0`}
          >
            {statusInfo.label}
          </Badge>
        }
        primaryActions={primaryActions}
        secondaryActions={secondaryActions}
      />

      {/* Mobile / Tablet view switcher */}
      <div className="no-print lg:hidden grid grid-cols-4 gap-1 rounded-xl glass p-1 sticky z-20" style={{ top: 124 }}>
        <SwitchBtn active={mobileView === "settings"} onClick={() => setMobileView("settings")} icon={<Settings2 className="h-3.5 w-3.5" />} label="ตั้งค่า" />
        <SwitchBtn active={mobileView === "services"} onClick={() => setMobileView("services")} icon={<ListTree className="h-3.5 w-3.5" />} label="ชิ้นงาน" />
        <SwitchBtn active={mobileView === "timeline"} onClick={() => setMobileView("timeline")} icon={<CalendarRange className="h-3.5 w-3.5" />} label="ไทม์ไลน์" />
        <SwitchBtn active={mobileView === "preview"} onClick={() => setMobileView("preview")} icon={<FileText className="h-3.5 w-3.5" />} label="ใบเสนอ" />
      </div>

      {/* ───── Desktop layout: 2 columns (editor + sticky preview) ───── */}
      <div className="hidden lg:grid gap-5 grid-cols-12">
        {/* Left: tabbed editor */}
        <div className="col-span-7 xl:col-span-7 space-y-3 min-w-0">
          {/* Tab switcher */}
          <div className="rounded-2xl glass border border-border p-1.5 grid grid-cols-3 gap-1 sticky z-20" style={{ top: 124 }}>
            <DesktopTab active={desktopView === "settings"} onClick={() => setDesktopView("settings")} icon={<Settings2 className="h-4 w-4" />} label="ตั้งค่าใบเสนอราคา" />
            <DesktopTab active={desktopView === "services"} onClick={() => setDesktopView("services")} icon={<ListTree className="h-4 w-4" />} label="จัดการชิ้นงาน" />
            <DesktopTab active={desktopView === "timeline"} onClick={() => setDesktopView("timeline")} icon={<CalendarRange className="h-4 w-4" />} label="ไทม์ไลน์" />
          </div>

          {/* Active panel */}
          <div className="rounded-2xl glass border border-border p-5">
            {desktopView === "settings" && <SettingsPanel q={q} patch={patch} />}
            {desktopView === "services" && <ServicesPanel q={q} patch={patch} />}
            {desktopView === "timeline" && <TimelinePanel q={q} patch={patch} />}
          </div>
        </div>

        {/* Right: sticky preview */}
        <div className="col-span-5 xl:col-span-5 editor-inline-preview min-w-0">
          <div className="sticky" style={{ top: 196 }}>
            <PreviewPanel q={q} docKind={docKind} />
          </div>
        </div>
      </div>


      {/* Mobile: single panel */}
      <div className="lg:hidden">
        {mobileView === "settings" && (
          <Column title="ตั้งค่าใบเสนอราคา"><SettingsPanel q={q} patch={patch} /></Column>
        )}
        {mobileView === "services" && (
          <Column title="จัดการบริการ"><ServicesPanel q={q} patch={patch} /></Column>
        )}
        {mobileView === "timeline" && (
          <Column title="ไทม์ไลน์"><TimelinePanel q={q} patch={patch} /></Column>
        )}
        {mobileView === "preview" && (
          <div className="editor-inline-preview"><PreviewPanel q={q} docKind={docKind} /></div>
        )}
      </div>

      {/* Sticky bottom action bar — mobile only, ensures Download/Next-step always reachable */}
      <div
        className="no-print lg:hidden fixed inset-x-0 z-[45] border-t border-border/60 bg-background/95 backdrop-blur px-3 py-2 flex items-center gap-2 shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.15)]"
        style={{
          bottom: cssAboveMobileBottomNav(0),
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        {nextStep && (
          <Button
            onClick={() => handleAdvance(nextStep.status)}
            variant="secondary"
            className="flex-1 gap-1.5 h-10 text-xs"
          >
            {nextStep.icon} {nextStep.label}
          </Button>
        )}
        <Button
          onClick={handlePrint}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 h-10 text-xs"
        >
          <Download className="h-4 w-4" /> บันทึกเป็น PDF
        </Button>
      </div>

      <QuotationExportOptionsDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        hasBrief={!!q.briefId}
        hasTimeline={q.timelineEnabled !== false && !!(q.startDate || q.endDate || (q.milestones && q.milestones.length > 0))}
        onConfirm={handleExportConfirm}
        mode="export"
      />

      <QuotationExportOptionsDialog
        open={previewOptionsOpen}
        onOpenChange={setPreviewOptionsOpen}
        hasBrief={!!q.briefId}
        hasTimeline={q.timelineEnabled !== false && !!(q.startDate || q.endDate || (q.milestones && q.milestones.length > 0))}
        onConfirm={handlePreviewConfirm}
        mode="preview"
      />


      <QuotationMockupDialog
        q={q}
        docKind={docKind}
        open={mockupOpen}
        autoPrint={autoPrint}
        includeBrief={exportChoice.includeBrief}
        includeTimeline={exportChoice.includeTimeline}
        onOpenChange={(o) => {
          setMockupOpen(o);
          if (!o) {
            setAutoPrint(false);
            setExportChoice({ includeBrief: false, includeTimeline: false });
          }
        }}
      />

      {shareInfo && (
        <ShareTrackerDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          shareToken={shareInfo.share_token}
          trackingCode={shareInfo.tracking_code}
          hasBrief={!!q.briefId}
          hasQuotation={true}
          isNew={shareInfo.isNew}
        />
      )}

      {/* Floating Prev/Next step nav (bottom-right) */}
      <StepNav
        mobileView={mobileView}
        setMobileView={setMobileView}
        desktopView={desktopView}
        setDesktopView={setDesktopView}
      />
    </div>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass border border-border p-3 sm:p-4">
      <h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3 sticky top-0 bg-card/80 backdrop-blur py-1 -mx-3 sm:-mx-4 px-3 sm:px-4 z-10">
        {title}
      </h2>
      {children}
    </div>
  );
}

function SwitchBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      data-compact-touch
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-all ${
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DesktopTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-medium transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

const MOBILE_STEPS: View[] = ["settings", "services", "timeline", "preview"];
const DESKTOP_STEPS: Exclude<View, "preview">[] = ["settings", "services", "timeline"];

function StepNav({
  mobileView,
  setMobileView,
  desktopView,
  setDesktopView,
}: {
  mobileView: View;
  setMobileView: (v: View) => void;
  desktopView: Exclude<View, "preview">;
  setDesktopView: (v: Exclude<View, "preview">) => void;
}) {
  const mIdx = MOBILE_STEPS.indexOf(mobileView);
  const dIdx = DESKTOP_STEPS.indexOf(desktopView);

  return (
    <>
      {/* Mobile */}
      <div
        className="no-print lg:hidden fixed right-3 z-[50] flex gap-2"
        style={{ bottom: cssAboveMobileBottomNav(DASH_MOBILE_STICKY_ACTION_PX + 12) }}
      >
        <button
          onClick={() => mIdx > 0 && setMobileView(MOBILE_STEPS[mIdx - 1])}
          disabled={mIdx <= 0}
          aria-label="ย้อนกลับ"
          className="h-10 w-10 rounded-full glass border border-border/60 backdrop-blur flex items-center justify-center text-foreground disabled:opacity-40 shadow-md"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => mIdx < MOBILE_STEPS.length - 1 && setMobileView(MOBILE_STEPS[mIdx + 1])}
          disabled={mIdx >= MOBILE_STEPS.length - 1}
          aria-label="ถัดไป"
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 shadow-md"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Desktop */}
      <div className="no-print hidden lg:flex fixed bottom-6 right-6 z-40 gap-2">
        <button
          onClick={() => dIdx > 0 && setDesktopView(DESKTOP_STEPS[dIdx - 1])}
          disabled={dIdx <= 0}
          aria-label="ย้อนกลับ"
          className="h-11 px-4 rounded-full glass border border-border/60 backdrop-blur inline-flex items-center gap-1.5 text-xs text-foreground disabled:opacity-40 shadow-md"
        >
          <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
        </button>
        <button
          onClick={() => dIdx < DESKTOP_STEPS.length - 1 && setDesktopView(DESKTOP_STEPS[dIdx + 1])}
          disabled={dIdx >= DESKTOP_STEPS.length - 1}
          aria-label="ถัดไป"
          className="h-11 px-4 rounded-full bg-primary text-primary-foreground inline-flex items-center gap-1.5 text-xs disabled:opacity-40 shadow-md"
        >
          ถัดไป <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
