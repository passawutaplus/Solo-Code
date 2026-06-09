import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fetchNewsFromFeeds, type RawNewsArticle } from "@/lib/fetchNewsFeeds";

export interface DailyTrendItem {
  category: string;
  title: string;
  body: string;
  emoji: string;
  source?: string;
  source_url?: string;
}

const FALLBACK_TRENDS: DailyTrendItem[] = [
  {
    category: "สีเทรนด์",
    title: "Mocha Mousse — สีน้ำตาลกาแฟอบอุ่น",
    body: "Pantone Color of the Year 2025 — เหมาะกับงานแบรนด์ไลฟ์สไตล์, คาเฟ่, สินค้า Eco",
    emoji: "🎨",
    source: "Pantone",
    source_url: "https://www.pantone.com/color-of-the-year",
  },
  {
    category: "Typography",
    title: "Variable Fonts ครองวงการ UI",
    body: "Inter, Geist, Satoshi มาแรง — เลือก weight 400/600 คู่กันให้ hierarchy ชัด อ่านง่ายบนมือถือ",
    emoji: "✍️",
    source: "Google Fonts",
    source_url: "https://fonts.google.com/",
  },
  {
    category: "AI Tools",
    title: "Gemini 3 + Nano Banana 2 มาแล้ว",
    body: "Image gen ที่เข้าใจบริบทไทยดีขึ้น — ลองใช้สำหรับงาน mood board และ key visual",
    emoji: "🤖",
    source: "Google",
    source_url: "https://gemini.google.com/",
  },
  {
    category: "Design Style",
    title: "Brutalist Web ยังครองใจ",
    body: "ฟอนต์ใหญ่ คอนทราสต์จัด ขอบเหลี่ยม — เหมาะกับแบรนด์ที่อยากดูกล้า ต่างจากตลาด minimal",
    emoji: "🟧",
    source: "Awwwards",
    source_url: "https://www.awwwards.com/",
  },
  {
    category: "Motion",
    title: "Micro-interactions = ราคาบวก",
    body: "ลูกค้ายอมจ่ายเพิ่ม 20-40% สำหรับงานที่มี hover/scroll animation นุ่ม ๆ",
    emoji: "✨",
    source: "Smashing Magazine",
    source_url: "https://www.smashingmagazine.com/",
  },
  {
    category: "Workflow",
    title: "Figma Sites เปิดสาธารณะแล้ว",
    body: "ออกแบบใน Figma แล้ว publish เป็นเว็บได้เลย — เหมาะกับ landing page งานเล็ก",
    emoji: "🚀",
    source: "Figma",
    source_url: "https://www.figma.com/sites/",
  },
];

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return url.replace(/\/$/, "").toLowerCase();
  }
}

function buildAllowedLinks(articles: RawNewsArticle[]): Map<string, RawNewsArticle> {
  const map = new Map<string, RawNewsArticle>();
  for (const a of articles) {
    map.set(normalizeUrl(a.link), a);
  }
  return map;
}

function validateTrendItems(
  items: DailyTrendItem[],
  allowed: Map<string, RawNewsArticle>,
): DailyTrendItem[] {
  const result: DailyTrendItem[] = [];
  for (const it of items) {
    if (!it.source_url) continue;
    const match = allowed.get(normalizeUrl(it.source_url));
    if (!match) continue;
    result.push({
      category: it.category || match.category,
      title: it.title,
      body: it.body,
      emoji: it.emoji || match.emoji,
      source: it.source || match.source,
      source_url: match.link,
    });
  }
  return result;
}

