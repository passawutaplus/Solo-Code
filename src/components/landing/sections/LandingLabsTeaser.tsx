import { Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical } from "lucide-react";

export function LandingLabsTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-violet-500/10 via-card to-primary/5 p-8 sm:p-12 overflow-hidden relative">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
            <FlaskConical className="h-3.5 w-3.5" /> Labs
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
            ห้องทดลองนักออกแบบ
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Prototype · Test and Play — เครื่องมือสี ฟอนต์ และเทคนิคสำหรับฟรีแลนซ์
            ใน So1o Creative Labs
          </p>
          <Link
            to="/labs"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-elevated hover:opacity-90"
          >
            เปิด Creative Labs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block opacity-40"
          aria-hidden
        >
          <div className="h-full w-full bg-gradient-to-l from-violet-500/20 to-transparent" />
        </div>
        <div className="mt-8 lg:hidden aspect-video max-w-md rounded-2xl border border-dashed border-violet-500/30 bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
          Labs preview · TODO: asset
        </div>
      </div>
    </section>
  );
}
