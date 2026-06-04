# Docker

รัน So1o Freelancer ใน container แบบ **Node SSR** (ไม่ใช่ Cloudflare Workers — production บน Lovable ยัง deploy แบบ Worker ได้ตามเดิม)

## ความต้องการ

- Docker + Docker Compose v2
- ไฟล์ `.env` ที่ root (คัดจาก `.env.example`)

## Production (แนะนำ)

```bash
# build + run
docker compose up --build

# เปิด http://localhost:3000
```

ตัวแปร `VITE_*` ถูก bake ตอน build — แก้ `.env` แล้ว build ใหม่:

```bash
docker compose build --no-cache app
docker compose up app
```

## Dev ใน container (optional)

```bash
docker compose --profile dev up dev
# → http://localhost:8080
```

ใช้ Bun ตามที่โปรเจกต์แนะนำใน `docs/qa-onboarding.md`

## สคริปต์ local (ไม่ใช้ Docker)

```bash
npm run build:docker
npm run start:docker
```

## โครงสร้าง

| ไฟล์ | หน้าที่ |
|------|--------|
| `Dockerfile` | multi-stage: install → `build:docker` → Node runner |
| `docker-compose.yml` | service `app` (+ `dev` profile) |
| `vite.docker.config.ts` | build สำหรับ Node (ปิด Cloudflare plugin) |
| `scripts/docker-serve.mjs` | HTTP server จาก `dist/server/server.js` |

## หมายเหตุ

- Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, Stripe) อ่านตอน runtime ผ่าน `process.env` — ส่งผ่าน `environment` ใน compose ได้
- Healthcheck: `GET /` ทุก 30 วินาที
