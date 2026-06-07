# So1o Supabase Schema — Domain Map

จัดกลุ่มตารางตาม Business Domain (อ้างอิง Pipeline Blueprint)

## งานลูกค้า (Client Work / Pipeline)

| ตาราง | บทบาท | ลิงก์หลัก |
|--------|--------|----------|
| `quotations` | ดีลหลัก — 1 card = 1 row | `brief_id` → smart_briefs |
| `job_trackers` | ส่งมอบ + สลิป | `quotation_id` → quotations |
| `job_slips` | สลิปรอตรวจ | `job_id` → job_trackers |
| `job_events` | Timeline งาน | `job_id` → job_trackers |
| `smart_briefs` | บรีฟลูกค้า | — |

**Pipeline ไม่มีตารางใหม่ (MVP)** — คอลัมน์ derive จาก `quotation.status` + `job.current_step` + `finance_incomes`

### Contract (Phase 1.5) — คอลัมน์บน `quotations`

- `contract_signed_at` — เวลายืนยันสัญญา
- `contract_accepted` — boolean
- `contract_signer_ip` — IP (optional)

## การเงิน & ภาษี

| ตาราง | บทบาท |
|--------|--------|
| `finance_incomes` | รายได้ (sync จาก quotation ที่ completed) |
| `finance_work_expenses` | ค่าใช้จ่ายงาน |
| `finance_personal_expenses` | ค่าใช้จ่ายส่วนตัว |
| `finance_subscriptions` | Subscription |

## Shared Squad (Phase 2 — feature-gated)

| ตาราง | บทบาท |
|--------|--------|
| `shared_projects` | โปรเจกต์ร่วม + guest link |
| `project_members` | สมาชิก + % หารรายได้ |
| `project_tasks` | Team kanban |

## Support

| ตาราง | บทบาท |
|--------|--------|
| `support_tickets` | Issue tracking MVP |
| `ticket_attachments` | ไฟล์แนบ |
| `ticket_events` | ประวัติ ticket |

## Migrations ล่าสุด (Pipeline)

```
20260604150000_support_tickets.sql
20260605100000_quotations_contract.sql
20260605110000_shared_projects_phase2.sql
20260605120000_pipeline_supabase_organization.sql
```

## Deploy

```bash
./scripts/install-supabase-cli.sh
export SUPABASE_ACCESS_TOKEN=<จาก Dashboard → Account → Access Tokens>
./scripts/supabase-push-pipeline.sh
```

ทางเลือก (ไม่ใช้ CLI): วาง `supabase/manual/apply-pending-202606.sql` ใน SQL Editor

## ตรวจในแอป

Mission Control → **Supabase** (`/admin` → เมนู Supabase) — แสดง Project Ref, สถานะเชื่อมต่อ, migrations ที่รันแล้วหรือยัง
