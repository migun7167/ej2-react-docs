import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiError, CurrentUser, User, nextCursor, parsePage } from './common';
import { AuditService } from './audit.service';
import { CustomFieldService } from './custom-field.service';
import { DbService, TENANT_ID } from './db.service';
import { GeoService } from './geo.controller';

@Controller('api/v1/assets')
export class AssetsController {
  constructor(
    private readonly db: DbService,
    private readonly audit: AuditService,
    private readonly cf: CustomFieldService,
    private readonly geo: GeoService,
  ) {}

  @Get()
  async list(@Query() q: any) {
    const { limit, afterTs, afterId } = parsePage(q);
    const params: any[] = [TENANT_ID];
    const where: string[] = ['a.tenant_id = $1', 'a.deleted_at IS NULL'];
    if (q['filter[status]']) {
      params.push(q['filter[status]']);
      where.push(`a.status_code = $${params.length}`);
    }
    if (q['filter[type]']) {
      params.push(q['filter[type]']);
      where.push(`t.code = $${params.length}`);
    }
    if (q.q) {
      params.push(`%${q.q}%`);
      where.push(`(a.code ILIKE $${params.length} OR a.name ILIKE $${params.length})`);
    }
    if (afterTs) {
      params.push(afterTs, afterId);
      where.push(`(a.created_at, a.id) < ($${params.length - 1}, $${params.length})`);
    }
    params.push(limit);
    const rows = await this.db.query(
      `SELECT a.id, a.code, a.name, a.status_code, a.criticality, a.custom_fields,
              a.created_at, a.updated_at, a.row_version,
              t.code AS type_code, t.name_th AS type_name, t.color AS type_color,
              l.name AS location_name
       FROM core.asset a
       LEFT JOIN core.asset_type t ON t.id = a.asset_type_id
       LEFT JOIN core.location l ON l.id = a.location_id
       WHERE ${where.join(' AND ')}
       ORDER BY a.created_at DESC, a.id DESC
       LIMIT $${params.length}`,
      params,
    );
    return { data: rows, page: { next_cursor: nextCursor(rows, limit) } };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const asset = await this.db.one(
      `SELECT a.*, t.code AS type_code, t.name_th AS type_name, l.name AS location_name
       FROM core.asset a
       LEFT JOIN core.asset_type t ON t.id = a.asset_type_id
       LEFT JOIN core.location l ON l.id = a.location_id
       WHERE a.tenant_id = $1 AND a.id = $2 AND a.deleted_at IS NULL`,
      [TENANT_ID, id],
    );
    if (!asset) throw new ApiError(404, 'NOT_FOUND', 'asset not found');
    const [meters, point, fieldDefs] = await Promise.all([
      this.db.query(
        `SELECT id, code, name, meter_type_code, reading_kind, unit, last_reading, last_reading_at
         FROM core.meter WHERE tenant_id = $1 AND asset_id = $2 AND deleted_at IS NULL`,
        [TENANT_ID, id],
      ),
      this.geo.currentPoint('asset', id),
      this.cf.defs('asset', asset.asset_type_id),
    ]);
    return { ...asset, meters, geo: point, field_defs: fieldDefs };
  }

  @Get(':id/timeline')
  async timeline(@Param('id') id: string) {
    // ประวัติรวม (EAM-AST-008): ใบงาน + ค่าอ่าน + การแก้ไข
    const rows = await this.db.query(
      `SELECT * FROM (
         SELECT 'work_order' AS kind, w.created_at AS at,
                jsonb_build_object('code', w.code, 'title', w.title, 'status', w.status_code) AS detail
         FROM core.work_order w
         WHERE w.tenant_id = $1 AND w.asset_id = $2 AND w.deleted_at IS NULL
         UNION ALL
         SELECT 'meter_reading', r.reading_at,
                jsonb_build_object('meter', m.code, 'value', r.value, 'unit', m.unit)
         FROM core.meter_reading r
         JOIN core.meter m ON m.id = r.meter_id
         WHERE r.tenant_id = $1 AND m.asset_id = $2
         UNION ALL
         SELECT 'audit', g.created_at,
                jsonb_build_object('action', g.action, 'changes', g.changes)
         FROM audit.audit_log g
         WHERE g.tenant_id = $1 AND g.entity_type = 'asset' AND g.entity_id = $2
       ) x ORDER BY at DESC LIMIT 200`,
      [TENANT_ID, id],
    );
    return { data: rows };
  }

