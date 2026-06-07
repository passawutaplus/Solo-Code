import * as React from "react";
import { FileText, Lightbulb, Loader2, Plus, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  queuePipelineQuotation,
  queueSmartBriefQuickCapture,
} from "@/lib/pipelineNewDeal";

type Props = {
  variant?: "sidebar" | "header";
  collapsed?: boolean;
  onNavigate: (section: string, sub?: string) => void;
  /** เมื่ออยู่หน้า Pipeline แล้ว — สร้างใบเสนอราคาทันที */
  onCreateQuotation?: () => void | Promise<void>;
  creating?: boolean;
};

export function PipelineNewDealButton({
  variant = "sidebar",
  collapsed = false,
  onNavigate,
  onCreateQuotation,
  creating = false,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const goBrief = () => {
    queueSmartBriefQuickCapture();
    onNavigate("planner", "briefs");
    setOpen(false);
  };

  const goQuotation = () => {
    if (onCreateQuotation) {
      void onCreateQuotation();
    } else {
      queuePipelineQuotation();
      onNavigate("finance", "pipeline");
    }
    setOpen(false);
  };

  if (variant === "header") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            className="gap-1.5 text-white shrink-0"
            style={{ background: "#FF5F05" }}
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            สร้างดีลใหม่
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-2">
          <DealOptions onBrief={goBrief} onQuotation={goQuotation} />
        </PopoverContent>
      </Popover>
    );
  }

  if (collapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="สร้างดีลใหม่"
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5F05] to-orange-400 text-white shadow-soft hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="end" className="w-72 p-2">
          <DealOptions onBrief={goBrief} onQuotation={goQuotation} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full min-w-0 rounded-xl px-3 py-2.5 text-left text-white shadow-soft",
            "bg-gradient-to-br from-[#FF5F05] to-orange-400",
            "hover:brightness-105 active:scale-[0.99] transition-all",
            "flex items-center gap-2",
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold leading-tight truncate">สร้างดีลใหม่</span>
            <span className="block text-[10px] text-white/85 leading-tight truncate">
              Smart Brief หรือใบเสนอราคา
            </span>
          </span>
          <Plus className="h-4 w-4 shrink-0 opacity-90" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-[calc(var(--sidebar-width)-1rem)] max-w-[15rem] p-2"
      >
        <DealOptions onBrief={goBrief} onQuotation={goQuotation} />
      </PopoverContent>
    </Popover>
  );
}

function DealOptions({
  onBrief,
  onQuotation,
}: {
  onBrief: () => void;
  onQuotation: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="px-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        เริ่มดีลใหม่
      </p>
      <button
        type="button"
        onClick={onBrief}
        className="w-full rounded-lg border border-border bg-card p-2.5 text-left hover:border-[#FF5F05]/40 hover:bg-[#FF5F05]/5 transition-colors"
      >
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FF5F05]/10 text-[#FF5F05]">
            <Lightbulb className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-foreground">Smart Brief</span>
            <span className="block text-[10px] text-muted-foreground leading-snug mt-0.5">
              จัดบรีฟให้ตรงกับลูกค้าเป็นหลักฐาน — ส่งลิงก์ให้กรอกหรือยืนยันร่วมกันก่อนเสนอราคา
            </span>
          </span>
        </div>
      </button>
      <button
        type="button"
        onClick={onQuotation}
        className="w-full rounded-lg border border-border bg-card p-2.5 text-left hover:border-[#FF5F05]/40 hover:bg-[#FF5F05]/5 transition-colors"
      >
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
            <FileText className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-foreground">ใบเสนอราคาเลย</span>
            <span className="block text-[10px] text-muted-foreground leading-snug mt-0.5">
              ทางลัดสำหรับงานที่คุยจบแล้ว — ข้ามบรีฟหรือกลับมาทำทีหลังได้
            </span>
          </span>
        </div>
      </button>
    </div>
  );
}
