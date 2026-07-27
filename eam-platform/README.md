# EAM Platform — runnable local MVP

ระบบบริหารสินทรัพย์ (EAM) ตาม [design doc](../design/eam-platform-local-design.md) — รันบนเครื่องเดียวด้วย Docker Compose

## Quickstart (production-like บนเครื่องเดียว)

```bash
cp .env.example .env          # แก้รหัสผ่านใน .env ก่อน
docker compose up -d --build
# เปิด https://localhost  (Caddy ออก self-signed cert ให้ — เบราว์เซอร์จะเตือนครั้งแรก)
```

API จะ migrate + seed ข้อมูลสาธิตให้อัตโนมัติตอน start ครั้งแรก (org สาธิต, สินทรัพย์ 12 ตัว,
มิเตอร์พร้อมค่าอ่านย้อนหลัง, ใบสั่งงาน, PM schedule, จุดบนแผนที่รอบกรุงเทพฯ)

- Web UI: `https://localhost`
- OpenAPI docs: `https://localhost/api/docs`
- ผู้ใช้สาธิต (AUTH_MODE=dev): `admin` / `somsri` (หัวหน้างาน) / `somchai` (ช่าง) — สลับได้จาก sidebar

## Dev mode (hot reload)

```bash
# 1) ฐานข้อมูล + redis อย่างเดียว
docker compose up -d postgres redis

# 2) API (terminal 1)
cd apps/api && npm install && npm run build
DATABASE_URL=postgres://postgres:<DB_PASSWORD>@localhost:5432/eam \
RUN_MIGRATIONS=true MIGRATIONS_DIR=$(pwd)/../../db AUTH_MODE=dev \
node dist/main.js

# 3) Web (terminal 2) — vite proxy /api ไป :3000 ให้แล้ว
cd apps/web && npm install && npm run dev
```

## สิ่งที่ implement แล้ว (MVP core)

| ส่วน | รายละเอียด |
|---|---|
| Schema | PostgreSQL + PostGIS: `core` / `ext` / `geo` / `audit` — soft delete, `tenant_id` ทุกตาราง, `meter_reading` partition รายเดือน, append-only transaction tables |
| Custom fields | นิยามจากหน้าจอ admin มีผลทันที + validate ฝั่ง API (EAM-EXT-001/002) |
| Lookup | สถานะ/ประเภท/สี ทั้งหมดแก้ได้จากหน้าจอ ไม่ hardcode (EAM-EXT-003) |
| State machine | สถานะใบสั่งงานเป็นข้อมูลใน `ext.wf_*` + ตรวจ role ต่อ transition (EAM-EXT-004) |
| Meter reading | append-only, ตรวจค่าถอยหลัง/กระโดดผิดปกติ/rollover, idempotency key (EAM-MTR-004..006) |
| Geo | จุด PostGIS + accuracy metadata + ประวัติพิกัด, bbox query + server-side clustering, เกณฑ์ accuracy เตือน/ปฏิเสธ (EAM-GEO-*) |
| GPS capture | เก็บสัญญาณ 8 วิ เลือกค่าแม่นสุด แสดง ±m ก่อนบันทึก (EAM-GEO-031..035) |
| PM | time-based generation ผ่าน worker (BullMQ) — idempotent ด้วย unique (schedule, due date) |
| Web UI | Dashboard, สินทรัพย์ (list/detail/timeline/create+GPS), มิเตอร์+ฟอร์มอ่านค่า, Kanban ใบสั่งงาน, แผนที่หมุดสี+legend, Admin config |
| Audit | field-level ลง `audit.audit_log` ทุก create/update/transition |

## ยังไม่ทำในรอบนี้ (ตาม roadmap ใน design doc)

- PWA offline + sync (โครง `sync_conflict`, idempotency พร้อมแล้วใน schema/API)
- Keycloak integration จริง (มี middleware + compose profile `auth` แล้ว — ต้อง provision realm)
- MinIO upload รูปถ่าย (schema `photo_key` พร้อมแล้ว)
- Import Excel, Form builder, Inventory UI, รายงาน/export
- Tile server จริง (`ops/tiles/` — ตอนนี้ใช้ OSM demo tile ได้เฉพาะ dev)

## โครงสร้าง

```
eam-platform/
├── docker-compose.yml     # ทุก service (profiles: auth, tiles)
├── Caddyfile              # reverse proxy + HTTPS
├── db/
│   ├── migrations/        # SQL migrations (api รันให้ตอน start)
│   └── seed/seed.sql      # ข้อมูลสาธิต (idempotent)
├── apps/
│   ├── api/               # NestJS — REST + OpenAPI + worker (BullMQ)
│   └── web/               # React + Vite + MapLibre
└── ops/tiles/             # สคริปต์เตรียม OSM tiles ประเทศไทย
```
