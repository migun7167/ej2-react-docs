-- EAM Platform — demo seed (idempotent: รันซ้ำได้)
-- tenant เดียว: 00000000-0000-0000-0000-000000000001

DO $$
DECLARE
  t     uuid := '00000000-0000-0000-0000-000000000001';
  admin uuid := '00000000-0000-0000-0000-0000000000aa';
  org1  uuid; site1 uuid; team1 uuid;
  loc_plant uuid; loc_zone_a uuid; loc_zone_b uuid;
  ty_pump uuid; ty_transformer uuid; ty_water_meter uuid;
  wf    uuid;
  st_reported uuid; st_assigned uuid; st_progress uuid; st_done uuid; st_closed uuid; st_cancel uuid;
  jp1   uuid;
  a     uuid; m uuid;
  i     int;
  base_lat numeric := 13.7563; base_lon numeric := 100.5018;  -- กรุงเทพฯ
BEGIN
  IF EXISTS (SELECT 1 FROM core.organization WHERE tenant_id = t) THEN
    RAISE NOTICE 'seed already applied, skipping';
    RETURN;
  END IF;

  INSERT INTO core.organization (tenant_id, code, name, settings)
  VALUES (t, 'demo', 'องค์กรสาธิต (Demo Waterworks)',
          '{"gps_warn_m": 10, "gps_reject_m": 15}')
  RETURNING id INTO org1;

  INSERT INTO core.site (tenant_id, org_id, code, name)
  VALUES (t, org1, 'HQ', 'สำนักงานใหญ่') RETURNING id INTO site1;

  INSERT INTO core.team (tenant_id, code, name)
  VALUES (t, 'field-1', 'ทีมภาคสนาม 1') RETURNING id INTO team1;

  INSERT INTO core.app_user (id, tenant_id, username, display_name, email, role_code, team_id) VALUES
    (admin, t, 'admin', 'ผู้ดูแลระบบ', 'admin@example.com', 'admin', NULL),
    (gen_random_uuid(), t, 'somchai', 'สมชาย ช่างภาคสนาม', 'somchai@example.com', 'technician', team1),
    (gen_random_uuid(), t, 'somsri', 'สมศรี หัวหน้างาน', 'somsri@example.com', 'supervisor', team1);

  -- ---------- lookups ----------
  INSERT INTO ext.lookup_type (tenant_id, code, name_th, name_en) VALUES
    (t, 'asset_status', 'สถานะสินทรัพย์', 'Asset status'),
    (t, 'meter_type',   'ประเภทมิเตอร์',  'Meter type'),
    (t, 'wo_type',      'ประเภทงาน',     'Work order type'),
    (t, 'wo_priority',  'ความเร่งด่วน',   'Priority'),
    (t, 'user_role',    'บทบาทผู้ใช้',    'User role');

  INSERT INTO ext.lookup_value (tenant_id, type_code, code, name_th, name_en, color, sort_order) VALUES
    (t, 'asset_status', 'active',   'ใช้งาน',    'Active',         '#16a34a', 1),
    (t, 'asset_status', 'stopped',  'หยุดใช้',   'Stopped',        '#f59e0b', 2),
    (t, 'asset_status', 'repair',   'รอซ่อม',    'Awaiting repair','#dc2626', 3),
    (t, 'asset_status', 'retired',  'ปลดระวาง',  'Retired',        '#6b7280', 4),
    (t, 'meter_type',   'water',    'มิเตอร์น้ำ', 'Water',          '#0ea5e9', 1),
    (t, 'meter_type',   'electric', 'มิเตอร์ไฟ',  'Electric',       '#eab308', 2),
    (t, 'meter_type',   'runtime',  'ชั่วโมงเดินเครื่อง', 'Runtime hours', '#8b5cf6', 3),
    (t, 'meter_type',   'pressure', 'แรงดัน',     'Pressure',       '#ec4899', 4),
    (t, 'wo_type',      'cm',       'ซ่อมแก้ไข',  'Corrective',     '#dc2626', 1),
    (t, 'wo_type',      'pm',       'บำรุงรักษา', 'Preventive',     '#16a34a', 2),
    (t, 'wo_type',      'inspect',  'ตรวจสอบ',   'Inspection',     '#0ea5e9', 3),
    (t, 'wo_priority',  'urgent',   'ด่วนมาก',   'Urgent',         '#dc2626', 1),
    (t, 'wo_priority',  'high',     'ด่วน',      'High',           '#f59e0b', 2),
    (t, 'wo_priority',  'normal',   'ปกติ',      'Normal',         '#0ea5e9', 3),
    (t, 'wo_priority',  'low',      'ต่ำ',       'Low',            '#6b7280', 4),
    (t, 'user_role',    'admin',      'ผู้ดูแลระบบ', 'Admin',       NULL, 1),
    (t, 'user_role',    'supervisor', 'หัวหน้างาน',  'Supervisor',  NULL, 2),
    (t, 'user_role',    'technician', 'ช่าง',       'Technician',   NULL, 3);

  -- ---------- workflow: work_order ----------
  INSERT INTO ext.wf_definition (tenant_id, code, entity, name)
  VALUES (t, 'wo-default', 'work_order', 'Work order default flow') RETURNING id INTO wf;

  INSERT INTO ext.wf_state (wf_id, code, name_th, name_en, color, is_initial, is_terminal, sort_order) VALUES
    (wf, 'reported',    'แจ้งงาน',     'Reported',    '#6b7280', true,  false, 1),
    (wf, 'assigned',    'มอบหมายแล้ว', 'Assigned',    '#0ea5e9', false, false, 2),
    (wf, 'in_progress', 'กำลังทำ',     'In progress', '#f59e0b', false, false, 3),
    (wf, 'completed',   'ทำเสร็จแล้ว', 'Completed',   '#16a34a', false, false, 4),
    (wf, 'closed',      'ปิดงาน',      'Closed',      '#374151', false, true,  5),
    (wf, 'cancelled',   'ยกเลิก',      'Cancelled',   '#9ca3af', false, true,  6);

  SELECT id INTO st_reported FROM ext.wf_state WHERE wf_id = wf AND code = 'reported';
  SELECT id INTO st_assigned FROM ext.wf_state WHERE wf_id = wf AND code = 'assigned';
  SELECT id INTO st_progress FROM ext.wf_state WHERE wf_id = wf AND code = 'in_progress';
  SELECT id INTO st_done     FROM ext.wf_state WHERE wf_id = wf AND code = 'completed';
  SELECT id INTO st_closed   FROM ext.wf_state WHERE wf_id = wf AND code = 'closed';
  SELECT id INTO st_cancel   FROM ext.wf_state WHERE wf_id = wf AND code = 'cancelled';

  INSERT INTO ext.wf_transition (wf_id, from_state_id, to_state_id, name_th, name_en, required_role, sort_order) VALUES
    (wf, st_reported, st_assigned, 'มอบหมาย',   'Assign',   'supervisor', 1),
    (wf, st_reported, st_cancel,   'ยกเลิก',    'Cancel',   'supervisor', 2),
    (wf, st_assigned, st_progress, 'เริ่มงาน',   'Start',    NULL, 1),
    (wf, st_assigned, st_cancel,   'ยกเลิก',    'Cancel',   'supervisor', 2),
    (wf, st_progress, st_done,     'ทำเสร็จ',   'Complete', NULL, 1),
    (wf, st_done,     st_closed,   'ปิดงาน',    'Close',    'supervisor', 1),
    (wf, st_done,     st_progress, 'ตีกลับ',    'Reopen',   'supervisor', 2);

  -- ---------- locations ----------
  INSERT INTO core.location (tenant_id, site_id, code, name, path)
  VALUES (t, site1, 'PLANT', 'โรงสูบน้ำหลัก', '') RETURNING id INTO loc_plant;
  UPDATE core.location SET path = '/' || loc_plant WHERE id = loc_plant;

  INSERT INTO core.location (tenant_id, site_id, parent_id, code, name, path)
  VALUES (t, site1, loc_plant, 'ZONE-A', 'โซน A', '/' || loc_plant) RETURNING id INTO loc_zone_a;
  UPDATE core.location SET path = path || '/' || loc_zone_a WHERE id = loc_zone_a;

  INSERT INTO core.location (tenant_id, site_id, parent_id, code, name, path)
  VALUES (t, site1, loc_plant, 'ZONE-B', 'โซน B', '/' || loc_plant) RETURNING id INTO loc_zone_b;
  UPDATE core.location SET path = path || '/' || loc_zone_b WHERE id = loc_zone_b;

  -- ---------- asset types + custom fields ต่อประเภท (EAM-EXT-002) ----------
  INSERT INTO core.asset_type (tenant_id, code, name_th, name_en, icon, color)
  VALUES (t, 'pump', 'เครื่องสูบน้ำ', 'Pump', 'pump', '#0ea5e9') RETURNING id INTO ty_pump;
  INSERT INTO core.asset_type (tenant_id, code, name_th, name_en, icon, color)
  VALUES (t, 'transformer', 'หม้อแปลง', 'Transformer', 'bolt', '#eab308') RETURNING id INTO ty_transformer;
  INSERT INTO core.asset_type (tenant_id, code, name_th, name_en, icon, color)
  VALUES (t, 'water-meter', 'มาตรวัดน้ำ', 'Water meter', 'gauge', '#16a34a') RETURNING id INTO ty_water_meter;

  INSERT INTO ext.custom_field_def (tenant_id, entity, asset_type_id, field_key, label_th, label_en, field_type, required, options, rules, sort_order) VALUES
    (t, 'asset', ty_pump, 'rated_kw',   'กำลังมอเตอร์ (kW)', 'Rated power (kW)', 'number', true,  '[]', '{"min": 0, "max": 5000}', 1),
    (t, 'asset', ty_pump, 'pump_kind',  'ชนิดปั๊ม',          'Pump kind',        'dropdown', false,
       '["centrifugal","submersible","booster"]', '{}', 2),
    (t, 'asset', ty_transformer, 'kva', 'ขนาด (kVA)',        'Rating (kVA)',     'number', true, '[]', '{"min": 0}', 1),
    (t, 'asset', NULL, 'install_date',  'วันที่ติดตั้ง',      'Install date',     'date',  false, '[]', '{}', 10);

  -- ---------- assets + meters + geo (จุดสาธิตรอบกรุงเทพฯ) ----------
  FOR i IN 1..12 LOOP
    INSERT INTO core.asset (tenant_id, location_id, asset_type_id, code, name, status_code, criticality, custom_fields, created_by)
    VALUES (t,
            CASE WHEN i % 2 = 0 THEN loc_zone_a ELSE loc_zone_b END,
            CASE WHEN i <= 6 THEN ty_pump WHEN i <= 9 THEN ty_transformer ELSE ty_water_meter END,
            'AST-' || to_char(i, 'FM0000'),
            CASE WHEN i <= 6 THEN 'เครื่องสูบน้ำ #' || i
                 WHEN i <= 9 THEN 'หม้อแปลง #' || (i - 6)
                 ELSE 'มาตรวัดน้ำเขต ' || (i - 9) END,
            CASE WHEN i = 4 THEN 'repair' ELSE 'active' END,
            CASE WHEN i <= 6 THEN 2 ELSE 3 END,
            CASE WHEN i <= 6 THEN jsonb_build_object('rated_kw', 15 + i * 5, 'pump_kind', 'centrifugal')
                 WHEN i <= 9 THEN jsonb_build_object('kva', 250)
                 ELSE '{}'::jsonb END,
            admin)
    RETURNING id INTO a;

    INSERT INTO geo.geo_point (tenant_id, entity_type, entity_id, geom, accuracy_m, source, captured_by)
    VALUES (t, 'asset', a,
            ST_SetSRID(ST_MakePoint(base_lon + (i % 4) * 0.012 - 0.018,
                                    base_lat + (i / 4.0) * 0.010 - 0.015), 4326)::geography,
            3 + (i % 5), 'gps', admin);

    INSERT INTO core.meter (tenant_id, asset_id, code, name, meter_type_code, reading_kind, unit, rollover_value, created_by)
    VALUES (t, a,
            'MTR-' || to_char(i, 'FM0000'),
            CASE WHEN i <= 6 THEN 'ชั่วโมงเดินเครื่อง ' ELSE 'มิเตอร์ ' END || 'AST-' || to_char(i, 'FM0000'),
            CASE WHEN i <= 6 THEN 'runtime' WHEN i <= 9 THEN 'electric' ELSE 'water' END,
            'cumulative',
            CASE WHEN i <= 6 THEN 'hr' WHEN i <= 9 THEN 'kWh' ELSE 'm3' END,
            999999, admin)
    RETURNING id INTO m;

    INSERT INTO geo.geo_point (tenant_id, entity_type, entity_id, geom, accuracy_m, source, captured_by)
    SELECT t, 'meter', m, g.geom, g.accuracy_m, 'gps', admin
    FROM geo.geo_point g WHERE g.entity_id = a AND g.entity_type = 'asset';

    -- ค่าอ่านย้อนหลัง 3 งวด
    INSERT INTO core.meter_reading (tenant_id, meter_id, value, delta, reading_at, reader_id)
    VALUES
      (t, m, 1000 + i * 100, NULL,        now() - interval '60 days', admin),
      (t, m, 1150 + i * 100, 150,         now() - interval '30 days', admin),
      (t, m, 1320 + i * 100, 170,         now() - interval '2 days',  admin);
    UPDATE core.meter SET last_reading = 1320 + i * 100, last_reading_at = now() - interval '2 days'
    WHERE id = m;
  END LOOP;

  -- ---------- job plan + PM schedule ----------
  INSERT INTO core.job_plan (tenant_id, code, name, description)
  VALUES (t, 'JP-PUMP-M', 'บำรุงรักษาปั๊มรายเดือน', 'ตรวจสภาพ อัดจาระบี ตรวจ seal')
  RETURNING id INTO jp1;
  INSERT INTO core.job_plan_task (job_plan_id, seq, name, std_minutes) VALUES
    (jp1, 1, 'ตรวจเสียง/ความสั่นสะเทือน', 15),
    (jp1, 2, 'อัดจาระบีลูกปืน', 20),
    (jp1, 3, 'ตรวจรอยรั่ว mechanical seal', 15),
    (jp1, 4, 'บันทึกชั่วโมงเดินเครื่อง', 5);

  INSERT INTO core.pm_schedule (tenant_id, code, name, asset_id, job_plan_id, schedule_type, interval_days, lead_time_days, next_due_date)
  SELECT t, 'PM-' || a2.code, 'PM รายเดือน ' || a2.name, a2.id, jp1, 'time', 30, 7, current_date + 3
  FROM core.asset a2 WHERE a2.tenant_id = t AND a2.asset_type_id = ty_pump LIMIT 3;

  -- ---------- work orders ตัวอย่าง ----------
  INSERT INTO core.work_order (tenant_id, title, description, wo_type_code, priority_code, wf_id, status_code, asset_id, due_date, created_by)
  SELECT t, 'ปั๊มมีเสียงดังผิดปกติ', 'เสียงดังจากชุดลูกปืน ตรวจพบระหว่างเดินตรวจ', 'cm', 'high',
         wf, 'reported', a3.id, current_date + 2, admin
  FROM core.asset a3 WHERE a3.tenant_id = t AND a3.code = 'AST-0004';

  INSERT INTO core.work_order (tenant_id, title, wo_type_code, priority_code, wf_id, status_code, asset_id, due_date, created_by)
  SELECT t, 'เปลี่ยนน้ำมันเกียร์ตามรอบ', 'pm', 'normal', wf, 'assigned', a4.id, current_date + 5, admin
  FROM core.asset a4 WHERE a4.tenant_id = t AND a4.code = 'AST-0002';

  -- ---------- inventory ----------
  INSERT INTO core.storeroom (tenant_id, site_id, code, name)
  VALUES (t, site1, 'MAIN', 'คลังหลัก');
  INSERT INTO core.inventory_item (tenant_id, code, name, unit, reorder_point) VALUES
    (t, 'SP-0001', 'ลูกปืน 6205ZZ', 'ea', 4),
    (t, 'SP-0002', 'Mechanical seal 1.5"', 'ea', 2),
    (t, 'SP-0003', 'จาระบีทนความร้อน', 'kg', 5);
  INSERT INTO core.stock_balance (item_id, storeroom_id, qty)
  SELECT it.id, sr.id, 10 FROM core.inventory_item it, core.storeroom sr
  WHERE it.tenant_id = t AND sr.tenant_id = t;

  RAISE NOTICE 'seed complete';
END $$;
