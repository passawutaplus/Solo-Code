import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function generateTrendsViaAI(): Promise<DailyTrendItem[]> {
  if (!process.env.GEMINI_API_KEY) return FALLBACK_TRENDS;

  const dateStr = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  const systemPrompt = `คุณคือ Senior Art Director ที่อัปเดตเทรนด์ design/branding/AI tools รายวันสำหรับฟรีแลนซ์ไทย
ตอบเป็น JSON array 6 รายการ แต่ละรายการมี keys: category, title, body, emoji, source, source_url
- category: หมวด เช่น "สีเทรนด์", "Typography", "AI Tools", "Design Style", "Motion", "Workflow", "Branding"
- title: หัวข้อสั้น ไม่เกิน 60 ตัวอักษร (ภาษาไทยผสมอังกฤษได้)
- body: คำอธิบายสั้น 1-2 ประโยค ไม่เกิน 140 ตัวอักษร เน้นใช้งานจริงสำหรับฟรีแลนซ์
- emoji: 1 ตัว
- source: ชื่อเว็บอ้างอิง เช่น "Pantone", "Awwwards", "Figma Blog"
- source_url: URL จริงให้คนไปอ่านต่อ
ห้ามใส่ markdown หรือ \`\`\` ตอบเฉพาะ JSON array บริสุทธิ์`;

  const userPrompt = `วันที่ ${dateStr} — ขอเทรนด์ design/AI tools ล่าสุดที่ฟรีแลนซ์ไทยควรรู้วันนี้ 6 หัวข้อ`;

  try {
    const { geminiChat, defaultModel } = await import("@/lib/geminiServer");
    const { text } = await geminiChat({
      model: defaultModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      maxOutputTokens: 2048,
    });
    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    if (!cleaned) return FALLBACK_TRENDS;
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start < 0 || end < 0) return FALLBACK_TRENDS;
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(parsed) || parsed.length === 0) return FALLBACK_TRENDS;
    return parsed.slice(0, 8).map((it: Record<string, unknown>) => ({
      category: String(it.category ?? "Design"),
      title: String(it.title ?? "").slice(0, 80),
      body: String(it.body ?? "").slice(0, 200),
      emoji: String(it.emoji ?? "✨").slice(0, 4),
      source: it.source ? String(it.source) : undefined,
      source_url: it.source_url ? String(it.source_url) : undefined,
    }));
  } catch {
    return FALLBACK_TRENDS;
  }
}

export const getDailyTrends = createServerFn({ method: "GET" }).handler(async () => {
  const date = todayISO();

  // Try cache first
  const { data: cached } = await supabaseAdmin
    .from("dashboard_daily_trends")
    .select("items")
    .eq("trend_date", date)
    .maybeSingle();

  if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
    return { date, items: cached.items as unknown as DailyTrendItem[] };
  }

  // Generate fresh
  const items = await generateTrendsViaAI();

  // Cache (best-effort)
  try {
    await supabaseAdmin
      .from("dashboard_daily_trends")
      .upsert([{ trend_date: date, items: items as unknown as never }], { onConflict: "trend_date" });
  } catch {
    // ignore cache failure
  }

  return { date, items };
});
