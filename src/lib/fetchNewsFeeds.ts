import { NEWS_FEED_SOURCES, type NewsFeedSource } from "@/lib/newsSources";

export interface RawNewsArticle {
  title: string;
  link: string;
  excerpt: string;
  pubDate: Date | null;
  category: string;
  emoji: string;
  source: string;
}

const FEED_TIMEOUT_MS = 10_000;
const MAX_AGE_MS = 48 * 60 * 60 * 1000;
const MAX_PER_FEED = 2;

function stripTags(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function firstTag(block: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i").exec(block);
  if (cdata?.[1]) return stripTags(cdata[1]);

  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(block);
  return plain?.[1] ? stripTags(plain[1]) : "";
}

function extractLink(block: string): string {
  const atomLink =
    /<link[^>]+rel=["']alternate["'][^>]+href=["']([^"']+)["']/i.exec(block) ??
    /<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i.exec(block);
  if (atomLink?.[1]) return atomLink[1].trim();

  const rssLink = /<link>([^<]+)<\/link>/i.exec(block);
  return rssLink?.[1]?.trim() ?? "";
}

function extractPubDate(block: string): Date | null {
  const raw =
    firstTag(block, "pubDate") ||
    firstTag(block, "published") ||
    firstTag(block, "updated") ||
    firstTag(block, "dc:date");
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseFeedXml(xml: string, feed: NewsFeedSource): RawNewsArticle[] {
  const isAtom = /<feed[\s>]/i.test(xml);
  const blocks = isAtom
    ? [...xml.matchAll(/<entry[\s>]([\s\S]*?)<\/entry>/gi)].map((m) => m[0])
    : [...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)].map((m) => m[0]);

  const now = Date.now();
  const articles: RawNewsArticle[] = [];

  for (const block of blocks) {
    const title = firstTag(block, "title");
    const link = extractLink(block);
    if (!title || !link) continue;

    const excerpt =
      firstTag(block, "description") ||
      firstTag(block, "summary") ||
      firstTag(block, "content");

    const pubDate = extractPubDate(block);
    if (pubDate && now - pubDate.getTime() > MAX_AGE_MS) continue;

    articles.push({
      title: title.slice(0, 200),
      link,
      excerpt: excerpt.slice(0, 500),
      pubDate,
      category: feed.category,
      emoji: feed.emoji,
      source: feed.source,
    });
  }

  return articles.slice(0, MAX_PER_FEED);
}

async function fetchSingleFeed(feed: NewsFeedSource): Promise<RawNewsArticle[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const res = await fetch(feed.feedUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        "User-Agent": "So1o-DailyTrends/1.0",
      },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseFeedXml(xml, feed);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchNewsFromFeeds(): Promise<RawNewsArticle[]> {
  const results = await Promise.all(NEWS_FEED_SOURCES.map((feed) => fetchSingleFeed(feed)));
  const seen = new Set<string>();
  const merged: RawNewsArticle[] = [];

  for (const batch of results) {
    for (const article of batch) {
      const key = article.link.replace(/\/$/, "").toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(article);
    }
  }

  return merged.sort((a, b) => {
    const ta = a.pubDate?.getTime() ?? 0;
    const tb = b.pubDate?.getTime() ?? 0;
    return tb - ta;
  });
}
