import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateWhtThaiText, warnMissingThaiText } from "@/lib/thaiBahtText";
import {
  assertWhtStoragePath,
  prepareScanBytes,
  toVisionDataUrl,
  whtStorageBucket,
} from "@/lib/whtScanAsset";
import { parseThaiDate } from "@/lib/thaiDate";

const InputSchema = z.object({
  storagePath: z.string().min(3).max(512),
  mimeType: z.string().min(1).max(100),
});

const SYSTEM_PROMPT = `คุณคือ AI ที่อ่านข้อมูลจาก "หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ)" ของกรมสรรพากร ประเทศไทย
แกะข้อมูลจากเอกสาร (PDF ดิจิทัล/สแกน/ถ่ายรูป) แล้วเรียก tool extract_wht_data เพียงครั้งเดียวเท่านั้น

โครงสร้างเอกสารมาตรฐาน — อ่านตามลำดับและ map อย่างเคร่งครัด:

1) ผู้มีหน้าที่หักภาษี (Payer / ผู้จ่ายเงิน) — บล็อกด้านบนซ้ายของใบ
   - payerTaxId: เลขประจำตัวผู้เสียภาษี 13 หลัก (อาจมีขีด เช่น 0-1055-64055-49-6) → คืนเฉพาะตัวเลข 13 หลัก
   - payerName: ชื่อนิติบุคคล/บุคคล (เช่น บริษัท ดับบลิวพี เทรดดิ้ง อินเตอร์กรุ๊ป จำกัด)

2) ผู้ถูกหักภาษี ณ ที่จ่าย (Payee) — บล็อกด้านบนขวา
   - payeeTaxId: เลขประจำตัวผู้เสียภาษี 13 หลัก (เช่น 1-1022-00155-22-8) → คืนเฉพาะตัวเลข
   - payeeName: ชื่อ (เช่น นาย ภาสวุฒิ แซ่ล้อ)

3) ตารางเงินได้ (Income Table) — มี 6 แถวมาตรฐาน
   - มองหาแถวที่มีตัวเลข "จำนวนเงินที่จ่าย" และ "ภาษีที่หัก" > 0
   - แถว 2 (ลำดับ 2): ค่าธรรมเนียม ค่านายหน้า → incomeTableRow=2, incomeSection="40_2"
   - แถว 5 (ลำดับ 5): ค่าจ้างทำของ/ค่าบริการ (ม.3 เตรส) → incomeTableRow=5, incomeSection="40_8"
   - แถวอื่น map ตาม: 1→40_1, 3→40_3, 4→40_4, 6→40_8
   - grossAmount: คอลัมน์ "จำนวนเงินที่จ่าย" ของแถวที่มีข้อมูล (เช่น 20000.00) → number ไม่มี comma
   - whtAmount: คอลัมน์ "ภาษีที่หักและนำส่งไว้" ของแถวเดียวกัน (เช่น 600.00)
   - ตรวจซ้ำกับแถว "รวมเงินที่จ่ายและภาษีที่นำส่ง" ด้านล่างตาราง

4) ข้อความจำนวนเงินภาษาไทย (สำคัญมาก — ใช้ตรวจสอบความถูกต้อง)
   - whtAmountTextThai: ข้อความภาษาไทยของ "ภาษีที่หักและนำส่งไว้" ตามที่พิมพ์ในใบ (เช่น "หกร้อยบาทถ้วน")
   - grossAmountTextThai: ข้อความภาษาไทยของ "จำนวนเงินที่จ่าย" ถ้ามี (เช่น "สองหมื่นบาทถ้วน")
   - คัดลอกข้อความให้ตรงกับใบ ห้ามแปลงหรือย่อ

5) วันที่ออก (Date of Issue) — ด้านล่างของใบ
   - issueDate: แปลงเป็น ค.ศ. YYYY-MM-DD เสมอ
   - ปี พ.ศ. → ค.ศ. (ลบ 543) เช่น 2569 → 2026
   - เดือนย่อไทย: ม.ค.=01, ก.พ.=02, มี.ค.=03, เม.ย.=04, พ.ค.=05, มิ.ย.=06, ก.ค.=07, ส.ค.=08, ก.ย.=09, ต.ค.=10, พ.ย.=11, ธ.ค.=12
   - ตัวอย่าง "31 / ม.ค. / 2569" → "2026-01-31"

6) ฟิลด์เสริม
   - certificateNo: เลขที่ใบ alphanumeric ได้ เช่น "WTI-20260100009" — เก็บตามที่ปรากฏ
   - whtRate: เปอร์เซ็นต์หัก ณ ที่จ่าย — ถ้าไม่พิมพ์ ให้คำนวณจาก whtAmount/grossAmount แล้ว snap เป็น 0.5, 1, 1.5, 2, 3, 5, 10, 15
   - formType: ดู ☑ "ลำดับที่ ... ในแบบ" → pnd1a, pnd1a_special, pnd2, pnd3, pnd2a, pnd3a, pnd53 หรือ ""
   - payerCondition: ☑ ผู้จ่ายเงิน → withhold, pay_always, pay_once, other

กฎทั่วไป:
- PDF มาตรฐานมักมี 4 ฉบับซ้ำ (ฉบับ 1–4) — อ่านจากฉบับที่ 1 (หน้าแรก) เท่านั้น
- ถ้าอ่านช่องใดไม่ได้ ให้คืนค่าว่าง/0 และลด confidence
- confidence 0–1 — ถ้า grossAmount หรือ whtAmount เป็น 0 ทั้งที่ในใบมีตัวเลขชัด ให้ < 0.5
- whtAmountTextThai ต้องอ่านให้ได้เสมอถ้าข้อความปรากฏในใบ`;

