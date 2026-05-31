import { createFileRoute } from "@tanstack/react-router";
import { listArticleSitemap } from "@/server/articles.functions";

const SITE_URL = "https://solofreelancer.com";

const PUBLIC_ROUTES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/auth", changefreq: "monthly", priority: "0.5" },
  { path: "/auth/forgot", changefreq: "yearly", priority: "0.2" },
  { path: "/reset-password", changefreq: "yearly", priority: "0.2" },
  { path: "/survey", changefreq: "monthly", priority: "0.3" },
  { path: "/creative-partner", changefreq: "monthly", priority: "0.6" },
  { path: "/dashboard", changefreq: "monthly", priority: "0.4" },
  { path: "/apply", changefreq: "monthly", priority: "0.4" },
  { path: "/labs", changefreq: "monthly", priority: "0.4" },
  { path: "/admin", changefreq: "monthly", priority: "0.3" },
  { path: "/llms.txt", changefreq: "monthly", priority: "0.2" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/cookies", changefreq: "yearly", priority: "0.3" },
  { path: "/refund", changefreq: "yearly", priority: "0.3" },
];

function xmlEscape(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;"
  );
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);

        const staticUrls = PUBLIC_ROUTES.map((r) => {
          const loc = r.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${r.path}`;
          return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`;
        });

        let articleUrls: string[] = [];
        try {
          const { articles } = await listArticleSitemap();
          articleUrls = (articles as Array<{ slug: string; published_at?: string | null; updated_at?: string | null }>).map((a) => {
            const lastmod = (a.updated_at || a.published_at || today).slice(0, 10);
            return `  <url>\n    <loc>${SITE_URL}/blog/${xmlEscape(a.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
          });
        } catch {
          // articles fetch failure should not break the sitemap
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...articleUrls].join("\n")}\n</urlset>\n`;
        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
