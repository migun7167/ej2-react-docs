import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Pool, PoolClient } from 'pg';

export const TENANT_ID =
  process.env.TENANT_ID ?? '00000000-0000-0000-0000-000000000001';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger('Db');
  readonly pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/eam',
    max: 10,
  });

  async onModuleInit() {
    if (process.env.RUN_MIGRATIONS === 'true') {
      await this.migrate();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const res = await this.pool.query(sql, params);
    return res.rows as T[];
  }

  async one<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return (await this.query<T>(sql, params))[0];
  }

  async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const out = await fn(client);
      await client.query('COMMIT');
      return out;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /** รัน SQL migrations ตามลำดับชื่อไฟล์ + seed (idempotent) — ใช้ advisory lock กันชนกันเมื่อ api หลาย replica */
  private async migrate() {
    const dir = process.env.MIGRATIONS_DIR ?? join(process.cwd(), 'db');
    const client = await this.pool.connect();
    try {
      await client.query('SELECT pg_advisory_lock(729384)');
      await client.query(`CREATE SCHEMA IF NOT EXISTS meta;
        CREATE TABLE IF NOT EXISTS meta.migrations (
          name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
      const migDir = join(dir, 'migrations');
      for (const f of readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort()) {
        const done = await client.query('SELECT 1 FROM meta.migrations WHERE name = $1', [f]);
        if (done.rowCount) continue;
        this.log.log(`applying migration ${f}`);
        await client.query(readFileSync(join(migDir, f), 'utf8'));
        await client.query('INSERT INTO meta.migrations (name) VALUES ($1)', [f]);
      }
      const seedFile = join(dir, 'seed', 'seed.sql');
      if (existsSync(seedFile)) {
        await client.query(readFileSync(seedFile, 'utf8'));
      }
      this.log.log('migrations + seed done');
    } finally {
      await client.query('SELECT pg_advisory_unlock(729384)');
      client.release();
    }
  }
}
