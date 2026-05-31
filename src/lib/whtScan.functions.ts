import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  fileUrl: z.string().url(),
  mimeType: z.string().min(1).max(100),
});

const SYSTEM_PROMPT = `คุณคือ AI ที่อ่านข้อมูลจาก "หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ)" ของกรมสรรพากร ประเทศไทย
แกะข้อมูลจากเอกสาร (PDF ดิจิทัล/สแกน/ถ่ายรูป) แล้วเรียก tool extract_wht_data เพียงครั้งเดียวเท่านั้น

กฎสำคัญ:
1. PDF มาตรฐานมักมี 4 ฉบับซ้ำเนื้อหากัน (ฉบับที่ 1–4) — อ่านจากฉบับที่ 1 (หน้าแรก) เป็นหลัก ใช้หน้าอื่นเสริมเฉพาะตอนหน้าแรกไม่ชัด
2. แปลงวันที่เป็น ค.ศ. รูปแบบ YYYY-MM-DD เสมอ:
   - ปี พ.ศ. → ค.ศ. (ลบ 543) เช่น 2569 → 2026
   - เดือนย่อไทย: ม.ค.=01, ก.พ.=02, มี.ค.=03, เม.ย.=04, พ.ค.=05, มิ.ย.=06, ก.ค.=07, ส.ค.=08, ก.ย.=09, ต.ค.=10, พ.ย.=11, ธ.ค.=12
   - ตัวอย่าง "31 / ม.ค. / 2569" → "2026-01-31"
3. "เลขที่" ของใบ (certificateNo) เป็น alphanumeric ได้ เช่น "WTI-20260100009" — เก็บตามที่ปรากฏ ห้ามแปลง
4. ตารางประเภทเงินได้มี 6 แถวมาตรฐาน — เลือกแถวที่ "มีจำนวนเงิน > 0" เป็นประเภทหลัก:
   - แถว 1 = ม.40(1) เงินเดือน/ค่าจ้าง  → incomeSection "40_1"
   - แถว 2 = ม.40(2) ค่าธรรมเนียม/นายหน้า/รับจ้างทำของ → "40_2"
   - แถว 3 = ม.40(3) ค่าลิขสิทธิ์ → "40_3"
   - แถว 4 = ม.40(4) ดอกเบี้ย/เงินปันผล → "40_4"
   - แถว 5 = ม.3 เตรส (ค่าโฆษณา/ค่าเช่า/ค่าบริการ/ค่าจ้างทำของฯลฯ) → "40_8" (ใช้รหัสนี้สำหรับ 3 เตรส)
   - แถว 6 = อื่น ๆ → "40_8"
5. grossAmount และ whtAmount เป็น number บาท (ไม่มี comma) — ใช้แถว "รวมเงินที่จ่ายและภาษีที่นำส่ง" ตรวจซ้ำได้
6. whtRate (เปอร์เซ็นต์) มักไม่ได้พิมพ์ในใบ — ถ้าไม่ปรากฏ ให้คำนวณ round((whtAmount/grossAmount)*100, 2) แล้ว snap เป็นค่ามาตรฐาน 0.5, 1, 1.5, 2, 3, 5, 10, 15
7. ฟอร์มที่ยื่น (formType): ดูเครื่องหมาย ☑ ที่ "ลำดับที่ ... ในแบบ" เลือกค่าใดค่าหนึ่ง: pnd1a, pnd1a_special, pnd2, pnd3, pnd2a, pnd3a, pnd53 หรือ "" ถ้าไม่ชัด
8. payerCondition: ดู ☑ ที่ "ผู้จ่ายเงิน" — withhold (หัก ณ ที่จ่าย), pay_always (ออกให้ตลอดเวลา), pay_once (ออกให้ครั้งเดียว), other
9. ถ้าอ่านช่องใดไม่ได้ ให้คืนค่าว่าง/0 และระบุ confidence ต่ำลง
10. confidence 0–1 — ถ้า grossAmount หรือ whtAmount เป็น 0 ทั้งที่ในใบมีตัวเลขชัด ให้ < 0.5`;

