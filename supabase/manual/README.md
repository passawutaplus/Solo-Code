# Manual SQL bundles

ใช้เมื่อ CLI/API push ไม่ได้

| ไฟล์ | เมื่อไหร่ใช้ |
|------|-------------|
| `apply-all-migrations.sql` | โปรเจกต์ **ว่าง** — รัน schema ทั้งหมด (~111 migrations) |
| `apply-pending-202606.sql` | โปรเจกต์ที่มี schema เก่าแล้ว — เฉพาะ delta มิ.ย. 2026 |

สร้าง `apply-all-migrations.sql` ใหม่:

```bash
./scripts/bundle-migrations-sql.sh
```

วิธีรัน: [SQL Editor](https://supabase.com/dashboard/project/rvnzjiskqliexysicfmh/sql/new) → วางทั้งไฟล์ → Run
