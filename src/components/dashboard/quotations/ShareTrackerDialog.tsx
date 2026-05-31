import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, Hash, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  shareToken: string;
  trackingCode: string;
  hasBrief: boolean;
  hasQuotation: boolean;
  isNew: boolean;
}

export function ShareTrackerDialog({ open, onOpenChange, shareToken, trackingCode, isNew }: Props) {
  const url = React.useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/track/${shareToken}`;
  }, [shareToken]);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("คัดลอกลิงก์แล้ว — ส่งให้ลูกค้าได้เลย");
    } catch {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            {isNew ? "สร้างลิงก์ติดตามงานสำเร็จ" : "ลิงก์ติดตามงานของลูกค้า"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            ส่งลิงก์นี้ให้ลูกค้าเพื่อให้เขาดูสถานะงาน ใบบรีฟ และใบเสนอราคาได้ตลอดเวลา (ไม่ต้องล็อกอิน)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">ลิงก์สาธารณะ</label>
            <Input
              value={url}
              readOnly
              className="text-xs font-mono mt-1"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">รหัสติดตาม:</span>
            <span className="font-mono font-semibold">{trackingCode}</span>
          </div>

          <Button
            size="lg"
            className="w-full gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            onClick={copyUrl}
          >
            <Copy className="h-4 w-4" /> คัดลอกลิงก์
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-3.5 w-3.5" /> เปิดดูหน้าลูกค้า
          </Button>

          <p className="text-[11px] text-muted-foreground leading-snug pt-1 border-t border-border">
            💡 จัดการงาน อัปโหลดพรีวิว ตรวจสลิป ฯลฯ ได้ที่แท็บ <span className="font-semibold">Job Tracker</span> ในแดชบอร์ด
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
