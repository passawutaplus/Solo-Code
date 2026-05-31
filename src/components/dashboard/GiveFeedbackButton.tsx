import * as React from "react";
import { MessageSquare, Loader2, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMyBetaFeedback } from "@/store/betaFeedback";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Floating "Give feedback" pill — bottom-right of each feature.
 * Click → opens a 1–5 rating popover with optional comment.
 */
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
  const { submit } = useMyBetaFeedback(feature);
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const reset = () => {
    setRating(null);
    setMessage("");
    setDone(false);
  };

  const send = async () => {
    if (!rating || sending) return;
    setSending(true);
    try {
      await submit({
        feature,
        // store requires non-empty message — fall back to a marker so rating alone is allowed
        message: message.trim() || `(rating only — ${rating}/5)`,
        rating,
      });
      setDone(true);
      toast.success("ขอบคุณสำหรับฟีดแบ็ก 🙌");
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 1200);
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
            aria-label={`ให้คะแนน ${label}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full",
              "bg-primary/15 backdrop-blur-md border border-primary/30 text-primary",
              "px-3 py-1.5 text-xs font-medium shadow-soft",
              "hover:bg-primary/25 hover:shadow-elevated transition-all",
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Give feedback</span>
          </button>
        </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-72 p-0 border-border/60 shadow-elevated"
      >
        {done ? (
          <div className="p-5 text-center space-y-2">
            <div className="mx-auto h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-semibold">ส่งฟีดแบ็กแล้ว</p>
            <p className="text-xs text-muted-foreground">ขอบคุณที่ช่วยให้ So1o ดีขึ้นนะครับ</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold leading-tight">ให้คะแนน {label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                ประสบการณ์การใช้งาน {label} เป็นอย่างไรบ้าง?
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
              <div className="space-y-2 animate-fade-in">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="อยากบอกอะไรเพิ่มไหม? (ไม่ระบุก็ได้)"
                  rows={2}
                  maxLength={500}
                  className="resize-none text-xs bg-background"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">{message.length}/500</span>
                  <Button size="sm" onClick={send} disabled={sending} className="h-7 gap-1.5">
                    {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    ส่งคะแนน
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

