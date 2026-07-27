-- EAM Platform — initial schema
-- กฎ: ทุกตารางมี id/tenant_id/created_*/updated_*/deleted_at/row_version/custom_fields
--      soft delete เท่านั้น, transaction tables เป็น append-only

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS ext;
CREATE SCHEMA IF NOT EXISTS geo;
CREATE SCHEMA IF NOT EXISTS audit;

-- =========================================================================
-- ext — extensibility (lookup, custom field, workflow) : first-class citizens
-- =========================================================================

CREATE TABLE ext.lookup_type (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL,
  code         text NOT NULL,              -- เช่น asset_status, wo_priority, meter_type
  name_th      text NOT NULL,
  name_en      text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid,
  deleted_at   timestamptz,
  UNIQUE (tenant_id, code)
);

CREATE TABLE ext.lookup_value (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL,
  type_code    text NOT NULL,
  code         text NOT NULL,
  name_th      text NOT NULL,
  name_en      text NOT NULL,
  color        text,                       -- สีหมุดบนแผนที่ / ป้ายสถานะ (EAM-GEO-012)
  icon         text,
  sort_order   int NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid,
  deleted_at   timestamptz,
  UNIQUE (tenant_id, type_code, code)
);

CREATE TABLE ext.custom_field_def (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,
  entity        text NOT NULL CHECK (entity IN ('asset','work_order','meter','location')),
  asset_type_id uuid,                      -- null = ใช้กับทุกประเภท
  field_key     text NOT NULL,
  label_th      text NOT NULL,
  label_en      text NOT NULL,
  field_type    text NOT NULL CHECK (field_type IN ('text','number','date','dropdown','checkbox','file')),
  required      boolean NOT NULL DEFAULT false,
  options       jsonb NOT NULL DEFAULT '[]',   -- สำหรับ dropdown
  rules         jsonb NOT NULL DEFAULT '{}',   -- เช่น {"min":0,"max":100}
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    uuid,
  deleted_at    timestamptz,
  UNIQUE (tenant_id, entity, field_key)
);

-- state machine เป็นข้อมูล ไม่ใช่โค้ด (EAM-EXT-004)
CREATE TABLE ext.wf_definition (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL,
  code       text NOT NULL,
  entity     text NOT NULL,                -- work_order
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, code)
);

CREATE TABLE ext.wf_state (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wf_id       uuid NOT NULL REFERENCES ext.wf_definition(id),
  code        text NOT NULL,
  name_th     text NOT NULL,
  name_en     text NOT NULL,
  color       text,
  is_initial  boolean NOT NULL DEFAULT false,
  is_terminal boolean NOT NULL DEFAULT false,
  sort_order  int NOT NULL DEFAULT 0,
  UNIQUE (wf_id, code)
);

CREATE TABLE ext.wf_transition (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wf_id         uuid NOT NULL REFERENCES ext.wf_definition(id),
  from_state_id uuid NOT NULL REFERENCES ext.wf_state(id),
  to_state_id   uuid NOT NULL REFERENCES ext.wf_state(id),
  name_th       text NOT NULL,
  name_en       text NOT NULL,
  required_role text,                      -- null = ทุก role
  sort_order    int NOT NULL DEFAULT 0,
  UNIQUE (wf_id, from_state_id, to_state_id)
);

-- =========================================================================
-- core
-- =========================================================================

CREATE TABLE core.organization (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  code        text NOT NULL,
  name        text NOT NULL,
  settings    jsonb NOT NULL DEFAULT '{}',  -- เช่น gps_warn_m, gps_reject_m
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE TABLE core.site (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  org_id      uuid NOT NULL REFERENCES core.organization(id),
  code        text NOT NULL,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  UNIQUE (tenant_id, code)
);

CREATE TABLE core.location (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  site_id     uuid NOT NULL REFERENCES core.site(id),
  parent_id   uuid REFERENCES core.location(id),
  path        text NOT NULL DEFAULT '',    -- materialized path เช่น /a/b/c
  code        text NOT NULL,
  name        text NOT NULL,
  custom_fields jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid,
  deleted_at  timestamptz,
  row_version int NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, code)
);
CREATE INDEX ix_location_path ON core.location (tenant_id, path text_pattern_ops);

CREATE TABLE core.asset_type (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  code        text NOT NULL,
  name_th     text NOT NULL,
  name_en     text NOT NULL,
  icon        text,
  color       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  UNIQUE (tenant_id, code)
);

CREATE TABLE core.asset (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,
  parent_id     uuid REFERENCES core.asset(id),
  path          text NOT NULL DEFAULT '',
  location_id   uuid REFERENCES core.location(id),
  asset_type_id uuid REFERENCES core.asset_type(id),
  code          text NOT NULL,
  name          text NOT NULL,
  status_code   text NOT NULL DEFAULT 'active',   -- lookup: asset_status
  criticality   int NOT NULL DEFAULT 3 CHECK (criticality BETWEEN 1 AND 5),
  owner_id      uuid,
  custom_fields jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    uuid,
  deleted_at    timestamptz,
  row_version   int NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, code)
);
CREATE INDEX ix_asset_status   ON core.asset (tenant_id, status_code) WHERE deleted_at IS NULL;
CREATE INDEX ix_asset_type     ON core.asset (tenant_id, asset_type_id) WHERE deleted_at IS NULL;
CREATE INDEX ix_asset_location ON core.asset (tenant_id, location_id) WHERE deleted_at IS NULL;
CREATE INDEX ix_asset_cf       ON core.asset USING gin (custom_fields);

