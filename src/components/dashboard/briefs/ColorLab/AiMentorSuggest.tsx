import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeHex, getComplementary } from "@/lib/colorUtils";

interface Props {
  hex: string;
  onPick: (hex: string) => void;
}

interface MentorResult {
  complementary: string[];
  mood: string;
  tip: string;
}

export function AiMentorSuggest({ hex, onPick }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<MentorResult | null>(null);
  const [askedFor, setAskedFor] = React.useState<string | null>(null);

  const ask = async () => {
    setLoading(true);
    setAskedFor(hex);
    try {
      const { data, error } = await supabase.functions.invoke("color-mentor", {
        body: { hex },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const safe: MentorResult = {
        complementary: Array.isArray(data?.complementary)
          ? data.complementary
              .map(normalizeHex)
              .filter((x: string | null): x is string => !!x)
              .slice(0, 4)
          : [],
        mood: typeof data?.mood === "string" ? data.mood : "",
        tip: typeof data?.tip === "string" ? data.tip : "",
      };
      // Local fallback if AI returned no complementary
      if (safe.complementary.length === 0) {
        const c = getComplementary(hex);
        if (c) safe.complementary = [c];
      }
      setResult(safe);
    } catch (e) {
      toast.error(`AI Mentor ไม่พร้อม: ${(e as Error).message}`);
      // Fallback offline suggestion
      const c = getComplementary(hex);
      setResult({
        complementary: c ? [c] : [],
        mood: "",
        tip: "ขณะนี้ AI ไม่พร้อมใช้ — แสดงสี complementary จากการคำนวณแบบ offline แทน",
      });
    } finally {
      setLoading(false);
    }
  };

  const stale = askedFor !== hex;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> So1o AI Mentor
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={ask}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "วิเคราะห์สีนี้"}
        </Button>
      </div>
      {!result && !loading && (
        <p className="text-[11px] text-muted-foreground">
          กดปุ่มเพื่อให้ AI แนะนำคู่สี + อารมณ์งานสำหรับ {hex}
        </p>
      )}
      {result && (
        <div className={`space-y-2 ${stale ? "opacity-50" : ""}`}>
          {result.mood && (
            <p className="text-xs">
              <span className="font-medium">อารมณ์:</span> {result.mood}
            </p>
          )}
          {result.tip && (
            <p className="text-[11px] text-muted-foreground italic">💡 {result.tip}</p>
          )}
          {result.complementary.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                สีที่เข้าคู่ได้ดี
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.complementary.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onPick(c)}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-card pl-1 pr-2 py-1 text-[10px] font-mono hover:border-primary"
                    title={`ใช้ ${c}`}
                  >
                    <span
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: c }}
                    />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
