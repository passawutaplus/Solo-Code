import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANTHEM_SHOWCASE_URL } from "@/lib/productLinks";

type Props = {
  jobTitle: string;
  clientName?: string | null;
};

/** Phase 4 stub — deep-link to Anthem project editor with prefill (title only for now). */
export function PostToAnthemBanner({ jobTitle, clientName }: Props) {
  const anthemBase = ANTHEM_SHOWCASE_URL.replace(/\/$/, "");
  const params = new URLSearchParams({
    from: "so1o",
    title: jobTitle.slice(0, 120),
  });
  if (clientName?.trim()) {
    params.set("client", clientName.trim().slice(0, 80));
  }
  const href = `${anthemBase}/portfolio/new?${params.toString()}`;

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-2 min-w-0 flex-1">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">ปิดลูป — โพสต์ผลงานบน Anthem</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            งานเสร็จแล้ว? นำผลงานไปหน้าร้านเพื่อรับงานใหม่ — ชื่อโปรเจกต์จะถูก prefill จาก Job Tracker
          </p>
        </div>
      </div>
      <Button asChild size="sm" variant="outline" className="shrink-0 gap-1.5 border-primary/30">
        <a href={href} target="_blank" rel="noopener noreferrer">
          โพสต์ผลงาน
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Button>
    </div>
  );
}
