import { Globe, Smartphone } from "lucide-react";

export function LandingDashboardPreview() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dash Board</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          ทำงานได้ทุกที่ ทุกเวลา ทุก device — responsive เต็มรูปแบบ
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <PreviewTile
          icon={Globe}
          label="Desktop · GIF loop"
          hint="แดชบอร์ดบนจอใหญ่"
        />
        <PreviewTile
          icon={Smartphone}
          label="Mobile · GIF loop"
          hint="ใช้งานบนมือถือลื่นไหล"
        />
      </div>
    </section>
  );
}

function PreviewTile({
  icon: Icon,
  label,
  hint,
}: {
  icon: typeof Globe;
  label: string;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-primary/30 bg-card/50 p-6 min-h-[220px] flex flex-col">
      <div className="flex-1 rounded-2xl bg-muted/80 border border-border flex flex-col items-center justify-center gap-3 animate-pulse">
        <Icon className="h-10 w-10 text-primary/50" />
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground/70">TODO: replace asset</span>
      </div>
      <p className="mt-4 text-sm font-medium text-center">{hint}</p>
    </div>
  );
}
