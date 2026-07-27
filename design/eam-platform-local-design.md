# EAM Platform — Tech Spec สำหรับ Local Deployment (Docker Compose)

> **เอกสารนี้คือ:** แบบออกแบบระบบ (Tech Spec) ของ EAM Platform ตาม Functional & Technical Capability Specification v2.0
> โดยโฟกัสให้ **ติดตั้งและ run บนเครื่อง local / on-prem เครื่องเดียวด้วย Docker Compose ได้ภายในครึ่งวัน** (ตอบโจทย์ EAM-NFR-010)
> **สถานะ:** Draft v1.0 — คู่กับ spec v2.0 (2026-07-27)

---

## 1. 🎯 System Overview

- **System Name**: EAM Platform (Enterprise Asset Management — self-built)
- **Purpose**: ระบบบริหารสินทรัพย์ มิเตอร์ ใบสั่งงาน และซ่อมบำรุงเชิงป้องกัน ที่ "ใช้ง่ายกว่าและพัฒนาต่อง่ายกว่า" ระบบ EAM enterprise ทั่วไป — เน้น field-first, offline-first, config ก่อน code, และ API-first
- **Target Users**:
  - ช่างภาคสนาม (มือถือ/PWA — ผู้ใช้หลัก)
  - หัวหน้างาน (จัดงาน, kanban, ปฏิทิน, แผนที่)
  - ผู้ดูแลระบบ (config: custom field, state machine, lookup, form)
  - ผู้บริหาร (dashboard, รายงาน)
- **Scale Estimation (เฟสแรก)**:
  - ผู้ใช้พร้อมกัน ≤ 500 concurrent
  - สินทรัพย์/มิเตอร์ ~10,000–100,000 จุด (แผนที่ต้องรองรับ 100,000 หมุดด้วย clustering)
  - ตารางรายการ ≤ 1 ล้านแถว ตอบสนอง < 2 วิ
- **Deployment Model**: **On-Premise / Local — Docker Compose บนเครื่องเดียว** (path ขยายไป Kubernetes ในอนาคตโดยไม่แก้โค้ด)

> หลักการตัดสินใจทั้งเอกสาร: ถ้าเลือกได้ระหว่าง "ง่ายและติดตั้งเร็ว" กับ "ยืดหยุ่นระดับ enterprise" — เลือกอย่างแรก ตาม EAM-PRN-001…008

---

## 2. ✨ Core Features & Modules

Priority mapping: **P0 = MVP**, **P1 = Phase 2**, **P2 = Phase 3+** (ตรงกับ Priority ใน spec)

```
Module: Asset & Location
├── ทะเบียนสินทรัพย์ + hierarchy (asset/location)        [P0]
├── Asset type + custom field ต่อประเภท                  [P0]
├── QR/Barcode + timeline ประวัติ                        [P0]
├── Import Excel/CSV + validation report                 [P0]
└── Warranty / ต้นทุนสะสม / MTBF-MTTR                    [P1–P2]

Module: Meter & Reading
├── ทะเบียนมิเตอร์ (cumulative/gauge/characteristic)     [P0]
├── บันทึกค่าอ่าน + รูปหน้าปัด + validation + rollover   [P0]
├── Reading route + สถานะการอ่านต่อรอบ                   [P0]
└── Trend graph / limit → auto work order / AMR import   [P1–P2]

Module: Work Management
├── แจ้งซ่อม (เว็บ/มือถือ/QR) → ใบสั่งงาน                [P0]
├── State machine config ได้ + assign คน/ทีม             [P0]
├── Task/checklist, work log, อะไหล่, รูปก่อน-หลัง       [P0]
├── มุมมอง list / kanban / calendar / map                [P0]
└── อนุมัติงาน / SLA / ต้นทุนงาน                          [P1]

Module: Preventive Maintenance
├── PM ตามเวลา + job plan + lead time generation         [P0]
├── Inspection route                                     [P0]
└── PM ตามมิเตอร์ / forecast 12 เดือน / compliance       [P1]

Module: Inventory
├── ทะเบียนอะไหล่ + หลายคลัง + เบิก-คืนผูกใบงาน + รับเข้า [P0]
└── โอนย้าย / reorder point / ตรวจนับ                     [P1]

Module: Map / Geospatial          ← จุดได้เปรียบหลัก
├── PostGIS point + accuracy metadata + ประวัติพิกัด      [P0]
├── หมุดสี/ไอคอนตาม type/status + legend + filter        [P0]
├── Clustering + server-side bbox query (100k จุด)       [P0]
├── GPS capture: รอสัญญาณนิ่ง, แสดง accuracy, เกณฑ์ขั้นต่ำ [P0]
└── Polygon เขต / heatmap / drag-แก้หมุด / RTK           [P1–P2]

Module: Field App (PWA)
├── Offline เต็มรูปแบบ + delta sync + conflict เก็บ 2 ฝั่ง [P0]
├── สแกน QR, ถ่ายรูปบีบอัด, งานของฉันวันนี้               [P0]
├── อ่านมิเตอร์ตาม route + ฟอร์มตรวจสอบเงื่อนไข           [P0]
└── ลายเซ็น / push notification / โหมดประหยัดแบต          [P1]

Module: Extensibility             ← หัวใจ "พัฒนาต่อง่าย"
├── Custom field (JSONB + custom_field_def)              [P0]
├── Lookup/master data แก้จากหน้าจอ                       [P0]
├── State machine เป็นข้อมูล ไม่ใช่โค้ด                    [P0]
├── Form builder (คำถามเงื่อนไข)                          [P0]
└── Rule engine / webhook / report builder / plugin      [P1–P2]

Module: Reporting & Admin
├── Dashboard ตามบทบาท + KPI พื้นฐาน + export CSV/Excel  [P0]
├── รายงานค่าอ่านมิเตอร์ตามงวด                            [P0]
└── Report builder / scheduled email / BI view           [P1–P2]
```

**Key logic ที่ต้องพัฒนาเอง (ไม่มี library สำเร็จ):**

