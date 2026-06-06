import * as React from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMyBetaFeedback } from "@/store/betaFeedback";
import { CreateTicketForm } from "@/components/support/CreateTicketSheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TicketCategory } from "@/lib/ticketSchema";

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
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<"rate" | "ticket">("rate");
  const [rating, setRating] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [ticketFormKey, setTicketFormKey] = React.useState(0);

  const reset = () => {
    setStep("rate");
    setRating(null);
    setMessage("");
    setTicketFormKey((k) => k + 1);
  };

  const category: TicketCategory = rating !== null && rating <= 2 ? "bug" : "improvement";

  const goToTicket = async () => {
    if (!rating || sending) return;
    setSending(true);
    try {
      await submitBeta({
        feature,
        message: message.trim() || `(rating only — ${rating}/5)`,
        rating,
      });
      setTicketFormKey((k) => k + 1);
      setStep("ticket");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ส่งไม่สำเร็จ — ลองใหม่อีกครั้ง");
    } finally {
      setSending(false);
    }
  };

  const ticketPrefill = {
    title: rating !== null && rating <= 2 ? `ปัญหา: ${label}` : `ฟีดแบ็ก: ${label}`,
    description: [
      message.trim(),
      rating !== null ? `คะแนน: ${rating}/5` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    category,
    source: "feedback_button" as const,
    sourceFeature: feature,
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
            aria-label={`รายงานปัญหา ${label}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full",
              "bg-primary/15 backdrop-blur-md border border-primary/30 text-primary",
              "px-3 py-1.5 text-xs font-medium shadow-soft",
              "hover:bg-primary/25 hover:shadow-elevated transition-all",
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>รายงานปัญหา</span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={8}
          className="w-80 p-0 border-border/60 shadow-elevated max-h-[min(520px,70vh)] overflow-hidden"
        >
          {step === "rate" ? (
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
                <div className="space-y-2 animate-fade-in">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="อธิบายปัญหาหรือข้อเสนอแนะ (ไม่ระบุก็ได้)"
                    rows={2}
                    maxLength={500}
                    className="resize-none text-xs bg-background"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground">{message.length}/500</span>
                    <Button size="sm" onClick={goToTicket} disabled={sending} className="h-7 gap-1.5">
                      {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      สร้างตั๋ว
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <CreateTicketForm
              key={ticketFormKey}
              compact
              prefill={ticketPrefill}
              onCreated={() => {
                setTimeout(() => {
                  setOpen(false);
                  reset();
                }, 2000);
              }}
              onCancel={() => setStep("rate")}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
