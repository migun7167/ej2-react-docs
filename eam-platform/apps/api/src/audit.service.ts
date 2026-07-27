import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DbService, TENANT_ID } from './db.service';

/** เขียน audit จาก service layer (ไม่ใช้ trigger — เพื่อให้มี actor/channel ครบ) */
@Injectable()
export class AuditService {
  constructor(private readonly db: DbService) {}

  async log(
    entityType: string,
    entityId: string,
    action: 'create' | 'update' | 'delete' | 'transition',
    changes: Record<string, unknown>,
    actorId?: string,
    client?: PoolClient,
  ) {
    const sql = `INSERT INTO audit.audit_log (tenant_id, entity_type, entity_id, action, changes, actor_id)
                 VALUES ($1, $2, $3, $4, $5, $6)`;
    const params = [TENANT_ID, entityType, entityId, action, JSON.stringify(changes), actorId ?? null];
    if (client) await client.query(sql, params);
    else await this.db.query(sql, params);
  }

  /** diff เฉพาะ field ที่เปลี่ยน — เก็บ {field: {from, to}} */
  diff(before: Record<string, any>, patch: Record<string, any>) {
    const out: Record<string, { from: unknown; to: unknown }> = {};
    for (const k of Object.keys(patch)) {
      if (JSON.stringify(before[k]) !== JSON.stringify(patch[k])) {
        out[k] = { from: before[k], to: patch[k] };
      }
    }
    return out;
  }
}
