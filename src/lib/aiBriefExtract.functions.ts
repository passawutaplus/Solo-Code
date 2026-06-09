import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  defaultVisionModel,
  fetchUrlAsInlinePart,
  geminiChatWithParts,
} from "@/lib/geminiServer";
import { assertAiCreditsAvailable, debitAiCredits } from "@/lib/aiCreditsServer";

const FEATURE = "ai_brief_extract";

const InputSchema = z.object({
  imageUrls: z.array(z.string().url()).max(8).optional().default([]),
  noteText: z.string().max(8000).optional().default(""),
});

const SYSTEM_PROMPT = `คุณคือ Senior Account/Art Director ช่วยฟรีแลนซ์ไทยสรุปบรีฟงานออกแบบจาก:
- รูปอ้างอิง (อาจเป็นแคปหน้าจอแชท Line/Messenger, รูปโน๊ต, รูปไอเดีย ฯลฯ)
- ข้อความ Live Chat Note ที่ฟรีแลนซ์พิมพ์เก็บไว้

หน้าที่: แยกประเด็นออกเป็น 10 หมวด แล้วตอบเป็น JSON เท่านั้น
หากหมวดไหนไม่มีข้อมูลในรูป/ข้อความ ให้ตอบเป็น "" หรือ [] — **ห้ามมั่ว ห้ามเดา**

โครงสร้าง JSON (ตอบเฉพาะนี้ ไม่มีคำอธิบายเพิ่ม):
{
  "client": {
    "name": "ชื่อลูกค้า/คนคุย",
    "brand": "ชื่อร้าน/แบรนด์",
    "contact": "Line/เบอร์/อีเมล ถ้ามี"
  },
  "proposition": "โจทย์ของลูกค้า + pain point ที่กำลังเจอ (1-3 ประโยค)",
  "goal": "เป้าหมายของโปรเจกต์นี้ (ทำไปทำไม อยากได้อะไร)",
  "deliverables": [
    { "name": "ชื่อชิ้นงาน เช่น โลโก้", "quantity": 1, "formats": [".AI", ".PNG"] }
  ],
  "element_design": "สิ่งที่ลูกค้าให้มาใช้ออกแบบ เช่น โลโก้เดิม / ชื่อแบรนด์ / สี / ฟอนต์",
  "reference": "ลิงก์/ตัวอย่างงานที่ลูกค้าอ้างอิง หรือคีย์เวิร์ดให้ไปค้นต่อ",
  "style": "ชื่อสไตล์งาน เช่น Minimal, Y2K, Brutalist, Cute Pastel — เพื่อเอาไปหามูดบอร์ดต่อ",
  "timeline": {
    "start": "วันเริ่ม ถ้ามี (YYYY-MM-DD หรือคำพูด)",
    "deadline": "วันส่ง ถ้ามี"
  },
  "budget": "งบที่ลูกค้าให้ เช่น '5,000 บาท' หรือ 'ยังไม่ระบุ'",
  "note": "หมายเหตุสำคัญอื่น ๆ เช่น ข้อจำกัด, สิ่งที่ห้ามทำ, การชำระเงิน"
}

หลักการ:
- ใช้ภาษาไทยกระชับ ไม่ฟุ่มเฟือย
- ถ้าในแชทมีการต่อรองหรือมีหลายตัวเลือก ให้สรุปข้อสรุปสุดท้าย
- formats เลือกจาก: .AI .PSD .PNG .JPG .PDF .SVG .MP4 .GIF (ถ้าไม่ระบุ ใส่ [])
- deliverables[].quantity เป็นจำนวนเต็ม ถ้าไม่ระบุใส่ 1`;

export const aiBriefExtract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (data.imageUrls.length === 0 && !data.noteText.trim()) {
      throw new Error("ต้องมีรูปหรือข้อความอย่างน้อย 1 อย่าง");
    }

    await assertAiCreditsAvailable(userId, FEATURE);

    const intro = data.noteText.trim()
      ? `ข้อความ Live Chat Note จากฟรีแลนซ์:\n"""\n${data.noteText.trim()}\n"""\n\n`
      : "";
    const userParts = [
      {
        text: `${intro}กรุณาวิเคราะห์${data.imageUrls.length > 0 ? "รูปแนบและ" : ""}สรุปเป็น JSON ตาม schema ที่กำหนด`,
      },
      ...(await Promise.all(data.imageUrls.map((url) => fetchUrlAsInlinePart(url)))),
    ];

    const content = await geminiChatWithParts({
      model: defaultVisionModel(),
      systemInstruction: SYSTEM_PROMPT,
      userParts,
      json: true,
    });

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("AI ตอบกลับในรูปแบบไม่ถูกต้อง");
    }

    const quota = await debitAiCredits({
      userId,
      feature: FEATURE,
      idempotencyKey: crypto.randomUUID(),
    });
    if (!quota.allowed) throw new Error("limit_reached");

    const str = (v: unknown) => (typeof v === "string" ? v : "");
    const obj = (v: unknown): Record<string, unknown> =>
      v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
    const client = obj(parsed.client);
    const timeline = obj(parsed.timeline);
    const deliverables = Array.isArray(parsed.deliverables)
      ? parsed.deliverables
          .map((d) => {
            const o = obj(d);
            const formats = Array.isArray(o.formats)
              ? o.formats.filter((x): x is string => typeof x === "string")
              : [];
            const qRaw = o.quantity;
            const quantity =
              typeof qRaw === "number" ? Math.max(1, Math.round(qRaw))
              : typeof qRaw === "string" ? Math.max(1, parseInt(qRaw, 10) || 1)
              : 1;
            return { name: str(o.name), quantity, formats };
          })
          .filter((d) => d.name)
      : [];

    return {
      client: {
        name: str(client.name),
        brand: str(client.brand),
        contact: str(client.contact),
      },
      proposition: str(parsed.proposition),
      goal: str(parsed.goal),
      deliverables,
      element_design: str(parsed.element_design),
      reference: str(parsed.reference),
      style: str(parsed.style),
      timeline: {
        start: str(timeline.start),
        deadline: str(timeline.deadline),
      },
      budget: str(parsed.budget),
      note: str(parsed.note),
    };
  });

export type AiBriefExtractResult = Awaited<ReturnType<typeof aiBriefExtract>>;
