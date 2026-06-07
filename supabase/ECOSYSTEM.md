# Unified Supabase — So1o + an1hem

โปรเจกต์เดียว: **`rvnzjiskqliexysicfmh`** (supabase-blue-park)

## Schema layout

| Schema | ใครใช้ | ตัวอย่างตาราง |
|--------|--------|----------------|
| `public` | ทั้งคู่ | `profiles` (key = `user_id`), `user_roles`, `subscriptions`, `user_credits` |
| `shared` | ทั้งคู่ | `wallets`, `contracts`, `conversations`, `messages`, `shared.notifications` |
| `anthem` | an1hem | `projects`, `studios`, `job_posts`, `follows`, `collections`, … |
| `so1o` | So1o | `notifications` (legacy), ตาราง back-office ย้ายมาทีละ phase |

## Migrations (ลำดับ)

1. `20260606120000_ecosystem_schemas.sql` — สร้าง schema
2. `20260606120100_profiles_unified_anthem_columns.sql` — รวมคอลัมน์ profile
3. `20260606120200_ecosystem_notifications.sql` — แยก So1o / ecosystem notifications
4. **`supabase/manual/apply-anthem-ecosystem.sql`** — ตาราง an1hem ทั้งชุด (รันครั้งเดียว)
5. `20260606140000_seed_anthem_catalog.sql` — seed ชุมชน demo (`anthem.*` + `profiles.user_id`)

สร้าง bundle ใหม่:

```bash
node scripts/bundle-anthem-for-unified.mjs
```

Push:

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
./scripts/supabase-push-via-api.sh
# แล้วรัน apply-anthem-ecosystem.sql ใน SQL Editor (ขนาดใหญ่)
# seed จะถูก push เป็น migration 20260606140000 (หลัง anthem tables มีแล้ว)
```

หรือ seed ผ่าน SQL / script (หลัง anthem tables):

```bash
# SQL Editor: scripts/ecosystem/seed-catalog.sql
# หรือ
cd Anthem-Code && node scripts/run-seed.mjs
```

## แอปฝั่ง client

- **So1o** — `db: { schema: 'public' }` (ค่าเริ่มต้น)
- **an1hem** — `Anthem-Code/src/integrations/supabase/db.ts` route ตารางอัตโนมัติ
- **profiles** — ใช้ `user_id` (= `auth.uid()`), ไม่ใช่ `id` แถวภายใน

## Edge Functions (an1hem)

อยู่ใน `Solo-Code/supabase/functions/`: `embed-project`, `similar-images`, `generate-contract`, `job-match-dispatch`, `sync-so1o-tier` (legacy)

Deploy:

```bash
supabase functions deploy embed-project similar-images generate-contract job-match-dispatch --project-ref rvnzjiskqliexysicfmh
supabase secrets set GEMINI_API_KEY=...
```

## โปรเจกต์เก่า

- So1o `jdqrrzaleapablabphmw` — ปิดแล้ว
- an1hem `uutbvwyoivqojozrangi` — ปิดหลังย้ายข้อมูล + ตัด env
