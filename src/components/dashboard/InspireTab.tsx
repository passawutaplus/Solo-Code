import * as React from "react";
import { Sparkles, ArrowUpRight, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GiveFeedbackButton } from "@/components/dashboard/GiveFeedbackButton";
import { safeHref } from "@/lib/security";
import {
  CATEGORIES,
  RESOURCES,
  type CategoryMeta,
  type InspireResource,
} from "./inspire/resources";

export function InspireTab() {
  const [active, setActive] = React.useState<CategoryMeta["id"]>("all");

  const counts = React.useMemo(() => {
    const map: Record<string, number> = { all: RESOURCES.length };
    RESOURCES.forEach((r) => {
      map[r.category] = (map[r.category] || 0) + 1;
    });
    return map;
  }, []);

  const filtered =
    active === "all" ? RESOURCES : RESOURCES.filter((r) => r.category === active);

  // Group by category for "all" view (with dividers)
  const grouped = React.useMemo(() => {
    if (active !== "all") return null;
    return CATEGORIES.filter((c) => c.id !== "all").map((cat) => ({
      cat,
      items: RESOURCES.filter((r) => r.category === cat.id),
    }));
  }, [active]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero header */}
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-soft">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-[#FF5F05]/30 to-[#FF9F67]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[#FF9F67]/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5F05] to-[#FF9F67] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] shadow-soft">
              <Compass className="h-3 w-3" /> So1o · Inspire
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              แหล่งบ่มเพาะไอเดีย
              <br />
              <span className="text-muted-foreground font-semibold">ของฟรีแลนซ์ครีเอทีฟ</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              คัดสรรเว็บไซต์ระดับโลกที่ดีไซเนอร์มือโปรใช้จริง — เปิดทุกเช้าเพื่อเติมแรงบันดาลใจ ก่อนเริ่มงาน
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {RESOURCES.length} sources · curated
          </Badge>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="sticky top-[3.25rem] z-10 -mx-3 sm:-mx-5 px-3 sm:px-5 py-2 bg-background/85 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat.id;
            const count = counts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#FF5F05] to-[#FF9F67] text-white border-transparent shadow-soft"
                    : "bg-card text-foreground border-border hover:border-[#FF5F05]/40 hover:-translate-y-0.5"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                    isActive ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {grouped ? (
        <div className="space-y-10">
          {grouped.map(({ cat, items }) => (
            <section key={cat.id} className="space-y-4">
              <CategoryDivider cat={cat} count={items.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((r) => (
                  <ResourceCard key={r.name} resource={r} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <ResourceCard key={r.name} resource={r} />
          ))}
        </div>
      )}

      <GiveFeedbackButton feature="inspire" label="Inspire" />
    </div>
  );
}

function CategoryDivider({ cat, count }: { cat: CategoryMeta; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5 shadow-soft">
        <span className="text-base leading-none">{cat.emoji}</span>
        <span className="text-sm font-bold tracking-tight">{cat.label}</span>
        <span className="text-[10px] font-bold text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
          {count}
        </span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-border via-border/60 to-transparent" />
    </div>
  );
}

function ResourceCard({ resource }: { resource: InspireResource }) {
  const href = safeHref(resource.url) ?? "#";
  const categoryMeta = CATEGORIES.find((c) => c.id === resource.category);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block rounded-2xl p-[1.5px] bg-border hover:bg-gradient-to-br hover:from-[#FF5F05] hover:to-[#FF9F67] transition-all duration-300 hover:shadow-[0_18px_40px_-18px_rgba(255,95,5,0.45)] hover:-translate-y-1"
    >
      <div className="relative rounded-[14px] bg-card h-full flex flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold tracking-tight group-hover:text-[#FF5F05] transition-colors truncate">
              {resource.name}
            </h3>
            {categoryMeta && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>{categoryMeta.emoji}</span>
                {categoryMeta.label}
              </span>
            )}
          </div>
          <span className="shrink-0 h-7 w-7 rounded-full bg-muted group-hover:bg-gradient-to-br group-hover:from-[#FF5F05] group-hover:to-[#FF9F67] group-hover:text-white flex items-center justify-center transition-all">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {resource.description}
        </p>

        <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-medium truncate">
            {resource.domain}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground group-hover:text-[#FF5F05] transition-colors">
            เปิดเว็บ
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
}
