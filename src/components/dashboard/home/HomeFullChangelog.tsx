import * as React from "react";
import { Sparkles, Wrench, Bug, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ChangelogEntry = {
  id: string;
  version: string;
  title: string;
  body: string;
  tag: string;
  released_at: string;
};

const TAG_META: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  feature: {
    label: "ใหม่",
    className: "bg-primary/10 text-primary",
    icon: <Sparkles className="h-3 w-3" aria-hidden />,
  },
  improvement: {
    label: "ปรับปรุง",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: <Wrench className="h-3 w-3" aria-hidden />,
  },
  fix: {
    label: "แก้บั๊ก",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
    icon: <Bug className="h-3 w-3" aria-hidden />,
  },
};

export function HomeFullChangelog() {
  const [entries, setEntries] = React.useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#updates") {
      setOpen(true);
    }
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("changelog_entries")
        .select("id, version, title, body, tag, released_at")
        .eq("is_published", true)
        .order("released_at", { ascending: false })
        .limit(20);
      if (!alive) return;
      setEntries((data as ChangelogEntry[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="updates" className="scroll-mt-24">
      <details
        open={open}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
        className="rounded-2xl border border-border bg-card shadow-soft group"
      >
        <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold tracking-tight">Changelog ทั้งหมด</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ประวัติอัปเดต So1o {entries.length > 0 && `(${entries.length} รายการ)`}
            </p>
          </div>
          <span className="text-xs text-primary font-semibold group-open:hidden">ขยาย</span>
          <span className="text-xs text-primary font-semibold hidden group-open:inline">ย่อ</span>
        </summary>

        <div className="px-5 pb-5 border-t border-border/60 pt-4">
          {loading ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              <Loader2 className="h-5 w-5 mx-auto animate-spin mb-2" aria-hidden />
              กำลังโหลด…
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center py-8 text-xs text-muted-foreground">ยังไม่มีอัปเดต</p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {entries.map((e) => {
                const meta = TAG_META[e.tag] ?? TAG_META.feature;
                return (
                  <div key={e.id} className="rounded-xl border border-border/60 p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.className}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{e.version}</span>
                    </div>
                    <h4 className="text-sm font-semibold mb-1">{e.title}</h4>
                    {e.body && (
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {e.body}
                      </p>
                    )}
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {new Date(e.released_at).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
