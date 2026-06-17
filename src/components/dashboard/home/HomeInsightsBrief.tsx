import * as React from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { listPublishedArticles } from "@/server/articles.functions";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArticleCardData } from "@/components/blog/ArticleCard";

const LIMIT = 2;

export function HomeInsightsBrief() {
  const [articles, setArticles] = React.useState<ArticleCardData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    listPublishedArticles({ data: { limit: LIMIT } })
      .then((res) => {
        if (!alive) return;
        setArticles((res.articles ?? []) as ArticleCardData[]);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (!loading && articles.length === 0) return null;

  return (
    <section id="insights" className="space-y-4 scroll-mt-24">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="rounded-lg bg-primary-soft text-primary p-2 shrink-0">
            <BookOpen className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight">บทความล่าสุด</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Freelance Insights จาก So1o Blog</p>
          </div>
        </div>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
        >
          ดูทั้งหมด
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {articles.map((a) => (
            <Link
              key={a.slug}
              to="/blog/$slug"
              params={{ slug: a.slug }}
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-soft transition-all"
            >
              <p className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {a.title}
              </p>
              {a.summary && (
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{a.summary}</p>
              )}
              {a.published_at && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {new Date(a.published_at).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
