import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

export function TranscriptReviewPanel({
  transcript,
  onChange,
  transcribeCredits,
  reportCredits,
  onSummarize,
  busy,
}: {
  transcript: string;
  onChange: (v: string) => void;
  transcribeCredits: number;
  reportCredits: number;
  onSummarize: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold">
          ถอดเสียงแล้ว — ตรวจและแก้ชื่อร้าน/ตัวเลขก่อนสรุปรายงาน
        </h3>
        <p className="text-[11px] text-muted-foreground mt-1">
          AI จะร่างรายงานสรุปให้อ่าน — ไม่ใช่เอกสารสำเร็จรูป · ใช้ประมาณ {reportCredits} เครดิต
          {transcribeCredits > 0 ? ` (ถอดเสียงแล้ว ${transcribeCredits})` : " (ถอดเสียงฟรี)"}
        </p>
      </div>
      <Textarea
        value={transcript}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        className="text-sm font-mono leading-relaxed"
      />
      <Button onClick={onSummarize} disabled={busy || !transcript.trim()} className="w-full gap-2">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {busy ? "กำลังสรุปรายงาน…" : "สรุปเป็นรายงาน →"}
      </Button>
    </div>
  );
}