CREATE TABLE core.meter (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL,
  asset_id       uuid REFERENCES core.asset(id),
  location_id    uuid REFERENCES core.location(id),
  code           text NOT NULL,
  name           text NOT NULL,
  meter_type_code text NOT NULL,           -- lookup: meter_type (สี/ไอคอนอยู่ที่ lookup)
  reading_kind   text NOT NULL DEFAULT 'cumulative'
                 CHECK (reading_kind IN ('cumulative','gauge','characteristic')),
  unit           text NOT NULL DEFAULT '',
  rollover_value numeric,                  -- มิเตอร์วนกลับศูนย์ที่ค่านี้ (EAM-MTR-006)
  warn_limit     numeric,
  action_limit   numeric,
  last_reading   numeric,
  last_reading_at timestamptz,
  custom_fields  jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  updated_by     uuid,
  deleted_at     timestamptz,
  row_version    int NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, code),
  CHECK (asset_id IS NOT NULL OR location_id IS NOT NULL)
);
CREATE INDEX ix_meter_type ON core.meter (tenant_id, meter_type_code) WHERE deleted_at IS NULL;

-- append-only + partition รายเดือน (ตารางโตเร็วสุด) — DEFAULT partition รับค่าที่ยังไม่มี partition
CREATE TABLE core.meter_reading (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  meter_id    uuid NOT NULL,
  value       numeric NOT NULL,
  delta       numeric,                     -- ปริมาณใช้จากครั้งก่อน (คำนวณตอนบันทึก รวม rollover)
  reading_at  timestamptz NOT NULL,
  reader_id   uuid,
  photo_key   text,                        -- object key ใน MinIO
  status      text NOT NULL DEFAULT 'ok'
              CHECK (status IN ('ok','no_access','meter_broken','corrected')),
  note        text,
  source      text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','import','api')),
  is_rollover boolean NOT NULL DEFAULT false,
  supersedes_id uuid,                      -- แก้ค่า = แถวใหม่ชี้แถวเดิม (EAM-DM-005)
  created_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  PRIMARY KEY (id, reading_at)
) PARTITION BY RANGE (reading_at);
CREATE TABLE core.meter_reading_default PARTITION OF core.meter_reading DEFAULT;
CREATE INDEX ix_reading_meter ON core.meter_reading (tenant_id, meter_id, reading_at DESC);

CREATE TABLE core.job_plan (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  code        text NOT NULL,
  name        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  UNIQUE (tenant_id, code)
);

CREATE TABLE core.job_plan_task (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_plan_id uuid NOT NULL REFERENCES core.job_plan(id),
  seq         int NOT NULL,
  name        text NOT NULL,
  std_minutes int
);

CREATE TABLE core.pm_schedule (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL,
  code           text NOT NULL,
  name           text NOT NULL,
  asset_id       uuid REFERENCES core.asset(id),
  job_plan_id    uuid REFERENCES core.job_plan(id),
  schedule_type  text NOT NULL DEFAULT 'time' CHECK (schedule_type IN ('time','meter')),
  interval_days  int,                      -- time-based
  meter_id       uuid REFERENCES core.meter(id),   -- meter-based (Phase 2)
  interval_value numeric,
  lead_time_days int NOT NULL DEFAULT 7,   -- สร้างใบงานล่วงหน้ากี่วัน (EAM-PM-004)
  next_due_date  date,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz,
  row_version    int NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, code)
);

CREATE SEQUENCE core.wo_code_seq;

CREATE TABLE core.work_order (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,
  code          text NOT NULL DEFAULT ('WO-' || to_char(nextval('core.wo_code_seq'), 'FM000000')),
  title         text NOT NULL,
  description   text,
  wo_type_code  text NOT NULL DEFAULT 'cm',       -- lookup: wo_type
  priority_code text NOT NULL DEFAULT 'normal',   -- lookup: wo_priority
  wf_id         uuid NOT NULL REFERENCES ext.wf_definition(id),
  status_code   text NOT NULL,                    -- ต้องเป็น state ใน wf
  asset_id      uuid REFERENCES core.asset(id),
  location_id   uuid REFERENCES core.location(id),
  assigned_to   uuid,
  team_id       uuid,
  due_date      date,
  source        text NOT NULL DEFAULT 'manual'
                CHECK (source IN ('manual','pm','inspection','meter')),
  pm_schedule_id uuid REFERENCES core.pm_schedule(id),
  pm_due_date   date,                             -- คู่ unique กันสร้างซ้ำ (idempotent)
  custom_fields jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    uuid,
  deleted_at    timestamptz,
  row_version   int NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, code)
);
CREATE UNIQUE INDEX ux_wo_pm ON core.work_order (pm_schedule_id, pm_due_date)
  WHERE pm_schedule_id IS NOT NULL;
