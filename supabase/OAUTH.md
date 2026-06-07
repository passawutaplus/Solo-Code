# Google Sign-In (unified project)

โปรเจกต์เดียว `rvnzjiskqliexysicfmh` — เปิด Google provider ครั้งเดียว ใช้ได้ทั้ง So1o และ an1hem

> Apple Sign-In ยังไม่เปิดใช้งาน (ปิดไว้ชั่วคราว)

## 1. Supabase Dashboard → Authentication → Providers → Google

1. สร้าง OAuth Client ใน [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **Authorized redirect URI** (สำคัญ):
   ```
   https://rvnzjiskqliexysicfmh.supabase.co/auth/v1/callback
   ```
3. ใส่ **Client ID** + **Client Secret** ใน Supabase → Save

## 2. Redirect URLs (Auth → URL Configuration)

รัน:

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
./scripts/supabase-setup-project.sh
```

หรือเพิ่มเอง:
- `https://solofreelancer.com/auth/callback`
- `https://www.solofreelancer.com/auth/callback`
- `https://an1hem.app/auth/callback`
- `http://localhost:3000/auth/callback` (So1o dev)
- `http://localhost:8081/auth/callback` (an1hem dev)

## 3. App flow

1. กด "เข้าสู่ระบบด้วย Google" → redirect ไป Google
2. Supabase callback → `/auth/callback` ของแต่ละแอป
3. PKCE + `detectSessionInUrl` สร้าง session
4. กลับหน้าเดิมที่เก็บใน `sessionStorage`

## 4. Production env

```bash
# Solo-Code .env
VITE_SITE_URL=https://www.solofreelancer.com

# Anthem-Code .env
VITE_SITE_URL=https://an1hem.app
```
