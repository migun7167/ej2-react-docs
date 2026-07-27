import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiError, CurrentUser, User, nextCursor, parsePage } from './common';
import { AuditService } from './audit.service';
import { DbService, TENANT_ID } from './db.service';

@Controller('api/v1/work-orders')
export class WorkOrdersController {
  constructor(private readonly db: DbService, private readonly audit: AuditService) {}

  @Get()
  async list(@Query() q: any) {
    const { limit, afterTs, afterId } = parsePage(q);
    const params: any[] = [TENANT_ID];
    const where = ['w.tenant_id = $1', 'w.deleted_at IS NULL'];
    if (q['filter[status]']) {
      params.push(q['filter[status]']);
      where.push(`w.status_code = $${params.length}`);
    }
    if (q['filter[assigned_to]']) {
      params.push(q['filter[assigned_to]']);
      where.push(`w.assigned_to = $${params.length}`);
    }
    if (afterTs) {
      params.push(afterTs, afterId);
      where.push(`(w.created_at, w.id) < ($${params.length - 1}, $${params.length})`);
    }
    params.push(limit);
    const rows = await this.db.query(
      `SELECT w.id, w.code, w.title, w.wo_type_code, w.priority_code, w.status_code,
              w.due_date, w.source, w.created_at, w.row_version,
              a.code AS asset_code, a.name AS asset_name,
              u.display_name AS assigned_name,
              s.name_th AS status_name, s.color AS status_color
       FROM core.work_order w
       LEFT JOIN core.asset a ON a.id = w.asset_id
       LEFT JOIN core.app_user u ON u.id = w.assigned_to
       LEFT JOIN ext.wf_state s ON s.wf_id = w.wf_id AND s.code = w.status_code
       WHERE ${where.join(' AND ')}
       ORDER BY w.created_at DESC, w.id DESC LIMIT $${params.length}`,
      params,
    );
    return { data: rows, page: { next_cursor: nextCursor(rows, limit) } };
  }