| Logic | อยู่ที่ | หมายเหตุ |
|---|---|---|
| Meter reading validation (ถอยหลัง/กระโดด/rollover) | Domain service ฝั่ง API + ตรวจซ้ำฝั่ง PWA ตอน offline | append-only, แก้ = แถวใหม่+เหตุผล |
| PM generation (time-based, lead time) | BullMQ repeatable job (worker) | idempotent — run ซ้ำต้องไม่สร้างใบงานซ้ำ |
| Configurable state machine | ตาราง `wf_state`, `wf_transition` + guard ใน service | ห้าม hardcode enum |
| Custom field mechanism | `custom_field_def` + `custom_fields JSONB` + GIN index | validate ตาม def ตอน write |
| Offline sync (delta + conflict) | Sync endpoint + client outbox | ดูข้อ 10 |
| GPS best-fix picker | ฝั่ง client (เก็บ 5–10 วิ เลือก accuracy ดีสุด) | บันทึก accuracy ลง DB เสมอ |

**External dependencies:** ไม่มี SaaS บังคับ — ทุกอย่าง self-host ได้ (ตามโจทย์ local) ยกเว้น OSM tile ที่ต้องเตรียม extract เอง (ดูข้อ 11.4)

---

## 3. 🏗️ System Architecture

### 3.1 Architecture Pattern: **Modular Monolith + Worker**

เหตุผล (trade-off ชัด ๆ):

- ทีมเล็ก + ต้องติดตั้งได้ในครึ่งวันบนเครื่องเดียว → microservices คือ overhead ล้วน ๆ (network, tracing, deploy หลายตัว)
- แต่ต้อง "ขยายได้โดยไม่แก้ของเดิม" (EAM-PRN-008) → ใช้ **NestJS module ต่อ domain** (assets, meters, work, pm, inventory, geo, forms, sync, admin) มี boundary ชัด ห้าม import ข้าม module ตรง ๆ — คุยกันผ่าน service interface / in-process event bus
- งานหนัก/งานตามรอบ (PM generation, import, report, notification, image processing) แยกเป็น **worker process** ตัวเดียว ใช้ codebase เดียวกัน คุยผ่าน BullMQ/Redis
- ถ้าวันหน้าต้อง scale: แตก worker ออกเป็นหลายตัว หรือยก module ที่ร้อนออกเป็น service ได้ เพราะ boundary มีอยู่แล้ว

### 3.2 Layer Diagram (Local / Docker Compose)

```
                    เครื่อง Local / On-Prem Server เครื่องเดียว
┌───────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                 │
│   Web App (React SPA)      PWA ภาคสนาม (offline-first)                │
│   Desktop browser          มือถือช่าง — service worker + IndexedDB    │
└───────────────┬───────────────────────────────────────────────────────┘
                │ HTTPS (Caddy ออก TLS ให้ หรือ self-signed บน LAN)
┌───────────────▼───────────────────────────────────────────────────────┐
│                     EDGE LAYER — Caddy (reverse proxy)                │
│   /            → web (static SPA + PWA)                               │
│   /api/*       → api                                                  │
│   /auth/*      → keycloak                                             │
│   /tiles/*     → tileserver-gl                                        │
│   /files/*     → minio (presigned URL passthrough)                    │
└──────┬───────────────┬──────────────┬──────────────┬─────────────────┘
       │               │              │              │
┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
│  api        │ │  keycloak   │ │ tileserver│ │  minio      │
│  NestJS     │ │  (OIDC)     │ │ -gl (OSM  │ │  (S3-compat │
│  REST +     │ │             │ │  Thailand │ │  attachments│
│  OpenAPI    │ │             │ │  MBTiles) │ │  + photos)  │
└──┬───────┬──┘ └──────┬──────┘ └───────────┘ └──────┬──────┘
   │       │           │                             │
   │  ┌────▼────────┐  │      ┌──────────────┐      │
   │  │  worker     │  │      │  redis       │      │
   │  │  BullMQ:    │◄─┼──────┤  queue +     │      │
   │  │  PM gen,    │  │      │  cache       │      │
   │  │  import,    │  │      └──────────────┘      │
   │  │  report,    │  │                            │
   │  │  notify     │──┼────────────────────────────┘ (thumbnail/บีบอัดรูป)
   │  └────┬────────┘  │
┌──▼───────▼───────────▼───────────────────────────────────────────────┐
│                 DATA LAYER — PostgreSQL 16 + PostGIS                  │
│   schema: core (asset/meter/work/pm/inv)  ext (custom field/wf/form)  │
│   geo (geo_point, GiST)  audit (audit_log, append-only)               │
└───────────────────────────────────────────────────────────────────────┘
```

ทุกกล่องคือ 1 container ใน `docker-compose.yml` เดียว — ไม่มีส่วนไหนอยู่นอกเครื่อง

### 3.3 Component Breakdown

| Component | Role | Technology | Justification |
|-----------|------|------------|---------------|
| `caddy` | Reverse proxy + TLS + serve SPA | Caddy 2 | config สั้นที่สุดในบรรดา proxy, ออก self-signed/internal CA อัตโนมัติ — สำคัญเพราะ PWA (service worker, geolocation) **บังคับ HTTPS** |
| `web` | Web UI + PWA ภาคสนาม | React + TS + Vite (build เป็น static) | codebase เดียว สอง shell (desktop/mobile) — ลดงานซ้ำ |
| `api` | REST API ทุก entity + OpenAPI + sync endpoint | NestJS (TypeScript) | ตาม spec ข้อ 16 — ภาษาเดียวกับ frontend, DI/module system ตรงกับ modular monolith |
| `worker` | Job ตามรอบ + งานหนัก | NestJS (โปรเซสที่สอง image เดียวกับ api) | แยก process กัน job หนักไม่บล็อก API แต่ไม่เพิ่ม repo/deploy |
| `postgres` | ฐานข้อมูลเดียวของระบบ | PostgreSQL 16 + PostGIS 3.4 | geospatial + JSONB + full-text ในตัวเดียว ตาม spec |
| `redis` | Queue backend + cache + rate limit counter | Redis 7 | ตัวเดียวรับ 3 หน้าที่ พอสำหรับ scale เฟสแรก |
| `minio` | เก็บไฟล์แนบ/รูปถ่าย | MinIO (S3-compatible) | on-prem ได้ วันหน้าย้าย S3 จริงโดยเปลี่ยนแค่ endpoint |
| `keycloak` | AuthN/SSO (OIDC) + user federation | Keycloak 25 | ได้ OIDC/SAML/MFA ฟรี ไม่ต้องเขียน auth เอง; **AuthZ (RBAC/row-level) อยู่ฝั่ง api ไม่ใช่ Keycloak** — กัน logic ผูกติด IdP |
| `tileserver` | แผนที่ฐาน offline | TileServer GL + MBTiles (Thailand extract) | ห้ามใช้ OSM public tile ใน production ตาม spec ข้อ 9.5 — self-host ตอบทั้ง policy และ offline |

