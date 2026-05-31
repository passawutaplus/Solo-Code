import * as React from "react";
import type { Quotation } from "@/store/quotations";
import { computeTotals, formatBaht, computeRevisionDates } from "@/store/quotations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CircleDot,
  CheckCircle2,
  Circle,
  Repeat,
  Flag,
  StickyNote,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Props {
  q: Quotation;
  patch: (p: Partial<Quotation>) => void;
}

export function TimelinePanel({ q, patch }: Props) {
  const totals = React.useMemo(() => computeTotals(q), [q]);

  const revisionDates = React.useMemo(
    () => computeRevisionDates(q.startDate, q.endDate, q.revisionsCount),
    [q.startDate, q.endDate, q.revisionsCount],
  );

  // Auto-calculate working days from date range (inclusive)
  const autoDays = React.useMemo(() => {
    if (!q.startDate || !q.endDate) return 0;
    const s = new Date(q.startDate).getTime();
    const e = new Date(q.endDate).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return 0;
    const diff = Math.floor((e - s) / 86_400_000) + 1;
    return Math.max(0, diff);
  }, [q.startDate, q.endDate]);

  // Sync into store so computeTotals.hourlyRate reflects auto value (and Preview stays consistent)
  React.useEffect(() => {
    const totalHours = autoDays * 8;
    if (q.hourlyDays !== autoDays || q.hourlyHours !== totalHours) {
      patch({ hourlyDays: autoDays, hourlyHours: totalHours });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDays]);

  const hourlyRate = autoDays > 0 ? totals.grandTotal / (autoDays * 8) : 0;

  function addMilestone() {
    patch({
      milestones: [
        ...q.milestones,
        {
          id: Math.random().toString(36).slice(2, 10),
          label: "งวดใหม่",
          description: "",
          percent: 0,
        },
      ],
    });
  }

  function updateMs(id: string, p: Partial<Quotation["milestones"][number]>) {
    patch({ milestones: q.milestones.map((m) => (m.id === id ? { ...m, ...p } : m)) });
  }

  function removeMs(id: string) {
    patch({ milestones: q.milestones.filter((m) => m.id !== id) });
  }

  // Build full timeline view (start, revisions, end)
  const timelineEvents = React.useMemo(() => {
    const events: { date?: string; label: string; type: "start" | "revision" | "end" }[] = [];
    if (q.startDate) events.push({ date: q.startDate, label: "เริ่มงาน", type: "start" });
    revisionDates.forEach((d, i) => {
      events.push({ date: d, label: `ส่งแก้ไขครั้งที่ ${i + 1}`, type: "revision" });
    });
    if (q.endDate) events.push({ date: q.endDate, label: "ส่งมอบ / จบงาน", type: "end" });
    return events.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  }, [q.startDate, q.endDate, revisionDates]);

  const enabled = q.timelineEnabled !== false;

  return (
    <div className="space-y-4 text-sm">
      {/* Opt-in toggle */}
      <label className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => patch({ timelineEnabled: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium">ใช้ไทม์ไลน์ในใบเสนอราคานี้</p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            ถ้าไม่ใช้ ใบเสนอราคาจะไม่แสดงส่วนวันที่/งวดงาน
          </p>
        </div>
      </label>

      {!enabled && (
        <div className="rounded-xl border border-dashed border-border/60 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            ปิดการใช้ไทม์ไลน์อยู่ — ติ๊กด้านบนเพื่อกรอกวันที่และงวดงาน
          </p>
        </div>
      )}

      {enabled && (
       <>
      {/* Date range */}
      <Section icon={<CalendarIcon className="h-3.5 w-3.5" />} title="วันที่โครงการ">
        <div className="grid grid-cols-2 gap-2">
          <DatePicker
            label="วันที่เริ่ม"
            value={q.startDate}
            onChange={(d) => {
              // ถ้า end อยู่ก่อน start ใหม่ → ล้าง end ออก
              if (q.endDate && d && q.endDate < d) {
                patch({ startDate: d, endDate: "" });
              } else {
                patch({ startDate: d });
              }
            }}
          />
          <DatePicker
            label="วันที่จบงาน"
            value={q.endDate}
            minDate={q.startDate}
            onChange={(d) => patch({ endDate: d })}
          />
        </div>
        {q.startDate && q.endDate && q.endDate < q.startDate && (
          <p className="text-[11px] text-destructive mt-1.5" role="alert">
            วันจบงานต้องไม่อยู่ก่อนวันเริ่มงาน
          </p>
        )}

        {/* Auto timeline preview */}
        {timelineEvents.length > 0 && (
          <div className="rounded-lg border border-dashed border-primary/30 bg-primary-soft/30 p-2.5 mt-2 space-y-1.5">
            <p className="text-[11px] font-semibold text-primary flex items-center gap-1">
              <Repeat className="h-3 w-3" /> ไทม์ไลน์อัตโนมัติ
            </p>
            <div className="space-y-1">
              {timelineEvents.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    {e.type === "start" && <CircleDot className="h-3 w-3 text-primary" />}
                    {e.type === "revision" && <Repeat className="h-3 w-3 text-amber-500" />}
                    {e.type === "end" && <Flag className="h-3 w-3 text-emerald-600" />}
                    <span>{e.label}</span>
                  </span>
                  <span className="num text-muted-foreground">
                    {e.date && format(new Date(e.date), "d MMM yy", { locale: th })}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              ปรับจำนวนแก้ไขได้ที่ช่อง "จำนวนแก้ไขงานฟรี" ในแท็บตั้งค่า
            </p>
          </div>
        )}
      </Section>

      {/* Milestones (payment) — date only */}
      <Section icon={<Flag className="h-3.5 w-3.5" />} title="งวดการชำระเงิน">
        <div className="space-y-3">
          {q.milestones.map((m, i) => {
            const amount = totals.grandTotal * ((m.percent || 0) / 100);
            const isLast = i === q.milestones.length - 1;
            return (
              <div key={m.id} className="flex gap-2">
                <div className="flex flex-col items-center pt-1.5">
                  {m.done ? (
                    <CheckCircle2 className="h-4 w-4 text-success fill-success/20" />
                  ) : i === 0 ? (
                    <CircleDot className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/70" />
                  )}
                  {!isLast && <div className="w-px h-full bg-border/60 mt-1" />}
                </div>
                <div className="flex-1 space-y-1.5 pb-1">
                  <div className="flex items-center gap-2">
                    <Input
                      value={m.label}
                      onChange={(e) => updateMs(m.id, { label: e.target.value })}
                      className="h-7 text-xs font-medium border-0 bg-transparent shadow-none px-0 focus-visible:ring-0"
                      placeholder="ชื่องวด"
                    />
                    <button onClick={() => removeMs(m.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <DatePicker
                    compact
                    value={m.date}
                    minDate={q.startDate}
                    onChange={(d) => updateMs(m.id, { date: d })}
                  />
                  {m.percent > 0 && amount > 0 && (
                    <p className="text-[11px] text-muted-foreground num">
                      {m.percent}% = ฿{formatBaht(amount)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <Button size="sm" variant="outline" onClick={addMilestone} className="w-full h-7 text-xs">
            <Plus className="h-3 w-3" /> เพิ่มงวด
          </Button>
          <p className="text-[10px] text-muted-foreground italic">
            สัดส่วน % ของแต่ละงวดตั้งจาก "เงื่อนไขการชำระ" ในแท็บตั้งค่า
          </p>
        </div>
      </Section>

      {/* Hourly rate — auto-calculated from date range */}
      <Section icon={<Clock className="h-3.5 w-3.5" />} title="อัตรารายชั่วโมง">
        {autoDays === 0 ? (
          <p className="text-[11px] text-muted-foreground italic py-1">
            กำหนด "วันที่เริ่ม" และ "วันที่จบงาน" ด้านบน เพื่อคำนวณอัตราอัตโนมัติ
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">วันทำงาน</Label>
                <div className="h-8 rounded-md border border-border/50 bg-muted/30 px-2.5 flex items-center text-xs num">
                  {autoDays} วัน
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">ชั่วโมงรวม (×8)</Label>
                <div className="h-8 rounded-md border border-border/50 bg-muted/30 px-2.5 flex items-center text-xs num">
                  {autoDays * 8} ชม.
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-xs text-muted-foreground">
                ราคา/ชั่วโมง <span className="text-[10px]">(ยอดสุทธิ ÷ ชั่วโมงรวม)</span>
              </span>
              <span className="num font-semibold text-xs text-primary">
                ฿{formatBaht(hourlyRate)}
              </span>
            </div>
          </>
        )}
      </Section>

      {/* Notes */}
      <Section icon={<StickyNote className="h-3.5 w-3.5" />} title="หมายเหตุภายใน">
        <Textarea
          rows={3}
          value={q.notes}
          onChange={(e) => patch({ notes: e.target.value })}
          maxLength={500}
          placeholder="โน้ตสำหรับตัวคุณเอง — ไม่แสดงในใบเสนอราคา"
          className="text-xs"
        />
      </Section>
       </>
      )}
    </div>
  );
}

function DatePicker({
  label,
  value,
  onChange,
  compact = false,
  minDate,
}: {
  label?: string;
  value?: string;
  onChange: (date: string) => void;
  compact?: boolean;
  minDate?: string;
}) {
  const date = value ? new Date(value) : undefined;
  const min = minDate ? new Date(minDate) : undefined;
  return (
    <div className="space-y-1">
      {label && <Label className="text-[11px] text-muted-foreground">{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal num text-xs",
              compact ? "h-7 px-2" : "h-9",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className={compact ? "h-3 w-3 mr-1" : "h-3.5 w-3.5 mr-1.5"} />
            {date ? format(date, "d MMM yy", { locale: th }) : "เลือกวันที่"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && onChange(d.toISOString().slice(0, 10))}
            disabled={min ? (d) => d < min : undefined}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="px-3 py-2 bg-muted/30 border-b border-border/40">
        <h3 className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
          <span className="text-primary">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="px-3 py-3 space-y-2">{children}</div>
    </div>
  );
}
