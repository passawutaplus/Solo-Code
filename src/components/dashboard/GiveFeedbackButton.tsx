import * as React from "react";
import { MessageSquareHeart, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMyBetaFeedback } from "@/store/betaFeedback";
import { useMyTickets } from "@/store/supportTickets";
import { TicketImagePicker } from "@/components/support/TicketImagePicker";
import { createTicketSchema, type TicketCategory } from "@/lib/ticketSchema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RATINGS = [
  { value: 5, label: "Excellent" },
  { value: 4, label: "Good" },
  { value: 3, label: "Okay" },
  { value: 2, label: "Poor" },
  { value: 1, label: "Terrible" },
] as const;

export function GiveFeedbackButton({
  feature,
  label,
  className,
}: {
  feature: string;
  label: string;
  className?: string;
}) {
  const { submit: submitBeta } = useMyBetaFeedback(feature);
  const { create } = useMyTickets();
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [sending, setSending] = React.useState(false);
  const [ticketNumber, setTicketNumber] = React.useState<string | null>(null);

  const reset = () => {
    setRating(null);
    setMessage("");
    setFiles([]);
    setTicketNumber(null);
  };

  const submitFeedback = async () => {
    if (!rating || sending) return;
    setSending(true);
    try {
      const category: TicketCategory = rating <= 2 ? "bug" : "improvement";
      const description = [
        message.trim(),
        `คะแนน: ${rating}/5`,
      ]
        .filter(Boolean)
        .join("\n");

      const title = rating <= 2 ? `ปัญหา: ${label}` : `ฟีดแบ็ก: ${label}`;
      const parsed = createTicketSchema.safeParse({
        title,
        description: description || undefined,
        category,
        source: "feedback_button",
        sourceFeature: feature,
      });
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
        return;
      }

      await submitBeta({
        feature,
        message: message.trim() || `(rating only — ${rating}/5)`,
        rating,
      });

      const ticket = await create({ ...parsed.data, files });
      setTicketNumber(ticket.ticketNumber);
      toast.success(`สร้างตั๋ว ${ticket.ticketNumber} แล้ว`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ส่งไม่สำเร็จ — ลองใหม่อีกครั้ง");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn("mt-8 flex justify-end pr-1", className)}>
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Give Feedback — ${label}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full",
              "bg-primary/15 backdrop-blur-md border border-primary/30 text-primary",
              "px-3 py-1.5 text-xs font-medium shadow-soft",
              "hover:bg-primary/25 hover:shadow-elevated transition-all",
            )}
          >
            <MessageSquareHeart className="h-3.5 w-3.5" />
            <span>Give Feedback</span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={8}
          className="give-feedback-popover w-80 p-0 border-border/60 shadow-elevated max-h-[min(560px,75vh)] overflow-y-auto"
        >
          {ticketNumber ? (
            <div className="p-4 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-xs text-muted-foreground">เลขตั๋วของคุณ</p>
              <p className="text-xl font-bold text-primary tracking-wide mt-0.5">{ticketNumber}</p>
              <p className="text-[10px] text-muted-foreground mt-2 max-w-[240px]">
                ติดตามได้ที่ Support Hub → ตั๋วของฉัน
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5 h-7 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(ticketNumber);
                  toast.success("คัดลอกเลขตั๋วแล้ว");
                }}
              >
                <Copy className="h-3 w-3" />
                คัดลอก
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold leading-tight">ให้คะแนน {label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  จากนั้นระบบจะสร้างตั๋ว TKT-xxxx ให้ติดตาม
                </p>
              </div>

              <div className="space-y-1">
                {RATINGS.map((r) => {
                  const selected = rating === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRating(r.value)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/60 bg-background hover:bg-muted/60",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold shrink-0",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {r.value}
                      </span>
                      <span className="text-xs">{r.label}</span>
                    </button>
                  );
                })}
              </div>

              {rating !== null && (
                <div className="space-y-2.5 animate-fade-in">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="อธิบายปัญหาหรือข้อเสนอแนะ (ไม่ระบุก็ได้)"
                    rows={2}
                    maxLength={500}
                    className="resize-none text-xs bg-background"
                  />
                  <TicketImagePicker files={files} onChange={setFiles} compact />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground">{message.length}/500</span>
                    <Button
                      size="sm"
                      onClick={submitFeedback}
                      disabled={sending}
                      className="h-7 gap-1.5"
                    >
                      {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      สร้างตั๋ว
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
