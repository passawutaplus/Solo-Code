import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Paperclip, CalendarRange, Download, Info, Eye } from "lucide-react";

export interface QuotationExportChoice {
  includeBrief: boolean;
  /** แทรกภาคผนวกไทม์ไลน์แยกท้าย PDF */
  includeTimeline: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** True when the quotation has a brief attached (briefId is set) */
  hasBrief: boolean;
  /** True when the quotation has any timeline data worth printing */
  hasTimeline: boolean;
  onConfirm: (choice: QuotationExportChoice) => void;
  /** "export" (default) = บันทึก PDF · "preview" = ดูตัวอย่างเต็มรูปแบบ */
  mode?: "export" | "preview";
}

/**
 * ตัวเลือกก่อนบันทึก PDF / ดูตัวอย่างใบเสนอราคา
 * — แทรกใบบรีฟด้วยมั้ย
 * — แทรกไทม์ไลน์ด้วยมั้ย
 * — หรือเอาแค่ใบเสนอราคาอย่างเดียว
 */
export function QuotationExportOptionsDialog({
  open,
  onOpenChange,
  hasBrief,
  hasTimeline,
  onConfirm,
  mode = "export",
}: Props) {
  const [includeBrief, setIncludeBrief] = React.useState(false);
  const [includeTimeline, setIncludeTimeline] = React.useState(false);

  const isPreview = mode === "preview";
  const HeadIcon = isPreview ? Eye : Download;
  const title = isPreview ? "ดูตัวอย่างใบเสนอราคา" : "บันทึกใบเสนอราคาเป็น PDF";
  const subtitle = isPreview
    ? "เลือกว่าจะให้พรีวิวรวมเอกสารอะไรบ้าง (เห็นเหมือนตอนกดบันทึก PDF)"
    : "เลือกว่าจะให้แทรกเอกสารอื่นเข้าไปท้ายไฟล์ PDF ด้วยมั้ย";
  const ctaIcon = isPreview ? (
    <Eye className="h-3.5 w-3.5" />
  ) : (
    <Download className="h-3.5 w-3.5" />
  );
  const ctaLabel = isPreview ? "ดูตัวอย่าง" : "บันทึก PDF";

  // Reset state every time the dialog opens
  React.useEffect(() => {
    if (open) {
      setIncludeBrief(false);
      setIncludeTimeline(false);
    }
  }, [open]);

  function handleConfirm() {
    onConfirm({
      includeBrief: hasBrief && includeBrief,
      includeTimeline: hasTimeline && includeTimeline,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <HeadIcon className="h-4 w-4 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs">{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-1">
          {/* Always-on: quotation itself */}
          <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary-soft/40 p-3">
            <FileText className="h-4 w-4 mt-0.5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">ใบเสนอราคา</p>
              <p className="text-[11px] text-muted-foreground">
                {isPreview ? "แสดงโดยอัตโนมัติ (เอกสารหลัก)" : "แนบโดยอัตโนมัติ (เอกสารหลัก)"}
              </p>
            </div>
          </div>

          {/* Insert brief */}
          <label
            className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
              !hasBrief
                ? "opacity-60 cursor-not-allowed border-border/40"
                : includeBrief
                  ? "border-primary/40 bg-primary-soft/30"
                  : "border-border hover:bg-muted/40"
            }`}
          >
            <Checkbox
              checked={includeBrief}
              disabled={!hasBrief}
              onCheckedChange={(v) => setIncludeBrief(v === true)}
              className="mt-0.5"
            />
            <Paperclip className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{isPreview ? "รวมใบบรีฟ" : "แทรกใบบรีฟ"}</p>
              <p className="text-[11px] text-muted-foreground">
                {hasBrief
                  ? isPreview
                    ? "พรีวิวใบบรีฟที่ผูกไว้ต่อท้ายใบเสนอราคา"
                    : "ต่อท้าย PDF ด้วยใบบรีฟที่ผูกไว้กับใบเสนอราคานี้"
                  : "ใบเสนอราคานี้ยังไม่ได้แนบบรีฟ"}
              </p>
            </div>
          </label>

          {/* Timeline appendix (separate pages) */}
          <label
            className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
              !hasTimeline
                ? "opacity-60 cursor-not-allowed border-border/40"
                : includeTimeline
                  ? "border-primary/40 bg-primary-soft/30"
                  : "border-border hover:bg-muted/40"
            }`}
          >
            <Checkbox
              checked={includeTimeline}
              disabled={!hasTimeline}
              onCheckedChange={(v) => setIncludeTimeline(v === true)}
              className="mt-0.5"
            />
            <CalendarRange className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {isPreview ? "รวมภาคผนวกไทม์ไลน์" : "แทรกภาคผนวกไทม์ไลน์"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {hasTimeline
                  ? isPreview
                    ? "ตารางรายละเอียดแยกหน้า — วันเริ่ม-จบ รอบแก้ และงวดชำระเงิน"
                    : "ต่อท้าย PDF ด้วยตารางไทม์ไลน์แบบละเอียด (หน้าแยก)"
                  : "ยังไม่มีข้อมูลไทม์ไลน์ที่จะแทรกได้"}
              </p>
            </div>
          </label>
        </div>

        <p className="flex items-start gap-1.5 text-[10.5px] text-muted-foreground leading-relaxed">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          {isPreview
            ? "พรีวิวจะแสดงเอกสารทั้งหมดในหน้าต่างเดียว เหมือนตอนเปิดไฟล์ PDF จริง"
            : "เอกสารที่แทรกเพิ่มจะถูกใส่ในหน้าต่อจากใบเสนอราคาภายใน PDF เดียวกัน"}
        </p>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 gap-1.5"
          >
            {ctaIcon}
            {ctaLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
