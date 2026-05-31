import * as React from "react";
import { GiveFeedbackButton } from "@/components/dashboard/GiveFeedbackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "./StatCard";
import { AddIncomeModal, AddExpenseModal, EditExpenseButton } from "./Modals";
import { useFinance } from "@/store/finance";
import { useQuotations, computeTotals } from "@/store/quotations";
import { formatTHB, VAT_THRESHOLD } from "@/data/mockData";
import { Download, Coins, Receipt, Calculator, AlertCircle, Sparkles, RefreshCw, Paperclip, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { escapeCSV } from "@/lib/security";
const IncomeBreakdown = React.lazy(() =>
  import("./tax/IncomeBreakdown").then((m) => ({ default: m.IncomeBreakdown })),
);
const WHTCertificates = React.lazy(() =>
  import("./tax/WHTCertificates").then((m) => ({ default: m.WHTCertificates })),
);
import { estimateTax, calcLumpSumExpense } from "./tax/taxMath";
import { DeductionsPanel, computeActiveDeductions } from "./tax/DeductionsPanel";
import { TaxBracketGauge, AiTaxInsight } from "./tax/TaxBracketGauge";
import { TaxDisclaimer, TaxFilingReminder } from "./tax/TaxDisclaimer";
import { TaxSimulator } from "./tax/TaxSimulator";
import { FlaskConical } from "lucide-react";

export function TaxTab() {
  const {
    incomes,
    workExpenses,
    setWorkExpenses,
    deductions,
    deductionAmounts,
    expenseMethod,
    setExpenseMethod,
    upsertIncomeFromQuotation,
  } = useFinance();
  const { list: quotationsList } = useQuotations();
  const [resyncing, setResyncing] = React.useState(false);
  const [simOpen, setSimOpen] = React.useState(false);

  function handleResyncAll() {
    const completed = quotationsList.filter((q) => q.status === "completed");
    if (completed.length === 0) {
      toast.info("ยังไม่มีใบเสนอราคาที่เสร็จสิ้น");
      return;
    }
    setResyncing(true);
    let count = 0;
    for (const q of completed) {
      const totals = computeTotals(q);
      const monthSrc = q.paidAt || q.receiptIssuedAt || q.updatedAt || new Date().toISOString();
      upsertIncomeFromQuotation({
        sourceQuotationId: q.id,
        month: monthSrc.slice(0, 7),
        client: q.clientName || "ลูกค้า",
        gross: totals.preTax,
        withholding: totals.withholdingAmount,
        incomeType: "freelance",
        whtRate: q.whtEnabled ? q.whtRate : 0,
        certificateReceived: false,
        note: `จาก ${q.number}${q.invoiceNumber ? ` / ${q.invoiceNumber}` : ""}${q.receiptNumber ? ` / ${q.receiptNumber}` : ""}`,
      });
      count++;
    }
    setTimeout(() => setResyncing(false), 800);
    toast.success(`กำลังซิงค์ ${count} ใบงานเข้าหมวดภาษี...`);
  }

  const totalWorkExp = workExpenses.reduce((s, i) => s + i.amount, 0);
  const personalDeduction = 60000;
  const activeDeductions = React.useMemo(
    () => computeActiveDeductions(deductions, deductionAmounts),
    [deductions, deductionAmounts],
  );

  const est = React.useMemo(
    () =>
      estimateTax({
        incomes,
        workExpensesTotal: totalWorkExp,
        expenseMethod,
        personalDeduction,
        activeDeductions,
      }),
    [incomes, totalWorkExp, expenseMethod, activeDeductions],
  );

  const lumpSumPreview = React.useMemo(() => calcLumpSumExpense(incomes), [incomes]);
  const taxOwed = Math.max(0, est.diff);
  const refund = Math.max(0, -est.diff);
  const vatPct = Math.min(100, (est.totalGross / VAT_THRESHOLD) * 100);

  // monthly bar chart
  const monthlyIncome = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of incomes) map[i.month] = (map[i.month] || 0) + i.gross;
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, gross]) => ({
        month: new Date(`${month}-01`).toLocaleDateString("th-TH", { month: "short" }),
        gross,
      }));
  }, [incomes]);

  function exportCSV() {
    const headers = ["เดือน", "ลูกค้า", "ประเภท", "ยอด Gross", "อัตรา WHT", "หัก ณ ที่จ่าย", "เลขใบ 50ทวิ", "ได้รับใบ"];
    const rows = incomes.map((i) => [
      i.month,
      i.client,
      i.incomeType ?? "freelance",
      i.gross,
      `${i.whtRate ?? 3}%`,
      i.withholding.toFixed(2),
      i.certificateNo ?? "",
      i.certificateReceived ? "Y" : "N",
    ]);
    const csv = [headers, ...rows].map((r) => r.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-summary-${new Date().getFullYear()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ดาวน์โหลด CSV รายได้เรียบร้อย");
  }

  const gaugeAngle = (vatPct / 100) * 180;

  const completedCount = quotationsList.filter((q) => q.status === "completed").length;
  const syncedCount = incomes.filter((i) => i.sourceQuotationId).length;
  const outOfSync = completedCount > syncedCount;

  return (
    <div className="space-y-5">
      <TaxDisclaimer />
      <TaxFilingReminder />
      {/* Header bar — sync status + actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl glass border border-border p-3">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">ซิงค์รายได้จากใบเสนอราคา:</span>
          <span className="num font-semibold">{syncedCount}</span>
          <span className="text-muted-foreground">/ {completedCount} ใบ</span>
          {outOfSync && (
            <Badge variant="outline" className="ml-1 bg-warning/15 text-warning-foreground border-warning/30 text-[10px]">
              ไม่ตรงกัน
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setSimOpen(true)}
            size="sm"
            className="gap-1.5 h-8 bg-primary hover:bg-primary/90"
            title="ทดลองวางแผนภาษีโดยไม่กระทบข้อมูลจริง"
          >
            <FlaskConical className="h-3.5 w-3.5" /> โหมดจำลองวางแผนภาษี
          </Button>
          <Button
            onClick={handleResyncAll}
            variant="outline"
            size="sm"
            disabled={resyncing}
            className="gap-1.5 h-8"
            title="ดึงข้อมูลจากใบเสนอราคาที่เสร็จสิ้นทั้งหมดเข้าหมวดภาษีอีกครั้ง"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resyncing ? "animate-spin" : ""}`} />
            Resync รายได้ทั้งหมด
          </Button>
          <Button onClick={exportCSV} variant="outline" size="sm" className="gap-1.5 h-8">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard accent label="รายได้รวม (ปีนี้)" value={`฿${formatTHB(est.totalGross)}`} sub={`${incomes.length} ใบงาน`} icon={<Coins className="h-5 w-5" />} />
        <StatCard label="หัก ณ ที่จ่ายสะสม" value={`฿${formatTHB(est.totalWithheld)}`} sub="ใช้เครดิตภาษี" icon={<Receipt className="h-5 w-5" />} />
        <StatCard label="ภาษีประมาณการ" value={`฿${formatTHB(est.estimatedTax)}`} sub={`เงินได้สุทธิ ฿${formatTHB(est.netIncome)}`} icon={<Calculator className="h-5 w-5" />} />
        <StatCard
          label={taxOwed > 0 ? "ต้องจ่ายเพิ่ม" : "ขอคืนได้"}
          value={`฿${formatTHB(Math.abs(est.diff))}`}
          sub={taxOwed > 0 ? "ยื่น ภงด.90/91" : "รอคืนภาษี"}
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      {/* VAT gauge + Monthly income */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="animate-fade-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">เกณฑ์ VAT (1.8M บาท/ปี)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mx-auto" style={{ width: 260, height: 150 }}>
              <svg viewBox="0 0 200 110" className="w-full h-full">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--color-muted)" strokeWidth="14" strokeLinecap="round" />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#g)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${(gaugeAngle / 180) * 251} 251`}
                />
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0" stopColor="oklch(0.7 0.15 65)" />
                    <stop offset="1" stopColor="var(--color-primary)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-x-0 bottom-2 text-center">
                <p className="num text-3xl font-semibold">{vatPct.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">ใช้ไป ฿{formatTHB(est.totalGross)}</p>
              </div>
            </div>
            {vatPct > 80 && (
              <div className="flex items-center gap-2 mt-3 rounded-lg bg-warning/15 p-2.5 text-xs text-warning-foreground">
                <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                <span>ใกล้ถึงเกณฑ์ VAT — ควรเตรียมจดทะเบียน</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-up">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">รายได้รายเดือน</CardTitle>
            <AddIncomeModal />
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer>
                <BarChart data={monthlyIncome}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }}
                    formatter={(v: number) => `฿${formatTHB(v)}`}
                  />
                  <Bar dataKey="gross" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income breakdown + WHT certs */}
      <div className="grid gap-4 lg:grid-cols-2">
        <React.Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted/40" />}>
          <IncomeBreakdown />
        </React.Suspense>
        <React.Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted/40" />}>
          <WHTCertificates />
        </React.Suspense>
      </div>

      {/* Tax estimator + Work expenses + Method toggle */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="animate-fade-up border-border/60">
          <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" /> รายจ่ายจริง
              </CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                เก็บบิลและหลักฐานค่าใช้จ่ายจริงทั้งหมด
              </p>
            </div>
            <AddExpenseModal kind="work" />
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="num text-xl font-semibold">฿{formatTHB(totalWorkExp)}</p>
            <p className="text-[11px] text-muted-foreground mb-2">ใช้เมื่อเลือก "หักจริง" ในวิธีหักค่าใช้จ่าย</p>
            <div className="space-y-1 max-h-48 overflow-auto pr-1">
              {workExpenses.length === 0 && (
                <p className="text-[11px] text-muted-foreground py-3 text-center border border-dashed border-border/60 rounded-lg">
                  ยังไม่มีรายการ — กด "เพิ่มรายจ่าย" เพื่อเริ่มเก็บบิล
                </p>
              )}
              {workExpenses.map((w) => (
                <div key={w.id} className="group flex items-center gap-2 rounded-lg border border-border/40 px-2 py-1.5 hover:border-primary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium truncate">{w.description}</span>
                      {w.receiptUrl && (
                        <a
                          href={w.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary shrink-0"
                          title="ดูใบเสร็จ"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Paperclip className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground num">{w.date}</p>
                  </div>
                  <span className="num text-xs font-medium shrink-0">฿{formatTHB(w.amount)}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditExpenseButton record={w} kind="work" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => {
                        setWorkExpenses((arr) => arr.filter((x) => x.id !== w.id));
                        toast.success("ลบรายการแล้ว");
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        <Card className="animate-fade-up border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> วิธีหักค่าใช้จ่าย
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExpenseMethod("lumpsum")}
                className={`rounded-xl border p-3 text-left transition-all ${
                  expenseMethod === "lumpsum"
                    ? "border-primary bg-primary-soft"
                    : "border-border/60 hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-semibold">เหมา</p>
                <p className="num text-xs text-muted-foreground">฿{formatTHB(lumpSumPreview)}</p>
              </button>
              <button
                onClick={() => setExpenseMethod("actual")}
                className={`rounded-xl border p-3 text-left transition-all ${
                  expenseMethod === "actual"
                    ? "border-primary bg-primary-soft"
                    : "border-border/60 hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-semibold">หักจริง</p>
                <p className="num text-xs text-muted-foreground">฿{formatTHB(totalWorkExp)}</p>
              </button>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
              <p><span className="font-semibold text-foreground">เหมา:</span> ใช้สูตรกฎหมาย เช่น 40(2) 50% (max 100k), 40(8) 60%</p>
              <p className="mt-1"><span className="font-semibold text-foreground">หักจริง:</span> ใช้รายจ่ายจริงที่บันทึก ต้องมีหลักฐาน</p>
            </div>
            <div className="flex items-center justify-between pt-1 border-t">
              <span className="text-xs text-muted-foreground">หักได้รวม</span>
              <span className="num text-base font-semibold text-success">฿{formatTHB(est.expenseDeduction)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up border-primary/40 bg-gradient-to-br from-primary-soft to-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" /> ประมาณการภาษี
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Row label="รายได้รวม" value={`฿${formatTHB(est.totalGross)}`} />
            <Row label="− ค่าใช้จ่าย" value={`฿${formatTHB(est.expenseDeduction)}`} />
            <Row label="− ลดหย่อนส่วนตัว" value={`฿${formatTHB(est.personalDeduction)}`} />
            <Row label="− ลดหย่อนอื่น ๆ" value={`฿${formatTHB(est.activeDeductions)}`} />
            <div className="border-t border-primary/20 pt-2 space-y-2">
              <Row label="เงินได้สุทธิ" value={`฿${formatTHB(est.netIncome)}`} bold />
              <TaxBracketGauge netIncome={est.netIncome} estimatedTax={est.estimatedTax} />
              <div className="pt-1">
                <Badge variant="outline" className={taxOwed > 0 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-success/10 text-success border-success/30"}>
                  {taxOwed > 0 ? `ต้องจ่ายเพิ่ม ฿${formatTHB(taxOwed)}` : `ขอคืนได้ ฿${formatTHB(refund)}`}
                </Badge>
              </div>
              <AiTaxInsight
                netIncome={est.netIncome}
                estimatedTax={est.estimatedTax}
                rmfSsfUsed={(deductions.rmf ? Math.min(deductionAmounts.rmf ?? 0, 500000) : 0) + (deductions.thaiESG ? Math.min(deductionAmounts.thaiESG ?? 0, 300000) : 0)}
                rmfSsfCap={500000}
              />
            </div>
            <TaxDisclaimer compact />
            <Button onClick={exportCSV} className="w-full gap-1.5 mt-2" size="sm">
              <Download className="h-3.5 w-3.5" /> Export CSV (รายได้)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Deductions */}
      <DeductionsPanel totalIncome={est.totalGross} />
      <GiveFeedbackButton feature="tax" label="ภาษีและรายได้" />
      <TaxSimulator open={simOpen} onOpenChange={setSimOpen} currentIncome={est.totalGross} />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`num ${bold ? "text-sm font-semibold" : "font-medium"}`}>{value}</span>
    </div>
  );
}

export function PersonalTab() {
  const { personalExpenses, setPersonalExpenses } = useFinance();
  const total = personalExpenses.reduce((s, x) => s + x.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard accent label="รวมรายจ่ายส่วนตัว" value={`฿${formatTHB(total)}`} sub="เดือนนี้" icon={<Receipt className="h-5 w-5" />} />
        <StatCard label="จำนวนรายการ" value={personalExpenses.length} sub="ที่บันทึกไว้" icon={<Calculator className="h-5 w-5" />} />
      </div>

      <Card className="animate-fade-up">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">รายการ</CardTitle>
          <AddExpenseModal kind="personal" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {personalExpenses.map((e) => (
              <div key={e.id} className="group flex items-center gap-3 rounded-xl border border-border/60 p-3 hover:border-primary/40 transition-colors">
                <div className="rounded-lg bg-primary-soft p-2 text-primary"><Receipt className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{e.description}</p>
                  <p className="text-[11px] text-muted-foreground num">{e.date}</p>
                </div>
                <p className="num text-sm font-semibold">฿{formatTHB(e.amount)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 text-xs h-7"
                  onClick={() => {
                    setPersonalExpenses((arr) => arr.filter((x) => x.id !== e.id));
                    toast.success("ลบรายการแล้ว");
                  }}
                >
                  ลบ
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <GiveFeedbackButton feature="personal-expenses" label="รายจ่ายส่วนตัว" />
    </div>
  );
}