async function summarizeArticlesViaAI(articles: RawNewsArticle[]): Promise<DailyTrendItem[]> {
  if (!process.env.GEMINI_API_KEY || articles.length === 0) return [];

  const dateStr = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const articleList = articles
    .slice(0, 24)
    .map(
      (a, i) =>
        `[${i + 1}] category="${a.category}" source="${a.source}" link="${a.link}"\ntitle: ${a.title}\nexcerpt: ${a.excerpt}`,
    )
    .join("\n\n");

  const systemPrompt = `คุณคือ Senior Art Director ที่สรุปข่าว design/branding/AI tools รายวันสำหรับฟรีแลนซ์ไทย
ตอบเป็น JSON array 6 รายการ แต่ละรายการมี keys: category, title, body, emoji, source, source_url
- เลือก 6 ข่าวจากรายการที่ให้มา ให้หลากหลายหมวด
- title: หัวข้อสั้น ไม่เกิน 60 ตัวอักษร (ภาษาไทยผสมอังกฤษได้)
- body: คำอธิบายสั้น 1-2 ประโยค ไม่เกิน 140 ตัวอักษร เน้นใช้งานจริงสำหรับฟรีแลนซ์
- emoji: 1 ตัว
- source: ชื่อเว็บอ้างอิงจาก input
- source_url: ต้องเป็น link จาก input เท่านั้น ห้ามสร้าง URL เอง
ห้ามใส่ markdown หรือ \`\`\` ตอบเฉพาะ JSON array บริสุทธิ์`;

  const userPrompt = `วันที่ ${dateStr}\n\nข่าวจริงจาก RSS:\n\n${articleList}\n\nสรุป 6 หัวข้อที่ฟรีแลนซ์ไทยควรรู้วันนี้`;

  try {
    const { geminiChat, defaultModel } = await import("@/lib/geminiServer");
    const { text } = await geminiChat({
      model: defaultModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      maxOutputTokens: 2048,
    });
    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    if (!cleaned) return [];
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start < 0 || end < 0) return [];
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    const raw = parsed.slice(0, 8).map((it: Record<string, unknown>) => ({
      category: String(it.category ?? "Design"),
      title: String(it.title ?? "").slice(0, 80),
      body: String(it.body ?? "").slice(0, 200),
      emoji: String(it.emoji ?? "✨").slice(0, 4),
      source: it.source ? String(it.source) : undefined,
      source_url: it.source_url ? String(it.source_url) : undefined,
    }));

    return validateTrendItems(raw, buildAllowedLinks(articles));
  } catch {
    return [];
  }
}

function articlesToTrendItems(articles: RawNewsArticle[]): DailyTrendItem[] {
  const categories = new Set<string>();
  const picked: DailyTrendItem[] = [];

  for (const a of articles) {
    if (picked.length >= 6) break;
    if (categories.has(a.category) && picked.some((p) => p.category === a.category)) continue;
    categories.add(a.category);
    picked.push({
      category: a.category,
      title: a.title.slice(0, 80),
      body: (a.excerpt || a.title).slice(0, 200),
      emoji: a.emoji,
      source: a.source,
      source_url: a.link,
    });
  }

  for (const a of articles) {
    if (picked.length >= 6) break;
    if (picked.some((p) => normalizeUrl(p.source_url ?? "") === normalizeUrl(a.link))) continue;
    picked.push({
      category: a.category,
      title: a.title.slice(0, 80),
      body: (a.excerpt || a.title).slice(0, 200),
      emoji: a.emoji,
      source: a.source,
      source_url: a.link,
    });
  }

  return picked;
}

/** Fetch RSS feeds, summarize with Gemini, validate links. Exported for cron. */
export async function fetchAndSummarizeTrends(): Promise<{
  items: DailyTrendItem[];
  feedCount: number;
  source: "rss+ai" | "rss" | "fallback";
}> {
  const articles = await fetchNewsFromFeeds();

  if (articles.length === 0) {
    return { items: FALLBACK_TRENDS, feedCount: 0, source: "fallback" };
  }

  const summarized = await summarizeArticlesViaAI(articles);
  if (summarized.length >= 4) {
    return { items: summarized.slice(0, 6), feedCount: articles.length, source: "rss+ai" };
  }

  const direct = articlesToTrendItems(articles);
  if (direct.length >= 4) {
    return { items: direct.slice(0, 6), feedCount: articles.length, source: "rss" };
  }

  return { items: FALLBACK_TRENDS, feedCount: articles.length, source: "fallback" };
}

export async function cacheDailyTrends(
  date: string,
  items: DailyTrendItem[],
): Promise<void> {
  await supabaseAdmin
    .from("dashboard_daily_trends")
    .upsert([{ trend_date: date, items: items as unknown as never }], { onConflict: "trend_date" });
}

export const getDailyTrends = createServerFn({ method: "GET" }).handler(async () => {
  const date = todayISO();

  const { data: cached } = await supabaseAdmin
    .from("dashboard_daily_trends")
    .select("items")
    .eq("trend_date", date)
    .maybeSingle();

  if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
    return { date, items: cached.items as unknown as DailyTrendItem[] };
  }

  const { items } = await fetchAndSummarizeTrends();

  try {
    await cacheDailyTrends(date, items);
  } catch {
    // ignore cache failure
  }

  return { date, items };
});
