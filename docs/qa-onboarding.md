# QA Onboarding

ยินดีต้อนรับ! เอกสารนี้ช่วยให้คุณเริ่ม test ภายใน 30 นาที

## 1. Clone & install

```bash
git clone <repo>
cd <project>
bun install
```

ใช้ `bun` (≥ 1.1) — ไม่ใช่ npm/yarn (lockfile ไม่ match)

## 2. Environment

`.env` มี publishable Supabase config อยู่แล้ว — **ไม่ต้องแก้**

ถ้าจะ run Playwright E2E ต้อง:
```bash
cp .env.example .env.local   # ถ้ายังไม่มี ให้ดู template ใน docs
# กรอก:
E2E_USER_EMAIL=test+user@example.com
E2E_USER_PASSWORD=...
E2E_ADMIN_EMAIL=test+admin@example.com
E2E_ADMIN_PASSWORD=...
```

(ขอ credential ที่ owner — ดู `test-accounts.md`)

## 3. Run dev server

```bash
bun run dev
```

เปิด http://localhost:5173

## 4. Run tests

```bash
bun run test                # vitest (unit) — fast
bun run test:e2e            # playwright (E2E) — ต้องมี Playwright browsers ก่อน
```

ติดตั้ง Playwright browsers ครั้งแรก:
```bash
bunx playwright install --with-deps
```

## 5. Manual QA flow

1. อ่าน [`qa-checklist.md`](./qa-checklist.md) — ใช้เป็น checklist
2. อ่าน [`test-accounts.md`](./test-accounts.md) — เข้าใจแต่ละ role ควรเห็นอะไรได้บ้าง
3. เริ่ม smoke จากหน้า landing → signup → main user flows

## 6. Bug report template

ส่ง bug ผ่าน issue tracker (GitHub Issues หรือ Linear) ตาม template นี้:

```markdown
### Title
[Component] short description

### Severity
- [ ] Blocker (app unusable)
- [ ] Critical (core flow broken)
- [ ] Major (feature broken)
- [ ] Minor (cosmetic/edge case)

### Environment
- URL: https://...
- Browser: Chrome 120 / macOS 14
- Viewport: 1280×800
- Account: <role from test-accounts.md>

### Steps to reproduce
1. Go to ...
2. Click ...
3. Observe ...

### Expected
...

### Actual
... (+ screenshot/video)

### Console errors
```
... paste from DevTools console
```

### Network
ถ้าเกี่ยว API → paste failing request (URL, method, status, response body — masked secrets)
```

## 7. Useful tools

- **React DevTools** — component tree + props
- **Network panel** — filter by `supabase.co` to see RLS-enforced queries
- **Console filter** `[CSP]` — เก็บ CSP violation
- **Lighthouse** — performance + a11y smoke
- **axe DevTools** extension — accessibility audit

## 8. Cross-platform testing

So1o เป็น Universal PWA — ทดสอบบน:
- iOS Safari (real iPhone — DevTools simulator ไม่ครบ)
- Android Chrome
- macOS Safari (touch-emulation off)
- Windows Edge / Chrome

ใช้ BrowserStack / LambdaTest ถ้าไม่มีอุปกรณ์จริง

## 9. Reporting cadence

- Daily standup: 5 นาที — finding ใหม่ + blocker
- Weekly report: รวม finding + severity + status
- Critical finding: แจ้งทันทีใน Slack/Discord