const tool = {
  type: "function",
  function: {
    name: "extract_wht_data",
    description: "Return extracted 50 ทวิ certificate fields.",
    parameters: {
      type: "object",
      properties: {
        payerName: { type: "string", description: "ชื่อผู้จ่ายเงิน/บริษัท (ผู้มีหน้าที่หักภาษี)" },
        payerTaxId: { type: "string", description: "เลขประจำตัวผู้เสียภาษีของผู้จ่าย 13 หลัก (ไม่มีขีด)" },
        payeeName: { type: "string", description: "ชื่อผู้ถูกหักภาษี ณ ที่จ่าย" },
        payeeTaxId: { type: "string", description: "เลขประจำตัวผู้เสียภาษีของผู้ถูกหัก 13 หลัก (ไม่มีขีด)" },
        certificateNo: { type: "string", description: 'เลขที่ใบ 50 ทวิ ตามที่ปรากฏ alphanumeric ได้ เช่น "WTI-20260100009"' },
        issueDate: { type: "string", description: "วันที่ออก ค.ศ. รูปแบบ YYYY-MM-DD" },
        incomeSection: {
          type: "string",
          enum: ["40_1", "40_2", "40_3", "40_4", "40_5", "40_6", "40_7", "40_8", ""],
        },
        grossAmount: { type: "number", description: "ยอดเงินที่จ่าย (บาท, ไม่มี comma)" },
        whtRate: { type: "number", description: "เปอร์เซ็นต์หัก ณ ที่จ่าย เช่น 3" },
        whtAmount: { type: "number", description: "ภาษีที่หักและนำส่งไว้ (บาท)" },
        formType: {
          type: "string",
          enum: ["pnd1a", "pnd1a_special", "pnd2", "pnd3", "pnd2a", "pnd3a", "pnd53", ""],
          description: "ฟอร์มที่ยื่น (จากช่องที่ติ๊กในใบ)",
        },
        payerCondition: {
          type: "string",
          enum: ["withhold", "pay_always", "pay_once", "other", ""],
          description: "เงื่อนไขผู้จ่าย",
        },
        confidence: { type: "number", description: "0-1 ความมั่นใจรวม" },
        notes: { type: "string", description: "หมายเหตุที่ AI สังเกตเห็น เช่น ภาพไม่ชัด/มีหลายฉบับ" },
      },
      required: ["payerName", "grossAmount", "whtAmount", "confidence"],
      additionalProperties: false,
    },
  },
} as const;

export const scanWhtCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const userContent = [
      {
        type: "text",
        text: "อ่านใบ 50 ทวิ นี้ตามกฎทุกข้อ แล้วเรียก tool extract_wht_data หนึ่งครั้ง",
      },
      { type: "image_url", image_url: { url: data.fileUrl } },
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
        tools: [tool],
        tool_choice: { type: "function", function: { name: "extract_wht_data" } },
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("ใช้งานหนาแน่นเกินไป กรุณาลองใหม่อีกครั้ง");
      if (res.status === 402) throw new Error("เครดิต AI หมด กรุณาเติมที่ Lovable Cloud");
      throw new Error(`AI ไม่ตอบสนอง (${res.status}) ${txt.slice(0, 120)}`);
    }

    const json = await res.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      throw new Error("AI ไม่สามารถอ่านข้อมูลจากเอกสารได้ ลองใช้รูปที่ชัดขึ้น");
    }
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(call.function.arguments);
    } catch {
      throw new Error("AI ตอบกลับในรูปแบบไม่ถูกต้อง");
    }

    const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const digits = (v: unknown) => str(v).replace(/\D/g, "");

    const grossAmount = num(parsed.grossAmount);
    const whtAmount = num(parsed.whtAmount);
    let whtRate = num(parsed.whtRate);
    if (!whtRate && grossAmount > 0 && whtAmount > 0) {
      const raw = (whtAmount / grossAmount) * 100;
      const presets = [0.5, 1, 1.5, 2, 3, 5, 10, 15];
      whtRate = presets.reduce((best, p) =>
        Math.abs(p - raw) < Math.abs(best - raw) ? p : best, presets[0]);
    }

    return {
      payerName: str(parsed.payerName),
      payerTaxId: digits(parsed.payerTaxId),
      payeeName: str(parsed.payeeName),
      payeeTaxId: digits(parsed.payeeTaxId),
      certificateNo: str(parsed.certificateNo),
      issueDate: str(parsed.issueDate),
      incomeSection: str(parsed.incomeSection),
      grossAmount,
      whtRate,
      whtAmount,
      formType: str(parsed.formType),
      payerCondition: str(parsed.payerCondition),
      confidence: Math.max(0, Math.min(1, num(parsed.confidence))),
      notes: str(parsed.notes),
    };
  });

export type WhtScanResult = Awaited<ReturnType<typeof scanWhtCertificate>>;