  @Get('views/kanban')
  async kanban() {
    const wf = await this.wfDefault();
    const states = await this.db.query(
      `SELECT code, name_th, color, is_terminal, sort_order FROM ext.wf_state
       WHERE wf_id = $1 ORDER BY sort_order`, [wf.id]);
    const wos = await this.db.query(
      `SELECT w.id, w.code, w.title, w.priority_code, w.status_code, w.due_date, w.row_version,
              a.code AS asset_code, u.display_name AS assigned_name,
              p.color AS priority_color, p.name_th AS priority_name
       FROM core.work_order w
       LEFT JOIN core.asset a ON a.id = w.asset_id
       LEFT JOIN core.app_user u ON u.id = w.assigned_to
       LEFT JOIN ext.lookup_value p
         ON p.tenant_id = w.tenant_id AND p.type_code = 'wo_priority' AND p.code = w.priority_code
       WHERE w.tenant_id = $1 AND w.deleted_at IS NULL
       ORDER BY w.due_date NULLS LAST, w.created_at DESC LIMIT 500`,
      [TENANT_ID],
    );
    return {
      columns: states.map((s) => ({
        ...s,
        items: wos.filter((w) => w.status_code === s.code),
      })),
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const wo = await this.db.one(
      `SELECT w.*, a.code AS asset_code, a.name AS asset_name, u.display_name AS assigned_name
       FROM core.work_order w
       LEFT JOIN core.asset a ON a.id = w.asset_id
       LEFT JOIN core.app_user u ON u.id = w.assigned_to
       WHERE w.tenant_id = $1 AND w.id = $2 AND w.deleted_at IS NULL`,
      [TENANT_ID, id],
    );
    if (!wo) throw new ApiError(404, 'NOT_FOUND', 'work order not found');
    const [tasks, logs, transitions] = await Promise.all([
      this.db.query(
        `SELECT id, seq, name, is_done, done_at FROM core.work_task
         WHERE work_order_id = $1 ORDER BY seq`, [id]),
      this.db.query(
        `SELECT l.action, l.detail, l.note, l.created_at, u.display_name AS by_name
         FROM core.work_log l LEFT JOIN core.app_user u ON u.id = l.created_by
         WHERE l.work_order_id = $1 ORDER BY l.created_at DESC LIMIT 100`, [id]),
      this.availableTransitions(wo.wf_id, wo.status_code),
    ]);
    return { ...wo, tasks, logs, transitions };
  }

  @Post()
  async create(@Body() body: any, @User() user: CurrentUser) {
    if (!body.title) throw new ApiError(400, 'VALIDATION', 'title จำเป็น', 'title');
    const wf = await this.wfDefault();
    const initial = await this.db.one(
      `SELECT code FROM ext.wf_state WHERE wf_id = $1 AND is_initial`, [wf.id]);
    const row = await this.db.one(
      `INSERT INTO core.work_order
         (tenant_id, title, description, wo_type_code, priority_code, wf_id, status_code,
          asset_id, location_id, assigned_to, due_date, source, created_by, updated_by)
       VALUES ($1, $2, $3, COALESCE($4,'cm'), COALESCE($5,'normal'), $6, $7,
               $8, $9, $10, $11, COALESCE($12,'manual'), $13, $13)
       RETURNING *`,
      [TENANT_ID, body.title, body.description ?? null, body.wo_type_code, body.priority_code,
       wf.id, initial!.code, body.asset_id ?? null, body.location_id ?? null,
       body.assigned_to ?? null, body.due_date ?? null, body.source, user.id],
    );
    // งานย่อยจาก job plan (EAM-WRK-013)
    if (body.job_plan_id) {
      await this.db.query(
        `INSERT INTO core.work_task (work_order_id, seq, name)
         SELECT $1, seq, name FROM core.job_plan_task WHERE job_plan_id = $2 ORDER BY seq`,
        [row.id, body.job_plan_id],
      );
    }
    await this.db.query(
      `INSERT INTO core.work_log (tenant_id, work_order_id, action, note, created_by)
       VALUES ($1, $2, 'created', $3, $4)`,
      [TENANT_ID, row.id, body.description ?? null, user.id],
    );
    await this.audit.log('work_order', row.id, 'create', { title: body.title }, user.id);
    return row;
  }

  /** เปลี่ยนสถานะผ่าน state machine ที่ config ได้ (EAM-WRK-003 / EAM-EXT-004) */
  @Post(':id/transitions')
  async transition(@Param('id') id: string, @Body() body: any, @User() user: CurrentUser) {
    if (!body.to) throw new ApiError(400, 'VALIDATION', 'to (state code) จำเป็น', 'to');
    return this.db.tx(async (c) => {
      const wo = (await c.query(
        `SELECT * FROM core.work_order WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL FOR UPDATE`,
        [TENANT_ID, id],
      )).rows[0];
      if (!wo) throw new ApiError(404, 'NOT_FOUND', 'work order not found');

      const tr = (await c.query(
        `SELECT t.*, sf.code AS from_code, st.code AS to_code
         FROM ext.wf_transition t
         JOIN ext.wf_state sf ON sf.id = t.from_state_id
         JOIN ext.wf_state st ON st.id = t.to_state_id
         WHERE t.wf_id = $1 AND sf.code = $2 AND st.code = $3`,
        [wo.wf_id, wo.status_code, body.to],
      )).rows[0];
      if (!tr)
        throw new ApiError(422, 'INVALID_TRANSITION',
          `เปลี่ยนจาก '${wo.status_code}' ไป '${body.to}' ไม่ได้ตาม workflow`);
      if (tr.required_role && tr.required_role !== user.role_code && user.role_code !== 'admin')
        throw new ApiError(403, 'ROLE_REQUIRED',
          `การกระทำนี้ต้องเป็น ${tr.required_role}`);

      const row = (await c.query(
        `UPDATE core.work_order SET status_code = $1, updated_at = now(), updated_by = $2,
                row_version = row_version + 1
         WHERE id = $3 RETURNING *`,
        [body.to, user.id, id],
      )).rows[0];
      await c.query(
        `INSERT INTO core.work_log (tenant_id, work_order_id, action, detail, note, created_by)
         VALUES ($1, $2, 'transition', $3, $4, $5)`,
        [TENANT_ID, id, JSON.stringify({ from: wo.status_code, to: body.to }), body.note ?? null, user.id],
      );
      await this.audit.log('work_order', id, 'transition',
        { status: { from: wo.status_code, to: body.to } }, user.id, c);
      return row;
    });
  }

  @Patch(':id/tasks/:taskId')
  async toggleTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: any,
    @User() user: CurrentUser,
  ) {
    const row = await this.db.one(
      `UPDATE core.work_task SET is_done = $1, done_by = $2, done_at = CASE WHEN $1 THEN now() END
       WHERE id = $3 AND work_order_id = $4 RETURNING *`,
      [!!body.is_done, user.id, taskId, id],
    );
    if (!row) throw new ApiError(404, 'NOT_FOUND', 'task not found');
    return row;
  }

  private async wfDefault() {
    const wf = await this.db.one(
      `SELECT id FROM ext.wf_definition
       WHERE tenant_id = $1 AND entity = 'work_order' AND deleted_at IS NULL
       ORDER BY created_at LIMIT 1`,
      [TENANT_ID],
    );
    if (!wf) throw new ApiError(500, 'NO_WORKFLOW', 'ยังไม่มี workflow ของ work_order — ตรวจ seed');
    return wf;
  }

  private async availableTransitions(wfId: string, fromCode: string) {
    return this.db.query(
      `SELECT st.code AS to, t.name_th, t.name_en, t.required_role
       FROM ext.wf_transition t
       JOIN ext.wf_state sf ON sf.id = t.from_state_id
       JOIN ext.wf_state st ON st.id = t.to_state_id
       WHERE t.wf_id = $1 AND sf.code = $2 ORDER BY t.sort_order`,
      [wfId, fromCode],
    );
  }
}