  @Post()
  async create(@Body() body: any, @User() user: CurrentUser) {
    if (!body.code || !body.name)
      throw new ApiError(400, 'VALIDATION', 'code และ name จำเป็น', !body.code ? 'code' : 'name');
    let typeId: string | null = null;
    if (body.type_code) {
      const t = await this.db.one(
        `SELECT id FROM core.asset_type WHERE tenant_id = $1 AND code = $2 AND deleted_at IS NULL`,
        [TENANT_ID, body.type_code],
      );
      if (!t) throw new ApiError(400, 'BAD_TYPE', `ไม่มีประเภท ${body.type_code}`, 'type_code');
      typeId = t.id;
    }
    await this.cf.validate('asset', typeId, body.custom_fields ?? {});
    const row = await this.db.one(
      `INSERT INTO core.asset (tenant_id, code, name, asset_type_id, location_id, status_code,
                               criticality, custom_fields, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'active'), COALESCE($7, 3), $8, $9, $9)
       RETURNING *`,
      [TENANT_ID, body.code, body.name, typeId, body.location_id ?? null, body.status_code,
       body.criticality, JSON.stringify(body.custom_fields ?? {}), user.id],
    );
    // สร้างพร้อมพิกัดในขั้นตอนเดียว (EAM-GEO-036)
    if (body.geo?.lat != null && body.geo?.lng != null) {
      await this.geo.addPoint('asset', row.id, body.geo, user.id);
    }
    await this.audit.log('asset', row.id, 'create', { code: body.code, name: body.name }, user.id);
    return row;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @User() user: CurrentUser) {
    const before = await this.db.one(
      `SELECT * FROM core.asset WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`,
      [TENANT_ID, id],
    );
    if (!before) throw new ApiError(404, 'NOT_FOUND', 'asset not found');
    if (body.row_version !== before.row_version)
      throw new ApiError(409, 'VERSION_CONFLICT', 'ข้อมูลถูกแก้โดยคนอื่นแล้ว โหลดใหม่ก่อนแก้');
    if (body.custom_fields)
      await this.cf.validate('asset', before.asset_type_id, body.custom_fields);

    const patch: Record<string, any> = {};
    for (const k of ['name', 'status_code', 'criticality', 'location_id']) {
      if (body[k] !== undefined) patch[k] = body[k];
    }
    if (body.custom_fields)
      patch.custom_fields = { ...before.custom_fields, ...body.custom_fields };

    const sets = Object.keys(patch).map((k, i) => `${k} = $${i + 3}`);
    const row = await this.db.one(
      `UPDATE core.asset SET ${sets.join(', ')},
              updated_at = now(), updated_by = $2, row_version = row_version + 1
       WHERE tenant_id = $1 AND id = $${sets.length + 3} RETURNING *`,
      [TENANT_ID, user.id,
       ...Object.values(patch).map((v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : v)),
       id],
    );
    await this.audit.log('asset', id, 'update', this.audit.diff(before, patch), user.id);
    return row;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User() user: CurrentUser) {
    const row = await this.db.one(
      `UPDATE core.asset SET deleted_at = now(), updated_by = $2
       WHERE tenant_id = $1 AND id = $3 AND deleted_at IS NULL RETURNING id`,
      [TENANT_ID, user.id, id],
    );
    if (!row) throw new ApiError(404, 'NOT_FOUND', 'asset not found');
    await this.audit.log('asset', id, 'delete', {}, user.id);
    return { deleted: true };
  }
}

@Controller('api/v1/asset-types')
export class AssetTypesController {
  constructor(private readonly db: DbService) {}

  @Get()
  async list() {
    return {
      data: await this.db.query(
        `SELECT id, code, name_th, name_en, icon, color FROM core.asset_type
         WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY code`,
        [TENANT_ID],
      ),
    };
  }
}

@Controller('api/v1/locations')
export class LocationsController {
  constructor(private readonly db: DbService, private readonly audit: AuditService) {}

  @Get()
  async list() {
    // ส่ง flat list (มี parent_id/path) — client ประกอบ tree เอง
    return {
      data: await this.db.query(
        `SELECT id, parent_id, path, code, name FROM core.location
         WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY path`,
        [TENANT_ID],
      ),
    };
  }

  @Post()
  async create(@Body() body: any, @User() user: CurrentUser) {
    if (!body.code || !body.name || !body.site_id)
      throw new ApiError(400, 'VALIDATION', 'code, name, site_id จำเป็น');
    let parentPath = '';
    if (body.parent_id) {
      const p = await this.db.one(
        `SELECT path FROM core.location WHERE tenant_id = $1 AND id = $2`,
        [TENANT_ID, body.parent_id],
      );
      if (!p) throw new ApiError(400, 'BAD_PARENT', 'parent not found', 'parent_id');
      parentPath = p.path;
    }
    const row = await this.db.one(
      `INSERT INTO core.location (tenant_id, site_id, parent_id, code, name, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *`,
      [TENANT_ID, body.site_id, body.parent_id ?? null, body.code, body.name, user.id],
    );
    await this.db.query(`UPDATE core.location SET path = $1 WHERE id = $2`,
      [`${parentPath}/${row.id}`, row.id]);
    await this.audit.log('location', row.id, 'create', { code: body.code }, user.id);
    return row;
  }
}