> **Trade-off ที่จงใจเลือก:** Keycloak กิน RAM ~1GB และเพิ่มความซับซ้อนตอน setup แต่แลกกับการไม่ต้องเขียน/ดูแล auth + ได้ SSO ฟรีตอนขายองค์กร ถ้าเครื่อง dev เล็กมาก มี fallback profile ใช้ auth ในตัว (dev-only, JWT ออกโดย api เอง) — business logic ไม่รู้จัก IdP อยู่แล้วเพราะตรวจแค่ JWT claims

---

## 4. 🛠️ Technology Stack

### Frontend
| Category | Technology | Reason |
|----------|------------|--------|
| Framework | React 18 + TypeScript + Vite | ตาม spec — ecosystem ใหญ่ หาคนในไทยง่าย |
| State/Data | TanStack Query + Zustand | Query จัดการ cache/retry/offline queue ได้ดี ไม่ต้องใช้ Redux |
| UI kit | shadcn/ui (Radix + Tailwind) | ปรับ theme ต่อ tenant ง่าย (EAM-EXT-012), ไม่ผูก vendor |
| แผนที่ | MapLibre GL JS | vector tile + clustering ระดับ 100k จุด ตาม spec |
| PWA/Offline | Workbox (service worker) + Dexie (IndexedDB) | Dexie เป็น wrapper IndexedDB ที่เขียน sync logic เองได้ตรง ๆ — เราต้องคุม conflict format เอง (เก็บ 2 ฝั่ง) จึงไม่ใช้ sync framework สำเร็จรูป |
| Form runtime | react-hook-form + zod + JSON schema จาก form builder | schema-driven ตาม EAM-EXT-005 |

### Backend
| Category | Technology | Reason |
|----------|------------|--------|
| Framework | NestJS 10 (TypeScript) | ตาม spec — module boundary ชัด รองรับ modular monolith |
| ORM | Drizzle ORM (หรือ Kysely) | type-safe SQL ตรง ๆ — สำคัญเพราะเราใช้ JSONB/GIN/PostGIS query เยอะ ORM หนา ๆ (TypeORM) จะขวางทาง |
| Migration | Drizzle Kit (SQL migration ใน git) | migration เป็นไฟล์ SQL ตรวจ review ได้ |
| Validation | zod (แชร์ schema กับ frontend ผ่าน package กลาง) | นิยาม type เดียว ใช้ทั้ง 2 ฝั่ง |
| API docs | @nestjs/swagger → OpenAPI 3 | API-first ตาม EAM-PRN-004 |
| Queue | BullMQ + Redis | ตาม spec — PM generation, import, notification, report |
| PDF/Excel | exceljs + playwright(print-to-pdf) ใน worker | export ตาม EAM-RPT-003/004 |

### Database & Storage
| Type | Technology | Use Case |
|------|------------|----------|
| Primary DB | PostgreSQL 16 + PostGIS 3.4 | ทุก entity + geospatial + JSONB custom fields + full-text search (ไทย: `pg_trgm` + simple config) |
| Cache/Queue | Redis 7 | BullMQ, cache-aside, rate limit |
| Object storage | MinIO | attachments, รูปถ่าย (บีบอัดแล้ว), report ที่ generate |
| Map tiles | MBTiles ไฟล์เดียว (Thailand extract) | อ่านโดย tileserver-gl; มือถือดาวน์โหลด PMTiles เฉพาะพื้นที่ปฏิบัติงาน |
| Client offline | IndexedDB (Dexie) | ข้อมูลงาน/มิเตอร์/แผนที่ของพื้นที่ตัวเอง + outbox |

### Infrastructure & DevOps
| Category | Technology | Reason |
|----------|------------|--------|
| Runtime | Docker Compose v2 (ไฟล์เดียว + profiles) | เป้าหมาย "ติดตั้งครึ่งวัน"; profile `dev` / `prod` / `no-auth` |
| Reverse proxy | Caddy 2 | HTTPS อัตโนมัติ (จำเป็นกับ PWA/geolocation) |
| CI | GitHub Actions: lint → test → build image → push registry | ตั้งแต่สัปดาห์แรกตาม spec ข้อ 18 |
| Backup | `pg_dump` รายวัน + WAL archive ไป MinIO bucket (`pgbackrest`) | ตอบ RPO 1 ชม. / PITR 7 วัน บนเครื่องเดียว |
| Monitoring (local) | Prometheus + Grafana + Loki (profile `monitoring` — เปิดเมื่อต้องการ) | ไม่บังคับตอน dev, เปิดตอน UAT/prod |

### Integrations & Third-party
| Service | Purpose | Protocol |
|---------|---------|----------|
| ERP/บัญชี (ของลูกค้า) | ส่งต้นทุนออก | CSV export + REST (Phase 2) |
| HR (ของลูกค้า) | ดึงข้อมูลพนักงาน | REST/CSV import (Phase 2) |
| LINE Notify / SMTP | แจ้งเตือน | HTTPS / SMTP (Phase 2) |
| AMR/IoT meter | รับค่าอ่านอัตโนมัติ | HTTP ingest (MQTT Phase 3) |

---

## 5. 🗄️ Database Design

### 5.1 Data Model Overview

Entity หลัก 10 ตัวตาม spec ข้อ 3 — ทั้งหมดอยู่ใน PostgreSQL เดียว แยก schema ตามหน้าที่:

```
schema core:
  organization ─< site ─< location (parent_id + ltree path)
                              └──< asset (parent_id + ltree path)
                                     ├──< meter ──< meter_reading (append-only)
                                     └──< attachment (polymorphic)
  work_order ─< work_task
             ─< work_log / labor_txn / material_txn / inspection_result
  pm_schedule ──generates──> work_order      (ผ่าน worker job)
  job_plan ─< job_plan_task                  (template)
  inventory_item ─< stock_balance (ต่อ storeroom) ─< stock_transaction (append-only)
  app_user / team / team_member / role

schema ext:                                  ← extensibility เป็น first-class
  custom_field_def (entity, asset_type_id?, key, type, rules)
  lookup_type ─< lookup_value                (สถานะ/ประเภท/หน่วย ทุกตัว)
  wf_definition ─< wf_state ─< wf_transition (state machine เป็นข้อมูล)
  form_def (JSON schema) ─< form_submission
  saved_view / dashboard_widget

schema geo:
  geo_point (entity_type, entity_id, geography(Point,4326),
             accuracy_m, source, captured_by, captured_at, superseded_by)
  area_boundary (polygon — Phase 2)

schema audit:
  audit_log (field-level diff, append-only)
  sync_log / sync_conflict (เก็บทั้งสองเวอร์ชัน)
```

**กฎ schema (บังคับผ่าน migration template + CI check):**
- ทุกตาราง: `id uuid`, `tenant_id uuid`, `created_at/by`, `updated_at/by`, `deleted_at`, `custom_fields jsonb default '{}'` + GIN index
- **ใส่ `tenant_id` ตั้งแต่วันแรกแม้ยังไม่ multi-tenant** (ตามคำแนะนำ spec ข้อ 18) — local รันด้วย tenant เดียว
- ทุก mutable table มี `row_version int` เพื่อ optimistic lock + ใช้ตรวจ conflict ตอน sync
- transaction tables (`meter_reading`, `stock_transaction`, `work_log`, `audit_log`) เป็น append-only — ไม่มี UPDATE/DELETE grant ที่ DB level เลย
- hierarchy ใช้ `parent_id` + `ltree path` (query ลูกทั้งสายด้วย index เดียว)

### 5.2 Database Strategy

| Database | Type | Tables/Collections | Reason |
|----------|------|--------------------|--------|
| PostgreSQL (`core`,`ext`,`geo`,`audit`) | RDBMS | ~30 ตาราง | ระบบเดียวครบ ไม่มี polyglot — ลด ops บน local |
| Redis | KV | cache, queue, counters | ephemeral ทั้งหมด — ลบได้ไม่เสียข้อมูล |
| MinIO | Object | bucket: `attachments`, `map-packs`, `exports`, `backups` | ไฟล์ไม่อยู่ใน DB; DB เก็บแค่ metadata |

### 5.3 Caching Strategy
- **Pattern**: Cache-aside เท่านั้น (เรียบง่าย, ผิดพลาดแค่ cache miss)
- **สิ่งที่ cache ใน Redis**: lookup values, custom_field_def, wf_definition, สรุป dashboard (TTL 60s), tile metadata — ข้อมูล config ที่อ่านทุก request แต่แก้นาน ๆ ครั้ง
- **TTL**: config 5 นาที + **invalidate ทันทีเมื่อ admin แก้** (publish event ผ่าน Redis pub/sub ให้ทุก process ล้าง); dashboard aggregate 60 วินาที
- **สิ่งที่ห้าม cache**: work order, meter reading, stock — ความสดสำคัญกว่า และ PWA มี local cache ของตัวเองอยู่แล้ว
- **HTTP layer**: tile และ static asset ให้ Caddy ใส่ `Cache-Control` ยาว ๆ (immutable, hashed filename)

### 5.4 Data Partitioning
Scale เฟสแรกไม่ต้อง shard ใด ๆ มีแค่:
- `meter_reading` และ `audit_log` ทำ **declarative partition รายเดือน** ตั้งแต่วันแรก (สองตารางนี้โตเร็วสุด และการ detach partition เก่าคือวิธี archive ที่ถูกที่สุด)
- GiST index บน `geo_point.geom`, GIN บน `custom_fields`, B-tree บน FK/status ทุกตัวที่อยู่ใน WHERE ประจำ

---

## 6. 🔌 API Design

### 6.1 API Style
**REST + OpenAPI 3** (ตาม spec — ตรงไปตรงมา debug ง่ายสำหรับทีมเล็ก; GraphQL ถูกตัดโดยตั้งใจ) + endpoint พิเศษสำหรับ sync และ geo

### 6.2 Key Endpoints (ตัวอย่าง — ทุก entity ใช้ pattern เดียวกัน)

```
# มาตรฐานเดียวกันทุก resource (EAM-INT-003)
GET    /api/v1/assets?filter[status]=active&filter[type]=pump
       &page[size]=50&page[after]=<cursor>&sort=-updated_at&fields=id,code,name
POST   /api/v1/assets                        # สร้าง (รับ custom_fields ตาม def)
GET    /api/v1/assets/:id                    # รายละเอียด + ?include=meters,geo
PATCH  /api/v1/assets/:id                    # แก้ (ต้องส่ง row_version)
DELETE /api/v1/assets/:id                    # soft delete เท่านั้น
GET    /api/v1/assets/:id/timeline           # ประวัติรวม (EAM-AST-008)

# Meter & reading
POST   /api/v1/meters/:id/readings           # append-only + validation
POST   /api/v1/readings:bulk                 # อ่านตาม route ทีละชุด
GET    /api/v1/routes/:id/progress           # สถานะการอ่านต่อรอบ

# Work order — state machine
POST   /api/v1/work-orders/:id/transitions   # { "to": "in_progress", "note": ... }
GET    /api/v1/work-orders/views/kanban      # group by state

# Geo — ออกแบบเพื่อแผนที่ 100k จุดโดยเฉพาะ
GET    /api/v1/geo/features?bbox=100.1,13.6,100.9,14.1&zoom=12
       &layer=meters&color_by=meter_type     # ตอบ GeoJSON; zoom ต่ำ server จะ
                                             # cluster ให้ (ST_ClusterKMeans) —
                                             # client ไม่เคยรับเกิน ~2,000 features
POST   /api/v1/geo/points                    # บันทึกพิกัด + accuracy metadata

# Sync (PWA)
GET    /api/v1/sync/pull?since=<server_cursor>&scope=my-area   # delta
POST   /api/v1/sync/push                     # batch จาก outbox (idempotent)

# Import / Export
POST   /api/v1/imports (multipart) → 202 + job id → GET /api/v1/imports/:id
GET    /api/v1/<resource>/export?format=csv|xlsx

# Admin / config
CRUD   /api/v1/admin/custom-fields, /admin/lookups, /admin/workflows, /admin/forms
```

