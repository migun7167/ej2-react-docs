import { Controller, Get, Injectable, Logger, Post } from '@nestjs/common';
import { DbService, TENANT_ID } from './db.service';

@Injectable()
export class PmService {
  private readonly log = new Logger('PM');
  constructor(private readonly db: DbService) {}

  /**
   * สร้างใบสั่งงานจาก PM schedule ที่ถึงกำหนดภายใน lead time (EAM-PM-001/004)
   * idempotent: unique (pm_schedule_id, pm_due_date) — รันซ้ำไม่สร้างซ้ำ
   */
  async generateDue(): Promise<{ generated: number }> {
    const due = await this.db.query(
      `SELECT s.*, jp.name AS jp_name
       FROM core.pm_schedule s
       LEFT JOIN core.job_plan jp ON jp.id = s.job_plan_id
       WHERE s.tenant_id = $1 AND s.deleted_at IS NULL AND s.is_active
         AND s.schedule_type = 'time'
         AND s.next_due_date IS NOT NULL
         AND s.next_due_date <= current_date + (s.lead_time_days || ' days')::interval`,
      [TENANT_ID],
    );
    const wf = await this.db.one(
      `SELECT d.id, s.code AS initial FROM ext.wf_definition d
       JOIN ext.wf_state s ON s.wf_id = d.id AND s.is_initial
       WHERE d.tenant_id = $1 AND d.entity = 'work_order' AND d.deleted_at IS NULL
       ORDER BY d.created_at LIMIT 1`,
      [TENANT_ID],
    );
    if (!wf) return { generated: 0 };

    let generated = 0;
    for (const s of due) {
      await this.db.tx(async (c) => {
        const wo = (await c.query(
          `INSERT INTO core.work_order
             (tenant_id, title, wo_type_code, priority_code, wf_id, status_code,
              asset_id, due_date, source, pm_schedule_id, pm_due_date)
           VALUES ($1, $2, 'pm', 'normal', $3, $4, $5, $6, 'pm', $7, $6)
           ON CONFLICT (pm_schedule_id, pm_due_date) WHERE pm_schedule_id IS NOT NULL
           DO NOTHING
           RETURNING id`,
          [TENANT_ID, `[PM] ${s.name}`, wf.id, wf.initial, s.asset_id, s.next_due_date, s.id],
        )).rows[0];
        if (wo) {
          generated++;
          if (s.job_plan_id) {
            await c.query(
              `INSERT INTO core.work_task (work_order_id, seq, name)
               SELECT $1, seq, name FROM core.job_plan_task WHERE job_plan_id = $2 ORDER BY seq`,
              [wo.id, s.job_plan_id],
            );
          }
          await c.query(
            `INSERT INTO core.work_log (tenant_id, work_order_id, action, detail)
             VALUES ($1, $2, 'created', $3)`,
            [TENANT_ID, wo.id, JSON.stringify({ source: 'pm', schedule: s.code })],
          );
        }
        // เลื่อนรอบถัดไปเสมอ (แม้ใบงานมีอยู่แล้วจาก run ก่อน)
        await c.query(
          `UPDATE core.pm_schedule
           SET next_due_date = next_due_date + (interval_days || ' days')::interval,
               updated_at = now()
           WHERE id = $1 AND next_due_date <= current_date + (lead_time_days || ' days')::interval`,
          [s.id],
        );
      });
    }
    if (generated) this.log.log(`generated ${generated} PM work orders`);
    return { generated };
  }
}

@Controller('api/v1/pm-schedules')
export class PmController {
  constructor(private readonly db: DbService, private readonly pm: PmService) {}

  @Get()
  async list() {
    return {
      data: await this.db.query(
        `SELECT s.id, s.code, s.name, s.schedule_type, s.interval_days, s.lead_time_days,
                s.next_due_date, s.is_active, a.code AS asset_code, a.name AS asset_name,
                jp.name AS job_plan_name
         FROM core.pm_schedule s
         LEFT JOIN core.asset a ON a.id = s.asset_id
         LEFT JOIN core.job_plan jp ON jp.id = s.job_plan_id
         WHERE s.tenant_id = $1 AND s.deleted_at IS NULL ORDER BY s.next_due_date`,
        [TENANT_ID],
      ),
    };
  }

  /** trigger ด้วยมือ (ปกติ worker รันให้ทุกคืน) */
  @Post('generate')
  async generate() {
    return this.pm.generateDue();
  }
}
