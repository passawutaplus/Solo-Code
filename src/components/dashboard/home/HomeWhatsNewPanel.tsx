import * as React from "react";
import { Megaphone, Sparkles, Wrench, Bug, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeHref } from "@/lib/security";
import { Skeleton } from "@/components/ui/skeleton";

type ChangelogEntry = {
  id: string;
  version: string;
  title: string;
  body: string;
  tag: string;
  released_at: string;
};

type Announcement = {
  id: string;
  message: string;
  link_url: string | null;
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

export function HomeWhatsNewPanel() {
  const [entries, setEntries] = React.useState<ChangelogEntry[]>([]);
  const [announcement, setAnnouncement] = React.useState<Announcement | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const nowIso = new Date().toISOString();
      const [changelogRes, announceRes] = await Promise.all([
        (supabase as any)
          .from("changelog_entries")
          .select("id, version, title, body, tag, released_at")
          .eq("is_published", true)
          .order("released_at", { ascending: false })
          .limit(3),
        supabase
          .from("announcements")
          .select("id, message, link_url")
          .eq("is_active", true)
          .or(`start_at.is.null,start_at.lte.${nowIso}`)
          .or(`end_at.is.null,end_at.gte.${nowIso}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!alive) return;
      setEntries((changelogRes.data as ChangelogEntry[]) ?? []);
      setAnnouncement((announceRes.data as Announcement) ?? null);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4 h-full">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-primary-soft text-primary p-2 shrink-0">
          <Megaphone className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h3 className="text-sm font-bold tracking-tight">อัปเดต So1o</h3>
          <p className="text-[11px] text-muted-foreground">Changelog และประกาศล่าสุด</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {announcement?.message && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              {(() => {
                const href = announcement.link_url ? safeHref(announcement.link_url) : null;
                const inner = (
                  <p className="text-xs leading-relaxed text-foreground">{announcement.message}</p>
                );
                return href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                );
              })()}
            </div>
          )}

          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">ยังไม่มีอัปเดต</p>
          ) : (
            <ul className="space-y-3">
              {entries.map((e) => {
                const meta = TAG_META[e.tag] ?? TAG_META.feature;
                return (
                  <li key={e.id} className="rounded-xl border border-border/60 p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.className}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{e.version}</span>
                    </div>
                    <p className="text-xs font-semibold leading-snug">{e.title}</p>
                    {e.body && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{e.body}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <a
            href="#updates"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            ดู changelog ทั้งหมด
            <ArrowRight className="h-3 w-3" aria-hidden />
          </a>
        </>
      )}
    </div>
  );
}
