# SEO — ก่อน Deploy Production

Checklist สำหรับ `solofreelancer.com` (So1o Freelancer / My Desk)

## สถานะในโค้ด (อัตomatic)

| รายการ | สถานะ |
|--------|--------|
| `<html lang="th">` | ✅ `src/routes/__root.tsx` |
| Meta title / description หน้าหลัก | ✅ `/` + default ใน root |
| Open Graph + Twitter card | ✅ ทุกหน้าสาธารณะ + default `og:image` |
| JSON-LD (Organization, WebSite, SoftwareApplication) | ✅ root + landing |
| `robots.txt` | ✅ `/robots.txt` — block app/private routes |
| `sitemap.xml` | ✅ `/sitemap.xml` — เฉพาะหน้า index ได้ |
| Google Search Console verification | ✅ meta tag ใน root |
| `noindex` สำหรับ dashboard / admin / token pages | ✅ |
| PWA manifest + icons | ✅ `/manifest.json` |
| `llms.txt` | ✅ สำหรับ AI crawlers |

### หน้าที่อยู่ใน sitemap (index ได้)

- `/`, `/blog`, `/pricing`, `/creative-partner`
- `/privacy`, `/terms`, `/cookies`, `/refund`
- `/blog/{slug}` — จาก Supabase articles

### หน้าที่ **ไม่** index (robots + noindex)

- `/dashboard`, `/admin`, `/apply`, `/labs`, `/survey`
- `/auth`, `/auth/forgot`, `/reset-password`
- Token pages: `/brief/*`, `/track/*`, `/planner/*`, ฯลฯ

---

## Checklist ก่อน Deploy (ทำด้วยมือ)

### 1. DNS & HTTPS

- [ ] `solofreelancer.com` และ `www.solofreelancer.com` ชี้ VPS
- [ ] Deploy ด้วย HTTPS (`./scripts/deploy-ecosystem.sh --https`)
- [ ] Redirect `www` → non-www (หรือกลับกัน — **เลือกแบบเดียว** ให้ตรง canonical ในโค้ด: `https://solofreelancer.com`)

### 2. Environment

```bash
# Solo-Code/.env (production)
VITE_SITE_URL=https://solofreelancer.com
```

ใช้สำหรับ OAuth callback และ canonical URLs

### 3. หลัง Deploy — ตรวจ URL สำคัญ

```bash
curl -sI https://solofreelancer.com/ | head -5
curl -s https://solofreelancer.com/robots.txt
curl -s https://solofreelancer.com/sitemap.xml | head -30
```

- [ ] HTTP 200 ทุก URL
- [ ] `sitemap.xml` มีบทความ blog ล่าสุด (ถ้ามีใน DB)
- [ ] ไม่มี `/dashboard` หรือ `/admin` ใน sitemap

### 4. Google Search Console

- [ ] Property: `https://solofreelancer.com` (หรือ domain property)
- [ ] Verify ด้วย meta tag (มีใน root แล้ว) หรือ DNS
- [ ] Submit sitemap: `https://solofreelancer.com/sitemap.xml`
- [ ] ขอ index หน้า `/` และ `/pricing` ครั้งแรก (URL Inspection)

### 5. Social preview

ทดสอบแชร์ลิงก์:

- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] [Twitter Card Validator](https://cards-dev.twitter.com/validator) (หรือ X preview)
- [ ] หน้า `/`, `/pricing`, `/blog/{slug}` แสดงรูป + title + description ครบ

### 6. Performance (Core Web Vitals)

- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) หน้า landing
- [ ] LCP logo preload มีอยู่แล้วใน `/`
- [ ] รูป OG โหลดได้จาก URL ภายนอก (หรือย้ายมา host บน domain เราในอนาคต)

### 7. Supabase Auth URLs

Dashboard → Authentication → URL Configuration:

- Site URL: `https://solofreelancer.com`
- Redirect URLs: `https://solofreelancer.com/**`

---

## คำสั่ง health check ใน repo

```bash
cd Solo-Code
npm exec vitest run          # unit tests
npm run build                # production SSR build
npm run lint -- src/         # lint แอป (ไม่รวม supabase/functions)
```

---

## ปรับปรุงในอนาคต (optional)

- Host รูป OG บน `solofreelancer.com` แทน GCP external URL
- เพิ่ม `hreflang` ถ้ามีหน้าภาษาอังกฤษ
- Blog: ตรวจ `published_at` ก่อนใส่ sitemap (เฉพาะบทความ publish แล้ว)
- Structured data `FAQPage` ในหน้า pricing
