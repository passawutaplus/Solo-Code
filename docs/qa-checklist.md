# QA Checklist

ใช้ checklist นี้ก่อน release ทุกครั้ง

## Browsers / OS

- [ ] Chrome (Win + macOS)
- [ ] Safari (macOS + iOS)
- [ ] Firefox
- [ ] Edge
- [ ] Android Chrome

## Viewports

- [ ] 375×667 (iPhone SE)
- [ ] 390×844 (iPhone 14)
- [ ] 768×1024 (iPad)
- [ ] 1280×800 (laptop)
- [ ] 1920×1080 (desktop)

## Universal cross-platform (PWA)

- [ ] Touch targets ≥ 44×44
- [ ] Important actions visible without hover (touch devices ไม่มี hover)
- [ ] `env(safe-area-inset-*)` ทำงานบน iPhone notch / Dynamic Island
- [ ] Keyboard shortcuts ใช้ได้ทั้ง `metaKey` (mac) และ `ctrlKey` (win)
- [ ] Dark mode + Light mode (system + manual toggle)
- [ ] Glassmorphism ดูถูกบน Safari (`-webkit-backdrop-filter` pair)
- [ ] Icons คม (SVG) บนทุก DPR

## Auth states (ทุกหน้า)

- [ ] Guest (logged out) — redirect ไป `/auth` หรือเห็น public content
- [ ] Unverified email — เห็น apply gate
- [ ] Logged in (tester approved) — เห็น dashboard เต็ม
- [ ] Admin — เห็น admin panel
- [ ] Session expired ระหว่างใช้งาน — graceful re-auth

## States per screen

- [ ] Loading state (skeleton or spinner)
- [ ] Empty state (ภาษาไทย, ใจดี, มี CTA)
- [ ] Error state (มี retry)
- [ ] Success state (toast + UI update)

## Accessibility (smoke)

- [ ] Tab order makes sense
- [ ] All form inputs have visible label
- [ ] Color contrast WCAG AA (text ≥ 4.5:1)
- [ ] `alt` on all images
- [ ] Focus ring visible

## Security smoke

- [ ] ลอง paste `javascript:alert(1)` ใน URL field → ถูก block
- [ ] ลอง paste `<script>alert(1)</script>` ใน text input → render เป็น text ไม่ exec
- [ ] ลอง `?redirect=//evil.com` → ไม่ redirect ออกนอก domain
- [ ] DevTools Network → ไม่มี `service_role` ใน response
- [ ] DevTools Console → ไม่มี error / warning ที่ leak data
- [ ] Logout แล้ว Back button → ไม่เห็น dashboard ของ user ก่อนหน้า

## Performance smoke

- [ ] หน้าแรกโหลด < 3 วินาที บน Fast 3G
- [ ] ไม่มี layout shift หลัก (CLS < 0.1)
- [ ] Image lazy load below the fold
- [ ] Click → response < 200ms (INP)

## Data integrity

- [ ] สร้าง record ใหม่ → refresh page → ยังอยู่
- [ ] Edit → refresh → เห็น value ใหม่
- [ ] Delete → refresh → หายจริง
- [ ] Logout → login → เห็น data เดิม
- [ ] 2 tabs พร้อมกัน → real-time sync ถูกต้อง

## Localization

- [ ] ภาษาไทยทุกหน้า user-facing
- [ ] วันที่/เวลาแสดงผล locale `th-TH`
- [ ] เงินบาทมี `฿` หรือ `บาท`
- [ ] ไม่มี English placeholder หลงเข้ามา
