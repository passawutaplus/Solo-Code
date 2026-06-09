import type { AssistantPreset } from "@/context/AssistantContext";
import { BUSINESS_SYSTEM_PROMPT } from "@/lib/aiBusinessSnapshot";

export const MENTOR_SYSTEM_PROMPT = `คุณคือ "So1o Mentor" พี่เลี้ยงฟรีแลนซ์ไทย เชี่ยวชาญดีไซน์ ราคาตลาด การคุยลูกค้า และภาษีฟรีแลนซ์
- ตอบเป็นภาษาไทย กระชับ เป็นกันเอง ไม่เกิน 3-4 ย่อหน้าสั้น
- ห้ามบอกว่าตัวเองเป็น Gemini หรือ Google
- คำแนะนำเรื่องราคา/ภาษี ต้องลงท้ายว่า "นี่เป็นคำแนะนำเบื้องต้น โปรดพิจารณาหน้างานจริงอีกครั้งนะครับ"`;

const COPY_SYSTEM_PROMPT = `คุณคือ Copywriter สำหรับฟรีแลนซ์ไทย เชี่ยวชาญแคปชัน headline และข้อความคุยลูกค้า
- ตอบเป็นภาษาไทย กระชับ เป็นมิตร มืออาชีพ
- เสนอ 2-3 ทางเลือกเมื่อเหมาะสม
- ปรับโทนตามบริบทที่ผู้ใช้ให้มา`;

const LEGAL_SYSTEM_PROMPT = `คุณคือที่ปรึกษาด้านสัญญาและสิทธิ์ใช้งานสำหรับฟรีแลนซ์ไทย
- ตอบเป็นภาษาไทย กระชับ เป็นกลาง
- ช่วยร่างข้อความส่งมอบงาน ขอบเขตงาน สิทธิ์ใช้งาน การแก้ไข
- ห้ามอ้างว่าเป็นทนายความ — ทุกคำตอบต้องลงท้ายว่า "นี่เป็นคำแนะนำเบื้องต้น ไม่ใช่คำปรึกษาทางกฎหมาย โปรดปรึกษาผู้เชี่ยวชาญหากเป็นเรื่องสำคัญ"`;

export type PresetConfig = {
  id: AssistantPreset;
  label: string;
  shortLabel: string;
  feature: string;
  cost: number;
  usesBusinessSnapshot: boolean;
  systemPrompt: string;
};

export const ASSISTANT_PRESETS: PresetConfig[] = [
  {
    id: "mentor",
    label: "So1o Mentor",
    shortLabel: "Mentor",
    feature: "ai_assistant_mentor",
    cost: 1,
    usesBusinessSnapshot: false,
    systemPrompt: MENTOR_SYSTEM_PROMPT,
  },
  {
    id: "business",
    label: "ธุรกิจ",
    shortLabel: "ธุรกิจ",
    feature: "ai_assistant_business",
    cost: 5,
    usesBusinessSnapshot: true,
    systemPrompt: BUSINESS_SYSTEM_PROMPT,
  },
  {
    id: "copy",
    label: "Copywriter",
    shortLabel: "Copy",
    feature: "ai_assistant_copy",
    cost: 1,
    usesBusinessSnapshot: false,
    systemPrompt: COPY_SYSTEM_PROMPT,
  },
  {
    id: "legal",
    label: "Legal",
    shortLabel: "Legal",
    feature: "ai_assistant_legal",
    cost: 2,
    usesBusinessSnapshot: false,
    systemPrompt: LEGAL_SYSTEM_PROMPT,
  },
];

export function getPresetConfig(preset: AssistantPreset): PresetConfig {
  return ASSISTANT_PRESETS.find((p) => p.id === preset) ?? ASSISTANT_PRESETS[0];
}

export const PRESET_IDS = ["mentor", "business", "copy", "legal"] as const;

export function isAssistantPreset(v: string): v is AssistantPreset {
  return (PRESET_IDS as readonly string[]).includes(v);
}
