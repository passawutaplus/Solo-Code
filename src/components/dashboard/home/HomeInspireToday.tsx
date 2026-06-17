import * as React from "react";
import { Compass, ExternalLink } from "lucide-react";
import { RESOURCES } from "@/components/dashboard/inspire/resources";
import { pickDailyItems } from "@/lib/dailySeedPick";
import { safeHref } from "@/lib/security";

const DAILY_COUNT = 3;

export function HomeInspireToday() {
  const picks = React.useMemo(
    () => pickDailyItems(RESOURCES, DAILY_COUNT, "inspire-today"),
    [],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4 h-full">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-primary-soft text-primary p-2 shrink-0">
          <Compass className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h3 className="text-sm font-bold tracking-tight">Inspire วันนี้</h3>
          <p className="text-[11px] text-muted-foreground">แหล่งไอเดียสุ่มรายวัน {DAILY_COUNT} ลิงก์</p>
        </div>
      </div>

      <ul className="space-y-2">
        {picks.map((r) => {
          const href = safeHref(r.url);
          if (!href) return null;
          return (
            <li key={r.url}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 rounded-xl border border-border/60 p-3 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold group-hover:text-primary transition-colors truncate">
                    {r.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {r.description}
                  </p>
                </div>
                <ExternalLink
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5"
                  aria-hidden
                />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