### 6.3 API Standards
- **Versioning**: path `/api/v1` — bump major เมื่อ breaking เท่านั้น; additive change ไม่ bump
- **Pagination**: cursor-based ทุก endpoint (ตาราง 1 ล้านแถว offset จะตาย) — `page[after]` + `page[size]` (max 200)
- **Rate limiting**: token bucket ต่อ user/API key ใน Redis — default 100 req/min, sync endpoint แยก quota
- **Error format** (เดียวกันทุก endpoint):
```json
{ "error": { "code": "METER_READING_BACKWARD", "message": "ค่าอ่านน้อยกว่าครั้งก่อน (1200 < 1350)",
             "field": "value", "details": {...}, "trace_id": "..." } }
```
- **Idempotency**: ทุก POST ที่มาจาก PWA ส่ง `Idempotency-Key` (client-generated uuid) — server เก็บ 48 ชม. กันยิงซ้ำตอน sync retry
- **Auth**: `Authorization: Bearer <JWT>` (ผู้ใช้) หรือ `X-Api-Key` (machine-to-machine)

---

## 7. 🔒 Security Architecture

> บริบท local/on-prem: ไม่มี cloud WAF/KMS ให้ใช้ — ออกแบบให้ปลอดภัยด้วยของที่อยู่ในเครื่องเอง และระบุชัดว่าข้อไหนเป็นความรับผิดชอบของ network ลูกค้า

### 7.1 Authentication & Authorization
- **AuthN**: Keycloak (OIDC, Authorization Code + PKCE สำหรับ SPA/PWA) — ออก JWT access token (อายุ 15 นาที) + refresh token (rotating)
- **Offline auth**: PWA เก็บ session ไว้ทำงาน offline ได้ยาว แต่ **การ sync ต้องมี token สด** — refresh เมื่อ online; ข้อมูลใน IndexedDB จำกัดเฉพาะ scope พื้นที่ของผู้ใช้
- **AuthZ (ฝั่ง api ทั้งหมด)**:
  - RBAC: role → permission ต่อ module ต่อ action (view/create/edit/delete/approve) ตาม EAM-SEC-003
  - Row-level: ทุก query บังคับ scope `tenant_id` + `site/area` ของผู้ใช้ผ่าน query builder กลาง (ไม่ให้ module เขียน WHERE เอง)
- **M2M**: API key ผูก service account + scope จำกัด
- **MFA**: Keycloak TOTP — เปิดต่อ role (Phase 2)

### 7.2 Network Security
- **Perimeter**: ระบบอยู่ใน LAN/VPN ของลูกค้า — ถ้าต้อง expose อินเทอร์เน็ต ให้ผ่าน reverse proxy ของลูกค้า/Cloudflare Tunnel เท่านั้น (ระบุใน install guide)
- **Transport**: Caddy บังคับ HTTPS + HSTS; ใน LAN ใช้ internal CA ของ Caddy แล้ว distribute root cert ให้เครื่องช่าง (จำเป็น — PWA ไม่ทำงานบน HTTP)
- **Internal**: ทุก container อยู่ใน Docker network ภายใน — **มีแค่ Caddy ที่ publish port (80/443)**; postgres/redis/minio/keycloak ไม่แตะ host network

### 7.3 Data Security
- **At rest**: full-disk encryption ระดับ OS (คำแนะนำใน install guide — on-prem เครื่องลูกค้า); MinIO เปิด SSE; field อ่อนไหว (เช่น เบอร์โทรผู้ใช้) เข้ารหัสระดับ column ด้วย key ใน `.env`
- **In transit**: TLS ทุกทางเข้า; ภายใน Docker network เป็น traffic ในเครื่องเดียว
- **PII (PDPA — EAM-SEC-009)**: จัดทำ data inventory (มี PII แค่ user profile + ลายเซ็น + รูปที่อาจติดบุคคล); soft delete + anonymize job สำหรับ right-to-erasure; export ข้อมูลส่วนบุคคลตาม request ได้จาก admin UI
- **Key management**: local ไม่มี KMS — secrets อยู่ใน `.env` (ห้าม commit, มี `.env.example`), แนะนำ SOPS/age สำหรับเก็บใน git อย่างปลอดภัยเมื่อทีมโต

### 7.4 Application Security
- Input validation ด้วย zod ทุก endpoint (รวม custom field ตาม def)
- SQL ผ่าน parameterized query เท่านั้น (Drizzle) — JSONB path จาก user ต้อง whitelist key ตาม `custom_field_def`
- File upload: ตรวจ MIME จริง (magic bytes), จำกัดขนาด, รูปถูก re-encode ตอนบีบอัด (กัน payload ฝังในไฟล์), เสิร์ฟผ่าน presigned URL อายุสั้น
- CSRF: ไม่ใช้ cookie auth (Bearer token) → ความเสี่ยงต่ำ; CORS จำกัด origin ของตัวเอง
- Dependency scan: Dependabot + `npm audit` ใน CI; container image scan ด้วย Trivy

### 7.5 Compliance & Audit
- `audit_log` field-level: ใครแก้อะไร จากค่าไหนเป็นค่าไหน เมื่อไหร่ ผ่านช่องทางไหน (EAM-SEC-004) — เขียนจาก service layer กลาง ไม่ใช่ trigger (อ่าน context ผู้ใช้ได้ครบ)
- Login/failed-login log จาก Keycloak event listener → ตาราง audit
- Data retention: audit + reading เก็บตาม partition, นโยบาย detach ตามที่ลูกค้ากำหนด

