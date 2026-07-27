import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiError, CurrentUser, User } from './common';
import { AuditService } from './audit.service';
import { CustomFieldService } from './custom-field.service';
import { DbService, TENANT_ID } from './db.service';

/** config-ก่อน-code (EAM-PRN-003): lookup / custom field / workflow แก้ได้โดยไม่ deploy */
@Controller('api/v1/admin')
export class AdminController {
  constructor(
    private readonly db: DbService,
    private readonly audit: AuditService,
    private readonly cf: CustomFieldService,
  ) {}

  @Get('lookups')
  async lookups(@Query('type') type?: string) {
    const params: any[] = [TENANT_ID];
    let where = 'v.tenant_id = $1 AND v.deleted_at IS NULL';
    if (type) {
      params.push(type);
      where += ` AND v.type_code = $2`;
    }
    return {
      data: await this.db.query(
        `SELECT v.id, v.type_code, v.code, v.name_th, v.name_en, v.color, v.icon,
                v.sort_order, v.is_active
         FROM ext.lookup_value v WHERE ${where}
         ORDER BY v.type_code, v.sort_order`,
        params,
      ),
    };
  }

  @Post('lookups')
  async createLookup(@Body() body: any, @User() user: CurrentUser) {
    this.requireAdmin(user);
    for (const f of ['type_code', 'code', 'name_th', 'name_en'])
      if (!body[f]) throw new ApiError(400, 'VALIDATION', `${f} จำเป็น`, f);
    const row = await this.db.one(
      `INSERT INTO ext.lookup_value (tenant_id, type_code, code, name_th, name_en, color, icon, sort_order, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 0), $9)
       ON CONFLICT (tenant_id, type_code, code)
       DO UPDATE SET name_th = $4, name_en = $5, color = $6, icon = $7,
                     sort_order = COALESCE($8, ext.lookup_value.sort_order),
                     updated_at = now(), updated_by = $9, deleted_at = NULL
       RETURNING *`,
      [TENANT_ID, body.type_code, body.code, body.name_th, body.name_en,
       body.color ?? null, body.icon ?? null, body.sort_order, user.id],
    );
    await this.audit.log('lookup_value', row.id, 'update', { code: body.code }, user.id);
    return row;
  }

  @Get('custom-fields')
  async customFields(@Query('entity') entity?: string) {
    const params: any[] = [TENANT_ID];
    let where = 'd.tenant_id = $1 AND d.deleted_at IS NULL';
    if (entity) {
      params.push(entity);
      where += ' AND d.entity = $2';
    }
    return {
      data: await this.db.query(
        `SELECT d.*, t.code AS asset_type_code FROM ext.custom_field_def d
         LEFT JOIN core.asset_type t ON t.id = d.asset_type_id
         WHERE ${where} ORDER BY d.entity, d.sort_order`,
        params,
      ),
    };
  }

  @Post('custom-fields')
  async createCustomField(@Body() body: any, @User() user: CurrentUser) {
    this.requireAdmin(user);
    for (const f of ['entity', 'field_key', 'label_th', 'label_en', 'field_type'])
      if (!body[f]) throw new ApiError(400, 'VALIDATION', `${f} จำเป็น`, f);
    const row = await this.db.one(
      `INSERT INTO ext.custom_field_def
         (tenant_id, entity, asset_type_id, field_key, label_th, label_en, field_type,
          required, options, rules, sort_order, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, false), COALESCE($9, '[]'::jsonb),
               COALESCE($10, '{}'::jsonb), COALESCE($11, 0), $12)
       RETURNING *`,
      [TENANT_ID, body.entity, body.asset_type_id ?? null, body.field_key, body.label_th,
       body.label_en, body.field_type, body.required,
       JSON.stringify(body.options ?? []), JSON.stringify(body.rules ?? {}),
       body.sort_order, user.id],
    );
    this.cf.invalidate();
    await this.audit.log('custom_field_def', row.id, 'create', { field_key: body.field_key }, user.id);
    return row;
  }

  @Get('workflows')
  async workflows() {
    const defs = await this.db.query(
      `SELECT id, code, entity, name FROM ext.wf_definition
       WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [TENANT_ID],
    );
    for (const d of defs as any[]) {
      d.states = await this.db.query(
        `SELECT id, code, name_th, name_en, color, is_initial, is_terminal, sort_order
         FROM ext.wf_state WHERE wf_id = $1 ORDER BY sort_order`, [d.id]);
      d.transitions = await this.db.query(
        `SELECT sf.code AS from, st.code AS to, t.name_th, t.required_role
         FROM ext.wf_transition t
         JOIN ext.wf_state sf ON sf.id = t.from_state_id
         JOIN ext.wf_state st ON st.id = t.to_state_id
         WHERE t.wf_id = $1 ORDER BY t.sort_order`, [d.id]);
    }
    return { data: defs };
  }

  @Get('users')
  async users() {
    return {
      data: await this.db.query(
        `SELECT id, username, display_name, role_code FROM core.app_user
         WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY username`,
        [TENANT_ID],
      ),
    };
  }

  private requireAdmin(user: CurrentUser) {
    if (user.role_code !== 'admin')
      throw new ApiError(403, 'ADMIN_ONLY', 'ต้องเป็นผู้ดูแลระบบ');
  }
}

@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly db: DbService) {}

  @Get('summary')
  async summary() {
    const [wo, assets, readings, pm] = await Promise.all([
      this.db.one(
        `SELECT count(*) FILTER (WHERE NOT s.is_terminal) AS open,
                count(*) FILTER (WHERE NOT s.is_terminal AND w.due_date < current_date) AS overdue,
                count(*) FILTER (WHERE s.is_terminal AND w.updated_at >= date_trunc('month', now())) AS closed_this_month
         FROM core.work_order w
         JOIN ext.wf_state s ON s.wf_id = w.wf_id AND s.code = w.status_code
         WHERE w.tenant_id = $1 AND w.deleted_at IS NULL`,
        [TENANT_ID],
      ),
      this.db.one(
        `SELECT count(*) AS total,
                count(*) FILTER (WHERE status_code = 'repair') AS awaiting_repair
         FROM core.asset WHERE tenant_id = $1 AND deleted_at IS NULL`,
        [TENANT_ID],
      ),
      this.db.one(
        `SELECT count(*) AS this_month FROM core.meter_reading
         WHERE tenant_id = $1 AND reading_at >= date_trunc('month', now())`,
        [TENANT_ID],
      ),
      this.db.one(
        `SELECT count(*) AS due_7d FROM core.pm_schedule
         WHERE tenant_id = $1 AND deleted_at IS NULL AND is_active
           AND next_due_date <= current_date + 7`,
        [TENANT_ID],
      ),
    ]);
    return {
      work_orders: { open: +wo!.open, overdue: +wo!.overdue, closed_this_month: +wo!.closed_this_month },
      assets: { total: +assets!.total, awaiting_repair: +assets!.awaiting_repair },
      readings: { this_month: +readings!.this_month },
      pm: { due_7d: +pm!.due_7d },
    };
  }
}