const tool = {
  type: "function",
  function: {
    name: "extract_wht_data",
    description: "Return extracted 50 ทวิ certificate fields per strict Thai RD schema.",
    parameters: {
      type: "object",
      properties: {
        payerName: { type: "string", description: "ชื่อผู้มีหน้าที่หักภาษี / ผู้จ่ายเงิน" },
        payerTaxId: { type: "string", description: "เลขผู้เสียภาษีผู้จ่าย 13 หลัก (ไม่มีขีด)" },
        payeeName: { type: "string", description: "ชื่อผู้ถูกหักภาษี ณ ที่จ่าย" },
        payeeTaxId: { type: "string", description: "เลขผู้เสียภาษีผู้ถูกหัก 13 หลัก (ไม่มีขีด)" },
        certificateNo: { type: "string", description: 'เลขที่ใบ 50 ทวิ เช่น "WTI-20260100009"' },
        issueDate: { type: "string", description: "วันที่ออก ค.ศ. YYYY-MM-DD" },
        incomeTableRow: {
          type: "integer",
          description: "ลำดับแถวในตารางเงินได้ที่มีข้อมูล (1–6) เช่น 2 หรือ 5",
        },
        incomeSection: {
          type: "string",
          enum: ["40_1", "40_2", "40_3", "40_4", "40_5", "40_6", "40_7", "40_8", ""],
        },
        grossAmount: { type: "number", description: "จำนวนเงินที่จ่าย (บาท, ไม่มี comma)" },
        grossAmountTextThai: { type: "string", description: "ข้อความภาษาไทยของจำนวนเงินที่จ่าย เช่น สองหมื่นบาทถ้วน" },
        whtRate: { type: "number", description: "เปอร์เซ็นต์หัก ณ ที่จ่าย เช่น 3" },
        whtAmount: { type: "number", description: "ภาษีที่หักและนำส่งไว้ (บาท)" },
        whtAmountTextThai: {
          type: "string",
          description: 'ข้อความภาษาไทยของภาษีที่หัก เช่น "หกร้อยบาทถ้วน" — ต้องตรงกับตัวเลข',
        },
        formType: {
          type: "string",
          enum: ["pnd1a", "pnd1a_special", "pnd2", "pnd3", "pnd2a", "pnd3a", "pnd53", ""],
        },
        payerCondition: {
          type: "string",
          enum: ["withhold", "pay_always", "pay_once", "other", ""],
        },
        confidence: { type: "number", description: "0-1 ความมั่นใจรวม" },
        notes: { type: "string", description: "หมายเหตุ เช่น ภาพไม่ชัด/มีหลายฉบับ" },
      },
      required: [
        "payerName",
        "payerTaxId",
        "payeeName",
        "payeeTaxId",
        "grossAmount",
        "whtAmount",
        "whtAmountTextThai",
        "confidence",
      ],
      additionalProperties: false,
    },
  },
} as const;

const INCOME_ROW_TO_SECTION: Record<number, string> = {
  1: "40_1",
  2: "40_2",
  3: "40_3",
  4: "40_4",
  5: "40_8",
  6: "40_8",
};

function mapIncomeSection(row: number, aiSection: string): string {
  if (row >= 1 && row <= 6) return INCOME_ROW_TO_SECTION[row] ?? aiSection;
  return aiSection;
}

function validateTaxId(label: string, id: string): string | null {
  if (!id) return `${label}: ไม่พบเลขผู้เสียภาษี 13 หลัก`;
  if (id.length !== 13) return `${label}: เลขผู้เสียภาษีต้องมี 13 หลัก (พบ ${id.length} หลัก)`;
  return null;
}