### 7.6 Security Layers Summary
```
Layer 1: Perimeter   — อยู่ใน LAN/VPN ลูกค้า; expose ผ่าน tunnel เท่านั้น
Layer 2: Network     — Docker internal network; Caddy คือ port เดียวที่เปิด; TLS+HSTS
Layer 3: Identity    — Keycloak OIDC+PKCE, JWT สั้น, refresh rotation, MFA(P2)
Layer 4: Application — zod validation, parameterized SQL, upload re-encode, CORS
Layer 5: Data        — disk encryption, MinIO SSE, column encryption, PDPA jobs
Layer 6: Monitoring  — audit_log field-level, auth events, Loki + alert (profile)
```

---

## 8. ⚡ Non-Functional Requirements

| NFR | Target (จาก spec) | Approach บน local |
|-----|--------|----------|
| List response | < 2 วิ @ 1M แถว | cursor pagination + covering index + `fields=` selection |
| Map load | < 3 วิ @ 100k จุด | server-side bbox + cluster ที่ zoom ต่ำ, client รับ ≤ 2k features |
| Concurrent users | 500 | Node cluster mode (api x N process ตาม CPU), pgbouncer ถ้าจำเป็น |
| Availability | 99.5% | เครื่องเดียว = จุดตายเดียว — ใช้ `restart: always`, healthcheck ทุก service, เอกสาร restore ชัดเจน (HA จริงคือเฟส K8s) |
| Backup | รายวัน + PITR 7 วัน | pgbackrest → MinIO bucket + สำเนาออกนอกเครื่อง (external disk/NAS — ระบุใน runbook) |
| RPO / RTO | 1 ชม. / 4 ชม. | WAL archive ทุก 15 นาที / restore script ทดสอบจริงทุก release |
| Browser / Mobile | Chrome, Edge, Safari ล่าสุด 2 รุ่น / Android 10+, iOS 15+ | PWA feature detection + graceful degradation |
| ภาษา | ไทย + อังกฤษ | i18n key ตั้งแต่ component แรก (react-i18next) |
| **ติดตั้ง** | **ครึ่งวัน** | `git clone` → `cp .env.example .env` → `docker compose up -d` → seed + wizard สร้าง org แรก (ดูข้อ 11) |

---

## 9. 📈 Scalability & Performance

- **บนเครื่องเดียว (ตอนนี้)**: api รัน N process (Node cluster / compose `deploy.replicas`), worker แยก process, Postgres จูน `shared_buffers`/`work_mem` ตาม RAM จริงผ่าน env
- **Queue**: ทุกงานที่ > 1 วินาที (import, PDF, PM gen, บีบอัดรูป, notification) ลง BullMQ — API ตอบ 202 + job id เสมอ
- **แผนที่**: จุดทั้งหมดอยู่ใน PostGIS; zoom สูงส่ง raw point ใน bbox, zoom ต่ำใช้ `ST_ClusterKMeans`/grid aggregate ฝั่ง DB; ผล cluster ต่อ tile-bbox cache ใน Redis 60 วิ
- **เส้นทางขยาย (ไม่แก้โค้ด)**:
  1. เครื่องใหญ่ขึ้น (vertical) — จูน env อย่างเดียว
  2. แยก DB ออกไปเครื่องที่สอง — เปลี่ยน `DATABASE_URL`
  3. หลาย api replica + read replica — ออกแบบ stateless ไว้แล้ว (session อยู่ใน JWT, ไฟล์อยู่ MinIO)
  4. Kubernetes — image เดิมทุกตัว, compose → helm

---

## 10. 🔄 Integration & Data Flow

### Flow 1 — ช่างอ่านมิเตอร์ตาม route (offline)
```
PWA (ไม่มีสัญญาณ):
  เปิด route → อ่านค่า + ถ่ายรูป + GPS fix
  → validate ทันทีจาก rule ใน local cache (ถอยหลัง/กระโดด → เตือนตรงนั้น)
  → เขียนลง IndexedDB outbox (พร้อม Idempotency-Key)

กลับมามีสัญญาณ:
  outbox → POST /sync/push (batch)
  → api ตรวจ row_version:
      ไม่ชน → commit + audit log
      ชน    → เขียน sync_conflict เก็บทั้งสองเวอร์ชัน → แจ้งหัวหน้างานตัดสิน
  → ตอบผล per-item → PWA เคลียร์ outbox เฉพาะรายการที่สำเร็จ
  → GET /sync/pull?since=cursor ดึง delta กลับ (งานใหม่, master data ที่แก้)
```

### Flow 2 — PM generation (อัตโนมัติ)
```
BullMQ repeatable (ทุกคืน 02:00):
  worker scan pm_schedule ที่ due ภายใน lead time
  → สร้าง work_order จาก job_plan (ตรวจซ้ำด้วย unique key: schedule+รอบ → idempotent)
  → event "wo.created" → notification job → (Phase 2: LINE/email)
```

### Flow 3 — แจ้งซ่อมจาก QR
```
ช่าง scan QR บนเครื่อง → เปิด PWA ที่หน้า asset นั้นทันที
→ ปุ่ม "แจ้งซ่อม" (คลิกที่ 1) → ฟอร์มสั้น + รูป (คลิกที่ 2) → ส่ง (คลิกที่ 3)
→ work_order (state: reported) → ปรากฏบน kanban หัวหน้างาน real-time (SSE)
```

> Realtime ใช้ **SSE** (ไม่ใช่ WebSocket) — ผ่าน proxy/firewall ง่ายกว่า และ use case มีแต่ push ทางเดียว

---

## 11. 🚀 Deployment & Infrastructure (หัวใจของโจทย์ "run local")

### 11.1 Environment Strategy
| Environment | Purpose | รูปแบบ |
|-------------|---------|-------|
| Development | dev บนเครื่อง dev | `docker compose --profile dev` (DB/Redis/MinIO ใน container, api/web รัน `npm run dev` บน host เพื่อ hot reload) |
| Local prod / UAT | ติดตั้งจริงที่ลูกค้า/เครื่องทดสอบ | `docker compose --profile prod` — ทุกอย่างใน container, image จาก registry |
| (อนาคต) Scale-out | ลูกค้าใหญ่ | Kubernetes + Helm (image เดิม) |