CREATE INDEX ix_wo_status ON core.work_order (tenant_id, status_code) WHERE deleted_at IS NULL;
CREATE INDEX ix_wo_cf     ON core.work_order USING gin (custom_fields);

CREATE TABLE core.work_task (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES core.work_order(id),
  seq           int NOT NULL,
  name          text NOT NULL,
  is_done       boolean NOT NULL DEFAULT false,
  done_by       uuid,
  done_at       timestamptz
);

-- append-only
CREATE TABLE core.work_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,
  work_order_id uuid NOT NULL REFERENCES core.work_order(id),
  action        text NOT NULL,             -- transition / note / labor / material
  detail        jsonb NOT NULL DEFAULT '{}',
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid
);
CREATE INDEX ix_worklog_wo ON core.work_log (work_order_id, created_at);

CREATE TABLE core.storeroom (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL,
  site_id    uuid REFERENCES core.site(id),
  code       text NOT NULL,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, code)
);

CREATE TABLE core.inventory_item (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  code        text NOT NULL,
  name        text NOT NULL,
  unit        text NOT NULL DEFAULT 'ea',
  reorder_point numeric,
  custom_fields jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  row_version int NOT NULL DEFAULT 1,
  UNIQUE (tenant_id, code)
);

CREATE TABLE core.stock_balance (
  item_id      uuid NOT NULL REFERENCES core.inventory_item(id),
  storeroom_id uuid NOT NULL REFERENCES core.storeroom(id),
  qty          numeric NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, storeroom_id)
);

-- append-only
CREATE TABLE core.stock_transaction (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,
  item_id       uuid NOT NULL REFERENCES core.inventory_item(id),
  storeroom_id  uuid NOT NULL REFERENCES core.storeroom(id),
  txn_type      text NOT NULL CHECK (txn_type IN ('receive','issue','return','adjust','transfer')),
  qty           numeric NOT NULL,          -- + เข้า / - ออก
  work_order_id uuid REFERENCES core.work_order(id),
  ref_doc       text,                      -- เลขเอกสารภายนอก (EAM-INV-004)
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid
);

CREATE TABLE core.team (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL,
  code       text NOT NULL,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (tenant_id, code)
);

CREATE TABLE core.app_user (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL,
  username     text NOT NULL,
  display_name text NOT NULL,
  email        text,
  role_code    text NOT NULL DEFAULT 'technician',  -- lookup: user_role
  team_id      uuid REFERENCES core.team(id),
  external_id  text,                       -- sub จาก Keycloak เมื่อ AUTH_MODE=keycloak
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz,
  UNIQUE (tenant_id, username)
);

-- =========================================================================
-- geo — พิกัดแยกตาราง + ประวัติ (EAM-GEO-001..004)
-- =========================================================================

CREATE TABLE geo.geo_point (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,
  entity_type   text NOT NULL CHECK (entity_type IN ('asset','location','meter','work_order','meter_reading')),
  entity_id     uuid NOT NULL,
  geom          geography(Point,4326) NOT NULL,
  accuracy_m    numeric,
  sat_count     int,
  source        text NOT NULL DEFAULT 'gps' CHECK (source IN ('gps','manual','import')),
  captured_by   uuid,
  captured_at   timestamptz NOT NULL DEFAULT now(),
  superseded_by uuid,                      -- แก้พิกัด = แถวใหม่ แถวเก่าชี้มาที่มัน
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_geo_geom   ON geo.geo_point USING gist (geom);
CREATE INDEX ix_geo_entity ON geo.geo_point (tenant_id, entity_type, entity_id)
  WHERE superseded_by IS NULL;

-- =========================================================================
-- audit — append-only field-level log (EAM-SEC-004)
-- =========================================================================

CREATE TABLE audit.audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id   uuid NOT NULL,
  action      text NOT NULL CHECK (action IN ('create','update','delete','transition','login','login_failed')),
  changes     jsonb NOT NULL DEFAULT '{}',  -- {"field": {"from": .., "to": ..}}
  actor_id    uuid,
  channel     text NOT NULL DEFAULT 'web',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_audit_entity ON audit.audit_log (tenant_id, entity_type, entity_id, created_at DESC);

CREATE TABLE audit.sync_conflict (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL,
  entity_type   text NOT NULL,
  entity_id     uuid NOT NULL,
  client_version jsonb NOT NULL,           -- เก็บทั้งสองฝั่ง ให้คนตัดสิน (EAM-MOB-003)
  server_version jsonb NOT NULL,
  resolved      boolean NOT NULL DEFAULT false,
  resolved_by   uuid,
  resolved_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid
);

-- idempotency keys จาก PWA (เก็บ 48 ชม. — worker ลบทิ้ง)
CREATE TABLE audit.idempotency_key (
  key        uuid PRIMARY KEY,
  result     jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
