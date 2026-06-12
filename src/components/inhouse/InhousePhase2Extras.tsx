import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Workflow } from "lucide-react";

/** Phase 2 — shared asset library entry (org-scoped assets ship later). */
export function InhouseSharedAssetsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderOpen className="h-4 w-4" />
          Shared Asset Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>ไลบรารี asset ร่วมของทีม (brand kit, รูป, ไฟล์) — ใช้ Assets ส่วนตัวได้ก่อน แล้วจะ sync ข้ามสมาชิกในรอบถัดไป</p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard" search={{ tab: "mydata", sub: "assets" }}>
            เปิด Assets (My Desk)
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface PipelineBridgeProps {
  orgId: string;
  linkedQuotationId: string | null;
  onCreateFromQuotation?: () => void;
}

/** Link workspace ↔ Client Work pipeline quotation. */
export function InhousePipelineBridge({ linkedQuotationId, onCreateFromQuotation }: PipelineBridgeProps) {
  if (linkedQuotationId) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-4 text-sm">
          <Workflow className="h-4 w-4 text-muted-foreground" />
          <span>
            เชื่อมกับ Pipeline แล้ว ·{" "}
            <Link to="/dashboard" search={{ tab: "finance", sub: "pipeline" }} className="text-primary underline">
              เปิด Pipeline
            </Link>
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!onCreateFromQuotation) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Client Work</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="mb-3">สร้าง workspace จากดีลใน Pipeline (เลือกจากหน้า Quotation/Pipeline)</p>
        <Button variant="outline" size="sm" onClick={onCreateFromQuotation}>
          สร้าง workspace จากดีลล่าสุด
        </Button>
      </CardContent>
    </Card>
  );
}