### 11.2 โครงสร้าง repo (monorepo เดียว)
```
eam-platform/
├── docker-compose.yml            # ไฟล์เดียว + profiles: dev / prod / monitoring
├── .env.example                  # ทุก config ที่ต้องกรอก พร้อมคำอธิบาย
├── Caddyfile
├── apps/
│   ├── api/          # NestJS (modules: assets, meters, work, pm, inventory,
│   │                 #          geo, forms, sync, admin, auth, audit)
│   ├── worker/       # entrypoint ที่สอง ใช้ src เดียวกับ api
│   └── web/          # React SPA + PWA
├── packages/
│   ├── shared/       # zod schemas, types, validation rules (ใช้ทั้ง api+web)
│   └── ui/           # design system components
├── db/
│   ├── migrations/   # SQL migrations (Drizzle Kit)
│   └── seed/         # seed สาธิต: org, asset 500, meter 1,000, จุด demo บนแผนที่
├── ops/
│   ├── backup/       # pgbackrest config + restore runbook
│   └── tiles/        # สคริปต์โหลด Thailand MBTiles ลง volume
└── docs/             # install guide "ครึ่งวัน", OpenAPI, ER diagram
```

### 11.3 docker-compose.yml (โครง — ค่าจริงอยู่ใน `.env`)
```yaml
name: eam
services:
  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes: [./Caddyfile:/etc/caddy/Caddyfile, caddy_data:/data]
    depends_on: [api, web, keycloak, tileserver]

  web:
    image: ${REGISTRY}/eam-web:${TAG}
    profiles: [prod]                    # dev ใช้ vite dev server บน host

  api:
    image: ${REGISTRY}/eam-api:${TAG}
    env_file: .env
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_started }
    deploy: { replicas: ${API_REPLICAS:-2} }
    healthcheck: { test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"] }
    restart: always

  worker:
    image: ${REGISTRY}/eam-api:${TAG}
    command: node dist/worker.js
    env_file: .env
    depends_on: [api]
    restart: always

  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: eam
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes: [pg_data:/var/lib/postgresql/data]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"] }
    restart: always
    # ไม่ publish port — เข้าจาก host ผ่าน `docker compose exec` เท่านั้น

  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]
    restart: always

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes: [minio_data:/data]
    restart: always

  keycloak:
    image: quay.io/keycloak/keycloak:25.0
    command: start --proxy-headers xforwarded --http-enabled true
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres/keycloak
      KC_BOOTSTRAP_ADMIN_PASSWORD: ${KC_ADMIN_PASSWORD}
    depends_on: [postgres]
    restart: always
    # realm import อัตโนมัติจาก ops/keycloak/realm.json ตอน first start

  tileserver:
    image: maptiler/tileserver-gl
    volumes: [./ops/tiles/data:/data]   # thailand.mbtiles วางที่นี่
    restart: always

  # --- profile: monitoring (เปิดเมื่อต้องการ) ---
  prometheus: { image: prom/prometheus, profiles: [monitoring], ... }
  grafana:    { image: grafana/grafana,  profiles: [monitoring], ... }
  loki:       { image: grafana/loki,     profiles: [monitoring], ... }

volumes: { pg_data: {}, redis_data: {}, minio_data: {}, caddy_data: {} }
```

**ขั้นตอนติดตั้งจริง (เป้าหมาย: < ครึ่งวันรวมโหลด tile):**
```bash
git clone <repo> && cd eam-platform
cp .env.example .env && nano .env        # กรอกรหัสผ่าน + โดเมน/IP  (~10 นาที)
./ops/tiles/download-thailand.sh         # โหลด MBTiles              (~30–60 นาที)
docker compose --profile prod up -d      # ดึง image + start          (~15 นาที)
docker compose exec api npm run db:setup # migrate + seed + org แรก  (~5 นาที)
# เปิด https://<host> → login admin → setup wizard (site, ทีม, asset type แรก)
```

**Resource ขั้นต่ำ**: 4 vCPU / 8 GB RAM / 100 GB SSD (Keycloak ~1GB, Postgres ~2GB, ที่เหลือ api/worker/tile) — โน้ตบุ๊ก dev รันได้ด้วย profile `dev` (ไม่รัน keycloak/tileserver ก็ได้: auth dev-mode + OSM demo tile)

### 11.4 OSM Tiles (ตาม spec ข้อ 9.5)
- Production: `thailand.mbtiles` (extract จาก Geofabrik ผ่าน tilemaker/planetiler) ~10–30 GB ตาม zoom — สคริปต์ `ops/tiles/` จัดการให้
- Attribution `© OpenStreetMap contributors` ฝังใน map component
- Update รอบ 6 เดือน (สคริปต์เดิม รันซ้ำ)
- มือถือ offline: worker ตัด PMTiles เฉพาะ bbox พื้นที่ปฏิบัติงาน → เก็บใน `map-packs` bucket → PWA ดาวน์โหลดตอนอยู่บน WiFi

### 11.5 CI/CD
```
push → lint + typecheck + unit test
     → build 2 images (eam-api, eam-web) + Trivy scan
     → integration test (compose ephemeral: postgres+redis จริง, ทดสอบ sync/state machine/validation)
     → push registry (tag = git sha + semver)
release → เอกสาร changelog + สคริปต์ upgrade:  docker compose pull && up -d
          (migration รันอัตโนมัติตอน api start, backward-compatible เสมอ)
```

---

## 12. 📊 Observability (ฉบับ local — เปิด/ปิดได้)

