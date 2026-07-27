import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ApiError, CurrentUser, User, nextCursor, parsePage } from './common';
import { AuditService } from './audit.service';
import { DbService, TENANT_ID } from './db.service';

@Injectable()
export class ReadingService {
  constructor(private readonly db: DbService, private readonly audit: AuditService) {}

  /**
   * บันทึกค่าอ่าน (EAM-MTR-004..006) — append-only
   * validation: ค่าถอยหลัง / กระโดดผิดปกติ / rollover
   * ถ้าผิดปกติ ต้องส่ง force=true พร้อม note (ตัดสินใจโดยคน ไม่เขียนทับเงียบ ๆ)
   */
  async addReading(meterId: string, body: any, user: CurrentUser, idempotencyKey?: string) {
    if (idempotencyKey) {
      const seen = await this.db.one(
        `SELECT result FROM audit.idempotency_key WHERE key = $1`, [idempotencyKey]);
      if (seen) return seen.result; // PWA retry เดิม — ตอบผลเดิม ไม่บันทึกซ้ำ
    }
    const value = Number(body.value);
    if (Number.isNaN(value)) throw new ApiError(400, 'VALIDATION', 'value ต้องเป็นตัวเลข', 'value');
    const readingAt = body.reading_at ? new Date(body.reading_at) : new Date();

    const result = await this.db.tx(async (c) => {
      const m = (await c.query(
        `SELECT * FROM core.meter WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL FOR UPDATE`,
        [TENANT_ID, meterId],
      )).rows[0];
      if (!m) throw new ApiError(404, 'NOT_FOUND', 'meter not found');

      let delta: number | null = null;
      let isRollover = false;
      const prev = m.last_reading === null ? null : Number(m.last_reading);

      if (m.reading_kind === 'cumulative' && prev !== null) {
        if (value < prev) {
          // ค่าถอยหลัง: ต้องเป็น rollover หรือ force พร้อมเหตุผล (EAM-MTR-005/006)
          if (body.is_rollover && m.rollover_value !== null) {
            delta = Number(m.rollover_value) - prev + value;
            isRollover = true;
          } else if (body.force && body.note) {
            delta = null;
          } else {
            throw new ApiError(422, 'METER_READING_BACKWARD',
              `ค่าอ่านน้อยกว่าครั้งก่อน (${value} < ${prev}) — ถ้ามิเตอร์วนรอบให้ส่ง is_rollover, ถ้าตั้งใจแก้ให้ส่ง force พร้อม note`,
              'value', { previous: prev });
          }
        } else {
          delta = value - prev;
          // กระโดดผิดปกติ: เกิน 5 เท่าของค่าเฉลี่ย 5 งวดหลัง
          const avg = (await c.query(
            `SELECT avg(delta) AS avg FROM (
               SELECT delta FROM core.meter_reading
               WHERE tenant_id = $1 AND meter_id = $2 AND delta IS NOT NULL
               ORDER BY reading_at DESC LIMIT 5) x`,
            [TENANT_ID, meterId],
          )).rows[0]?.avg;
          if (avg && Number(avg) > 0 && delta > Number(avg) * 5 && !body.force) {
            throw new ApiError(422, 'METER_READING_JUMP',
              `ค่าเพิ่มขึ้น ${delta} ${m.unit} สูงผิดปกติ (เฉลี่ย ${Number(avg).toFixed(1)}) — ตรวจสอบแล้วส่ง force พร้อม note เพื่อยืนยัน`,
              'value', { delta, average: Number(avg) });
          }
        }
      }

      const r = (await c.query(
        `INSERT INTO core.meter_reading
           (tenant_id, meter_id, value, delta, reading_at, reader_id, status, note, source, is_rollover, photo_key, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'ok'), $8, COALESCE($9, 'manual'), $10, $11, $6)
         RETURNING *`,
        [TENANT_ID, meterId, value, delta, readingAt, user.id,
         body.status, body.note ?? null, body.source, isRollover, body.photo_key ?? null],
      )).rows[0];

      await c.query(
        `UPDATE core.meter SET last_reading = $1, last_reading_at = $2,
                updated_at = now(), updated_by = $3, row_version = row_version + 1
         WHERE id = $4`,
        [value, readingAt, user.id, meterId],
      );
      await this.audit.log('meter', meterId, 'update',
        { reading: { to: value, delta, rollover: isRollover } }, user.id, c);
      return r;
    });

    if (idempotencyKey) {
      await this.db.query(
        `INSERT INTO audit.idempotency_key (key, result) VALUES ($1, $2)
         ON CONFLICT (key) DO NOTHING`,
        [idempotencyKey, JSON.stringify(result)],
      );
    }
    return result;
  }
}

@Controller('api/v1/meters')
export class MetersController {
  constructor(
    private readonly db: DbService,
    private readonly readings: ReadingService,
  ) {}

  @Get()
  async list(@Query() q: any) {
    const { limit, afterTs, afterId } = parsePage(q);
    const params: any[] = [TENANT_ID];
    const where = ['m.tenant_id = $1', 'm.deleted_at IS NULL'];
    if (q['filter[type]']) {
      params.push(q['filter[type]']);
      where.push(`m.meter_type_code = $${params.length}`);
    }
    if (q.q) {
      params.push(`%${q.q}%`);
      where.push(`(m.code ILIKE $${params.length} OR m.name ILIKE $${params.length})`);
    }
    if (afterTs) {
      params.push(afterTs, afterId);
      where.push(`(m.created_at, m.id) < ($${params.length - 1}, $${params.length})`);
    }
    params.push(limit);
    const rows = await this.db.query(
      `SELECT m.id, m.code, m.name, m.meter_type_code, m.reading_kind, m.unit,
              m.last_reading, m.last_reading_at, m.created_at,
              a.code AS asset_code, a.name AS asset_name,
              lv.color AS type_color, lv.name_th AS type_name
       FROM core.meter m
       LEFT JOIN core.asset a ON a.id = m.asset_id
       LEFT JOIN ext.lookup_value lv
         ON lv.tenant_id = m.tenant_id AND lv.type_code = 'meter_type' AND lv.code = m.meter_type_code
       WHERE ${where.join(' AND ')}
       ORDER BY m.created_at DESC, m.id DESC LIMIT $${params.length}`,
      params,
    );
    return { data: rows, page: { next_cursor: nextCursor(rows, limit) } };
  }

  @Get(':id/readings')
  async listReadings(@Param('id') id: string, @Query() q: any) {
    const limit = Math.min(parseInt(q.limit ?? '50', 10) || 50, 500);
    return {
      data: await this.db.query(
        `SELECT r.id, r.value, r.delta, r.reading_at, r.status, r.note, r.is_rollover,
                u.display_name AS reader_name
         FROM core.meter_reading r
         LEFT JOIN core.app_user u ON u.id = r.reader_id
         WHERE r.tenant_id = $1 AND r.meter_id = $2
         ORDER BY r.reading_at DESC LIMIT $3`,
        [TENANT_ID, id, limit],
      ),
    };
  }

  @Post(':id/readings')
  async addReading(
    @Param('id') id: string,
    @Body() body: any,
    @User() user: CurrentUser,
    @Headers('idempotency-key') idem?: string,
  ) {
    return this.readings.addReading(id, body, user, idem);
  }
}
