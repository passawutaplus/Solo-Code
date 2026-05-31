import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1).max(6),
  hint: z.string().max(500).optional().default(""),
});

const SYSTEM_PROMPT = `คุณคือ Senior Art Director ช่วยฟรีแลนซ์ไทยวิเคราะห์รูปอ้างอิง (mood board / inspiration)
แล้วสรุปออกมาเป็น JSON สำหรับเติมในบรีฟงานออกแบบ ตอบเป็น JSON เท่านั้น ห้ามมีคำอธิบายเพิ่ม

โครงสร้างที่ต้องการ:
{
  "project_type": "หนึ่งใน: โลโก้, Branding / CI, Social Media Post, เว็บไซต์, Packaging, Illustration, Motion / วิดีโอ, Print / สิ่งพิมพ์, อื่นๆ",
  "moods": ["Minimal", "Luxury", ...] // เลือก 2-4 จาก: Minimal, Luxury, Playful, Modern, Vintage, Bold, Elegant, Cute, Tech / Futuristic, Natural / Organic, Dark Mode, Pastel
  "liked_color_chips": ["#hex", ...], // 3-6 hex codes ของสีหลักที่เห็นจากรูป
  "liked_colors": "ภาษาไทย อธิบายสีโดยรวม เช่น 'โทนเอิร์ธโทน น้ำตาลอบอุ่น + ครีม'",
  "inspiration": "ภาษาไทย สรุป mood/style/composition ใน 1-2 ประโยค",
  "key_takeaways": "ภาษาไทย ประเด็นสำคัญที่ฟรีแลนซ์ควรรู้ก่อนเริ่มออกแบบ ใส่ - bullet ได้"
}`;

export const aiBriefFromImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: "text",
        text: `วิเคราะห์รูปอ้างอิงต่อไปนี้และสรุปเป็น JSON ตาม schema${data.hint ? `\nบริบทเพิ่มเติม: ${data.hint}` : ""}`,
      },
      ...data.imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("ใช้งานหนาแน่นเกินไป กรุณาลองใหม่อีกครั้ง");
      if (res.status === 402) throw new Error("เครดิต AI หมด กรุณาเติมที่ Lovable Cloud");
      throw new Error(`AI ไม่ตอบสนอง (${res.status}) ${txt.slice(0, 120)}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("AI ตอบกลับในรูปแบบไม่ถูกต้อง");
    }

    return {
      project_type: typeof parsed.project_type === "string" ? parsed.project_type : "",
      moods: Array.isArray(parsed.moods) ? parsed.moods.filter((x): x is string => typeof x === "string").slice(0, 6) : [],
      liked_color_chips: Array.isArray(parsed.liked_color_chips)
        ? parsed.liked_color_chips.filter((x): x is string => typeof x === "string" && /^#[0-9a-fA-F]{6}$/.test(x)).slice(0, 8)
        : [],
      liked_colors: typeof parsed.liked_colors === "string" ? parsed.liked_colors : "",
      inspiration: typeof parsed.inspiration === "string" ? parsed.inspiration : "",
      key_takeaways: typeof parsed.key_takeaways === "string" ? parsed.key_takeaways : "",
    };
  });