| Pillar | Tool | หมายเหตุ |
|--------|------|---------|
| Metrics | Prometheus + Grafana (profile `monitoring`) | dashboard สำเร็จ: API latency, queue depth, DB, disk |
| Logs | โครงสร้าง JSON → stdout → Loki (หรือ `docker compose logs` เฉย ๆ ตอน dev) | ทุก log มี `trace_id` เดียวกับ error response |
| Tracing | OpenTelemetry SDK ใน api (export เปิดปิดได้) | เครื่องเดียว ยังไม่จำเป็น — ใส่ instrumentation ไว้ก่อน |
| Alerting | Grafana alert → email/LINE ของ admin ลูกค้า | ขั้นต่ำ: disk > 80%, backup fail, queue ค้าง, service down |
| Health | `/health` (liveness) + `/health/ready` (DB/Redis/MinIO) | ใช้ทั้ง compose healthcheck และหน้า status สำหรับ admin |

---

## 13. 📅 Implementation Roadmap

สอดคล้อง spec ข้อ 17 — ลำดับใน MVP เรียงตามที่ spec แนะนำ:

| Phase | ระยะเวลา | Deliverables | เกณฑ์สำเร็จ |
|-------|----------|-------------|------------|
| **Sprint 0** | 2 สัปดาห์ | Monorepo + compose รันครบทุก service + CI + migration template + auth (Keycloak) + RBAC + audit skeleton + seed | `docker compose up` แล้ว login ได้ audit ทำงาน |
| **MVP-A** | 6 สัปดาห์ | Schema หลัก + custom field + lookup + Asset/Location + import Excel + REST/OpenAPI + Web UI list/detail | เพิ่ม field ใหม่จากหน้า admin ได้โดยไม่ deploy |
| **MVP-B** | 6 สัปดาห์ | Meter + reading + validation + แผนที่ (bbox/cluster/หมุดสี) + GPS capture + Work order + state machine | prototype 100k จุด โหลด < 3 วิ บนเครื่องอ้างอิง |
| **MVP-C** | 4 สัปดาห์ | PWA offline + sync + conflict + reading route + PM ตามเวลา + dashboard + form builder | ช่างจริง 1 ทีมใช้แทนกระดาษครบ 1 รอบเดือน |
| **Phase 2** | +3 เดือน | PM ตามมิเตอร์, inventory เต็ม, approval, rule engine, webhook, report builder, MFA | ลูกค้ารายที่ 2 ขึ้นระบบโดยไม่แก้โค้ด core |
| **Phase 3** | +4 เดือน | External GNSS/RTK, IoT ingest, plugin architecture, multi-tenant เต็ม, K8s option | งาน sub-meter accuracy ได้ |

---

## 14. ⚠️ Risk & Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| เครื่องเดียว = single point of failure (availability 99.5% ท้าทายถ้า disk พัง) | High | backup ออกนอกเครื่อง + restore runbook ที่ **ซ้อมจริงทุก release**; เสนอ option เครื่องสำรอง cold standby ให้ลูกค้าที่ critical |
| Offline sync conflict ซับซ้อนกว่าที่คิดเสมอ | High | จำกัด scope: conflict = เก็บ 2 ฝั่งให้คนตัดสินเท่านั้น (ไม่ทำ auto-merge); ทดสอบ sync ด้วย integration test ตั้งแต่ MVP-C สัปดาห์แรก; append-only tables ไม่มี conflict โดยธรรมชาติ |
| Custom field + configurable state machine ทำให้ query/report ยาก | Medium | จำกัดชนิด field ตาม spec (6 ชนิด); ทุก def มี validation; report builder อ่าน def เพื่อ generate query — ห้าม user เขียน SQL |
| Keycloak หนักเกินไปสำหรับเครื่องเล็ก | Medium | dev profile มี auth ในตัว (JWT ออกเอง); business logic ตรวจแค่ claims — สลับ IdP ได้ไม่แก้โค้ด |
| PWA ข้อจำกัด (storage quota, background GPS, external GNSS ไม่ได้) | Medium | ยอมรับใน MVP ตาม spec; business logic แยกจาก UI (packages/shared) เตรียมย้าย React Native ใน Phase 2-3 |
| Tile ไทย 10–30 GB ทำให้ "ติดตั้งครึ่งวัน" เสี่ยง | Medium | สคริปต์โหลด tile รันขนานกับขั้นตอนอื่น; มี fallback tile ระดับ zoom ต่ำ (~1 GB) ให้ใช้ได้ทันที แล้วค่อยโหลดเต็มพื้นหลัง |
| Scope creep กัดกิน "สิ่งที่จงใจไม่ทำ" | High | ทุก feature ใหม่ต้องอ้าง EAM-code ใน spec; ถ้าไม่มี → เข้า process ถาม "ทำเป็น config ได้ไหม" ตามข้อ 11 ของ spec |
| ข้อมูล PDPA บนเครื่องลูกค้า (เราไม่ได้คุม infra) | Medium | install guide ระบุ requirement: disk encryption, การจำกัดสิทธิ์เข้าเครื่อง, retention เป็นความรับผิดชอบร่วม — เขียนใน SLA/สัญญา |

---

## ภาคผนวก: การตัดสินใจที่ปิดแล้ว (จากคำถามเปิดใน spec ข้อ 18)

| คำถามใน spec | คำตอบใน design นี้ | เหตุผล |
|---|---|---|
| Multi-tenant? | ใส่ `tenant_id` ทุกตารางตั้งแต่วันแรก แต่รัน single-tenant บน local | ย้อนกลับมาทำทีหลังแพงมาก; local install = 1 tenant อยู่แล้ว |
| On-prem หรือ SaaS? | **On-prem/local ก่อน** (โจทย์ข้อนี้) — สถาปัตยกรรม stateless พร้อมยกขึ้น cloud/K8s | ตลาดเป้าหมายคือองค์กรที่ระบบใหญ่เข้าไม่ถึง |
| ขนาดข้อมูล? | ออกแบบที่ 100k จุด / 1M แถว ตาม NFR — partition รายเดือนเผื่อโตกว่านั้น | ตรงเกณฑ์ spec โดยไม่ over-engineer |
| Mobile: PWA หรือ Native? | PWA ใน MVP, logic แยกใน `packages/shared` | ตามคำแนะนำ spec ข้อ 10 |
| เกณฑ์ accuracy พิกัด? | default: เตือนเมื่อ > 10 ม., ปฏิเสธเมื่อ > 15 ม. — **config ได้ต่อ org** | spec บอกให้เป็นตัวเลข + หลัก config ก่อน code |