function taxIdDigits(v: unknown): string {
  const raw = typeof v === "string" ? v.trim().replace(/\D/g, "") : "";
  return raw.slice(0, 13);
}

export const scanWhtCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { userId, supabase } = context;
    assertWhtStoragePath(data.storagePath, userId);

    const { data: blob, error: dlErr } = await supabase.storage
      .from(whtStorageBucket())
      .download(data.storagePath);
    if (dlErr || !blob) {
      throw new Error("ไม่สามารถโหลดไฟล์จาก storage ได้");
    }

    const rawBytes = new Uint8Array(await blob.arrayBuffer());
    const { bytes, mimeType } = await prepareScanBytes(rawBytes, data.mimeType);
    const dataUrl = toVisionDataUrl(bytes, mimeType);

    const userContent = [
      {
        type: "text",
        text: "อ่านใบ 50 ทวิ ฉบับที่ 1 (หน้าแรก) ตาม schema อย่างเคร่งครัด แล้วเรียก tool extract_wht_data หนึ่งครั้ง — ต้องอ่าน whtAmountTextThai จากข้อความภาษาไทยในใบด้วย",
      },
      { type: "image_url", image_url: { url: dataUrl } },
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

    const grossAmount = num(parsed.grossAmount);
    const whtAmount = num(parsed.whtAmount);
    const whtAmountTextThai = str(parsed.whtAmountTextThai);
    const grossAmountTextThai = str(parsed.grossAmountTextThai);
    const incomeTableRow = num(parsed.incomeTableRow);

    let whtRate = num(parsed.whtRate);
    if (!whtRate && grossAmount > 0 && whtAmount > 0) {
      const raw = (whtAmount / grossAmount) * 100;
      const presets = [0.5, 1, 1.5, 2, 3, 5, 10, 15];
      whtRate = presets.reduce((best, p) =>
        Math.abs(p - raw) < Math.abs(best - raw) ? p : best, presets[0]);
    }

    const payerTaxId = taxIdDigits(parsed.payerTaxId);
    const payeeTaxId = taxIdDigits(parsed.payeeTaxId);
    const incomeSection = mapIncomeSection(incomeTableRow, str(parsed.incomeSection));
    const issueDateRaw = str(parsed.issueDate);
    const issueDate = parseThaiDate(issueDateRaw) || issueDateRaw;

    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    const thaiWhtMismatch = validateWhtThaiText(whtAmount, whtAmountTextThai);
    if (thaiWhtMismatch) validationErrors.push(thaiWhtMismatch);

    const thaiWhtMissing = warnMissingThaiText(whtAmount, whtAmountTextThai);
    if (thaiWhtMissing) validationWarnings.push(thaiWhtMissing);

    if (grossAmountTextThai && grossAmount > 0) {
      const thaiGrossErr = validateWhtThaiText(grossAmount, grossAmountTextThai);
      if (thaiGrossErr) validationErrors.push(`จำนวนเงินที่จ่าย: ${thaiGrossErr}`);
    }

    const payerTaxErr = validateTaxId("ผู้จ่ายเงิน", payerTaxId);
    if (payerTaxErr) validationWarnings.push(payerTaxErr);

    const payeeTaxErr = validateTaxId("ผู้ถูกหักภาษี", payeeTaxId);
    if (payeeTaxErr) validationWarnings.push(payeeTaxErr);

    if (grossAmount <= 0) validationWarnings.push("ไม่พบยอดจำนวนเงินที่จ่าย — กรุณากรอกเอง");
    if (whtAmount <= 0) validationWarnings.push("ไม่พบยอดภาษีที่หัก — กรุณากรอกเอง");

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(" · "));
    }

    let confidence = Math.max(0, Math.min(1, num(parsed.confidence)));
    if (validationWarnings.length > 0) {
      confidence = Math.min(confidence, 0.6);
    }

    return {
      payerName: str(parsed.payerName),
      payerTaxId,
      payeeName: str(parsed.payeeName),
      payeeTaxId,
      certificateNo: str(parsed.certificateNo),
      issueDate,
      incomeTableRow,
      incomeSection,
      grossAmount,
      grossAmountTextThai,
      whtRate,
      whtAmount,
      whtAmountTextThai,
      formType: str(parsed.formType),
      payerCondition: str(parsed.payerCondition),
      confidence,
      notes: [str(parsed.notes), ...validationWarnings].filter(Boolean).join(" · "),
      validationWarnings,
    };
  });

export type WhtScanResult = Awaited<ReturnType<typeof scanWhtCertificate>>;
