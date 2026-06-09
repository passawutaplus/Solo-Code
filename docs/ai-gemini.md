# AI — Google Gemini

So1o ใช้ **Google Gemini API โดยตรง** (ไม่ผ่าน Lovable AI Gateway แล้ว)

## Environment variables

| Variable | ที่ตั้ง | ค่าเริ่มต้น |
|----------|---------|-------------|
| `GEMINI_API_KEY` | Server (TanStack) + Supabase Edge secrets | — (required) |
| `GEMINI_MODEL_FAST` | optional | `gemini-2.5-flash-lite` |
| `GEMINI_MODEL` | optional | `gemini-2.5-flash` |
| `GEMINI_MODEL_VISION` | optional | `gemini-2.5-flash` |

สร้าง API key ที่ [Google AI Studio](https://aistudio.google.com/apikey)

## Supabase Edge Functions

ตั้ง secret บนโปรเจกต์ Supabase:

```bash
supabase secrets set GEMINI_API_KEY=your_key_here
# optional
supabase secrets set GEMINI_MODEL_FAST=gemini-2.5-flash-lite
```

Deploy functions:

```bash
supabase functions deploy ai-design-chat
supabase functions deploy ai-price-suggest
supabase functions deploy color-mentor
supabase functions deploy planner-ai-assist
```

## ฟีเจอร์ที่เรียก Gemini

| ฟีเจอร์ | ที่รัน |
|---------|--------|
| So1o Mentor chat (landing / FAB / creative partner) | `ai-design-chat` |
| Price Guide reasoning | `ai-price-suggest` |
| Color Lab | `color-mentor` |
| Content Planner captions/hashtags | `planner-ai-assist` |
| Brief extract / mood board | `aiBriefExtract`, `aiBriefFromImages` (server) |
| WHT 50ทวิ scan | `whtGeminiScan` (server) |
| Admin HQ agents / AI sandbox | `hq.functions`, `aiSandbox.functions` |
| Daily trends | `dailyTrends.functions` |

## Legacy model names

คอลัมน์ `hq_agents.model` อาจยังเก็บชื่อแบบ `google/gemini-3.1-flash-lite-preview` หรือ `gemini-2.0-*` — โค้ดจะ map เป็น `gemini-2.5-flash-lite` / `gemini-2.5-flash` อัตโนมัติผ่าน `normalizeGeminiModel()`.

## สิ่งที่ยังใช้ Lovable (ไม่ใช่ AI)

- Email (`/lovable/email/*`) — `LOVABLE_API_KEY`
- Stripe connector — `LOVABLE_API_KEY`
- Google Sheets connector — `LOVABLE_API_KEY`
