import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import { TicketDetailPanel } from "@/components/support/TicketDetailSheet";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/ticketSchema";
import {
  useAllTickets,
  type SupportTicket,
} from "@/store/supportTickets";
import { toast } from "sonner";

export function AdminTicketDetail({
  ticket,
  userLabel,
  onClose,
}: {
  ticket: SupportTicket;
  userLabel: string;
  onClose: () => void;
}) {
  const { update } = useAllTickets();
  const [adminNote, setAdminNote] = React.useState(ticket.adminNote ?? "");
  const [resolutionNote, setResolutionNote] = React.useState(ticket.resolutionNote ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setAdminNote(ticket.adminNote ?? "");
    setResolutionNote(ticket.resolutionNote ?? "");
  }, [ticket.id, ticket.adminNote, ticket.resolutionNote]);

  const patch = async (patch: Parameters<typeof update>[0]) => {
    setSaving(true);
    try {
      await update(patch);
      toast.success("บันทึกแล้ว");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    await patch({
      id: ticket.id,
      adminNote: adminNote.trim() || null,
      resolutionNote: resolutionNote.trim() || null,
    });
  };

  const quickAction = async (status: TicketStatus) => {
    await patch({ id: ticket.id, status });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l shadow-2xl flex flex-col animate-fade-in">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b shrink-0">
        <div className="min-w-0">
          <p className="text-xs font-mono font-bold text-[#FF5F05]">{ticket.ticketNumber}</p>
          <p className="text-sm font-semibold truncate">{ticket.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"
          aria-label="ปิด"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 border-b">
          <div className="flex flex-wrap gap-2 items-center">
            <TicketStatusBadge status={ticket.status} />
            <span className="text-[11px] text-muted-foreground">
              {userLabel} ·{" "}
              {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: th })}
            </span>
          </div>

          {ticket.sourceFeature && (
            <p className="text-[11px] text-muted-foreground">
              ฟีเจอร์: <span className="font-mono">{ticket.sourceFeature}</span>
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">สถานะ</label>
              <Select
                value={ticket.status}
                onValueChange={(v) => patch({ id: ticket.id, status: v as TicketStatus })}
                disabled={saving}
              >
                <SelectTrigger className="h-8 text-xs mt-0.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">ความสำคัญ</label>
              <Select
                value={ticket.priority}
                onValueChange={(v) => patch({ id: ticket.id, priority: v as TicketPriority })}
                disabled={saving}
              >
                <SelectTrigger className="h-8 text-xs mt-0.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ticket.status === "new" && (
              <Button
                size="sm"
                className="h-7 text-xs text-white"
                style={{ background: "#FF5F05" }}
                disabled={saving}
                onClick={() => quickAction("in_progress")}
              >
                รับงานและเริ่มแก้
              </Button>
            )}
            {ticket.status === "in_progress" && (
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={saving} onClick={() => quickAction("qa")}>
                ส่ง QA
              </Button>
            )}
            {ticket.status === "qa" && (
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={saving} onClick={() => quickAction("resolved")}>
                แก้แล้ว
              </Button>
            )}
            {["resolved", "qa", "in_progress"].includes(ticket.status) && (
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={saving} onClick={() => quickAction("closed")}>
                ปิดงาน
              </Button>
            )}
            {!["closed", "wont_fix"].includes(ticket.status) && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground"
                disabled={saving}
                onClick={() => quickAction("wont_fix")}
              >
                ไม่ดำเนินการ
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3 border-b">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground">โน้ตภายใน (แอดมิน)</label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={2}
              className="mt-1 text-xs resize-none"
              placeholder="บันทึกสำหรับทีม — ผู้ใช้ไม่เห็น"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground">คำตอบถึงผู้ใช้</label>
            <Textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={2}
              className="mt-1 text-xs resize-none"
              placeholder="แสดงเมื่อปิดงาน / แก้แล้ว"
            />
          </div>
          <Button size="sm" variant="secondary" className="h-7 text-xs" disabled={saving} onClick={saveNotes}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            บันทึกโน้ต
          </Button>
        </div>

        <TicketDetailPanel ticket={ticket} showAdminFields />
      </div>
    </div>
  );
}
