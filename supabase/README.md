# Supabase — So1o

โปรเจกต์ที่ใช้งาน: **`rvnzjiskqliexysicfmh`** (supabase-blue-park)

| ไฟล์ / โฟลเดอร์ | หน้าที่ |
|-----------------|--------|
| `config.toml` | project ref + ตั้งค่า Edge Functions |
| `migrations/` | schema ทั้งหมด (111 ไฟล์) — อย่าแก้ไฟล์เก่าที่รันแล้ว |
| `functions/` | Edge Functions (Gemini AI) |
| `manual/` | SQL bundle สำหรับ SQL Editor (fallback) |
| `SCHEMA.md` | แผนที่ตารางตาม business domain |
| `MIGRATE.md` | ประวัติการย้ายโปรเจกต์ |

## คำสั่งหลัก

```bash
# ติดตั้ง CLI (ครั้งแรก)
./scripts/install-supabase-cli.sh

export SUPABASE_ACCESS_TOKEN=<จาก Dashboard → Account → Access Tokens>

# Push migration ใหม่
./scripts/supabase-push-via-api.sh

# ตั้งค่า Auth redirect + deploy Edge Functions (ถ้ามี GEMINI_API_KEY)
./scripts/supabase-setup-project.sh

# สร้าง SQL bundle ใหม่ (หลังเพิ่ม migration)
./scripts/bundle-migrations-sql.sh
```

## Edge Functions

| Function | JWT | ใช้ทำอะไร |
|----------|-----|-----------|
| `ai-design-chat` | ปิด | แชทออกแบบ |
| `planner-ai-assist` | เปิด | ช่วย Planner |
| `ai-price-suggest` | เปิด | แนะนำราคา |
| `color-mentor` | เปิด | Color Lab |

Secrets ที่ต้องตั้งใน Dashboard → Edge Functions → Secrets:

- `GEMINI_API_KEY` (จำเป็น)
- `GEMINI_MODEL`, `GEMINI_MODEL_FAST` (optional)

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` ถูก inject อัตโนมัติเมื่อ deploy

## ตรวจในแอป

`/admin` → **Supabase** — Project Ref, latency, สถานะ migrations
