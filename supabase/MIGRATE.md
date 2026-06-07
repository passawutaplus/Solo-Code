# ย้ายโปรเจกต์ Supabase → rvnzjiskqliexysicfmh

โปรเจกต์ใหม่: **supabase-blue-park** (`rvnzjiskqliexysicfmh`)

## สิ่งที่ทำแล้ว

- [x] `supabase/config.toml` → `rvnzjiskqliexysicfmh`
- [x] `.env` → URL + anon key + service_role key ใหม่
- [x] CLI link โปรเจกต์ใหม่แล้ว
- [x] **Schema ทั้งหมด** — push ครบ 111 migrations แล้ว (ผ่าน `scripts/supabase-push-via-api.sh`)

## Push migrations ครั้งถัดไป

```bash
export SUPABASE_ACCESS_TOKEN=<token จาก Account → Access Tokens>
./scripts/supabase-push-via-api.sh
```

ทางเลือก (ต้องมี Database password): `./scripts/supabase-push-pipeline.sh`

หรือวาง `supabase/manual/apply-all-migrations.sql` ใน [SQL Editor](https://supabase.com/dashboard/project/rvnzjiskqliexysicfmh/sql/new)

## หลัง schema ขึ้นแล้ว

```bash
npm run dev
```

เช็ค: `/admin` → **Supabase** → migrations ควรเป็น **ขึ้นแล้ว**

## หมายเหตุ

- โปรเจกต์เก่า `jdqrrzaleapablabphmw` ไม่ใช้แล้ว
- Revoke access token ที่เคยแชร์ในแชท แล้วสร้างใหม่
